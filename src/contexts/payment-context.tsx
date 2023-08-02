import axios from "axios";
import React, { createContext } from "react";

import { Invoice } from "@/types";
import { generateToken, saveAutoPayToken } from "@/utils/token";
import { requestProvider } from "webln";

type PaymentContextType = {
  invoice: Invoice;
  loading: boolean;
  error: string;
  setError: (err: string) => void;
  isPaymentModalOpen: boolean;
  isPaymentSettled: boolean;
  closePaymentModal: () => void;
  requestPayment: () => Promise<Invoice>;
  requestPaymentToken: () => Promise<{ token: string }>;
  setIsPaymentSettled: (isPaymentSettled: boolean) => void;
  payWithWebln: () => void;
  selectTieredPayment: (tier: PaymentTier) => Promise<void>;
  autoPaymentInvoice: Invoice;
  autoPaymentTier: PaymentTier | null;
  autoPaymentLoading: boolean;
  isAutoPaymentSettled: boolean;
};

export type PaymentTier = {
  id: number;
  priceInSats: number;
  timeInHours: string;
};

const defaultInvoice = {
  payment_request: "",
  r_hash: "",
};

export const paymentTierList: PaymentTier[] = [
  { id: 1, priceInSats: 500, timeInHours: "6" },
  { id: 2, priceInSats: 1000, timeInHours: "24" },
  { id: 3, priceInSats: 5000, timeInHours: "168" },
];

export const PRICE_PER_PROMPT = 50;

const PaymentContext = createContext<PaymentContextType>(null!);

export const PaymentContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [invoice, setInvoice] = React.useState(defaultInvoice);
  const [autoPaymentInvoice, setAutoPaymentInvoice] =
    React.useState(defaultInvoice);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [paymentToken, setPaymentToken] = React.useState("");
  const [autoPaymentLoading, setAutoPaymentLoading] = React.useState(false);
  const [autoPaymentTier, setAutoPaymentTier] =
    React.useState<PaymentTier | null>(null);
  const [isAutoPaymentSettled, setIsAutoPaymentSettled] = React.useState(false);
  const [isPaymentSettled, setIsPaymentSettled] = React.useState(false);

  const paymentTokenRef = React.useRef<string>(paymentToken);
  paymentTokenRef.current = paymentToken;

  const requestPayment = React.useCallback(async () => {
    setIsPaymentSettled(false);
    setLoading(true);
    setIsPaymentModalOpen(true);
    const response = await axios.post("/api/invoice");
    if (response.status !== 200) {
      setError("Error generating invoice");
      setLoading(false);
      return defaultInvoice;
    }
    const { payment_request, r_hash } = response.data;
    setInvoice({ payment_request, r_hash });
    setLoading(false);
    return { payment_request, r_hash };
  }, []);

  const requestAutoPayment = React.useCallback(async (priceInSats: number) => {
    setIsAutoPaymentSettled(false);
    setAutoPaymentInvoice(defaultInvoice);
    setAutoPaymentLoading(true);
    const response = await axios.post("/api/invoice", {
      autoPayment: priceInSats,
    });
    if (response.status !== 200) {
      setError("Error generating invoice");
      setAutoPaymentLoading(false);
      return defaultInvoice;
    }
    const { payment_request, r_hash } = response.data;
    setAutoPaymentInvoice({ payment_request, r_hash });
    setAutoPaymentLoading(false);
    return { payment_request, r_hash };
  }, []);

  const payWithWebln = async () => {
    try {
      const webln = await requestProvider();
      if (!webln) {
        setError("webln not available");
      }
      const res = await webln.sendPayment(invoice.payment_request);
      if (res instanceof Error) {
        setError("could not pay with webln");
      }
    } catch (error) {
      setError("could not pay with webln");
    }
  };

  const selectTieredPayment = async (tier: PaymentTier) => {
    if (autoPaymentTier?.id === tier.id) return;
    setAutoPaymentTier(tier);
    requestAutoPayment(tier.priceInSats);
  };

  const requestPaymentToken = React.useCallback(async () => {
    const paymentToken = paymentTokenRef.current;
    if (paymentToken) {
      return { token: paymentToken };
    }
    const token = await generateToken(
      invoice.payment_request,
      autoPaymentTier?.timeInHours
    );
    setPaymentToken(token);
    return { token };
  }, [invoice.payment_request, autoPaymentTier?.timeInHours]);

  const closePaymentModal = React.useCallback(() => {
    if (!isPaymentSettled) {
      setInvoice(defaultInvoice);
    }
    if (!isAutoPaymentSettled) {
      setAutoPaymentInvoice(defaultInvoice);
    }
    setLoading(false);
    setIsPaymentSettled(false);
    setIsPaymentModalOpen(false);
    setAutoPaymentLoading(false);
    setIsAutoPaymentSettled(false);
    setAutoPaymentTier(null);
  }, [isPaymentSettled, isAutoPaymentSettled]);

  React.useEffect(() => {
    if (invoice.r_hash) {
      const intervalId = setInterval(async () => {
        try {
          const response = await axios.post("/api/invoice/status", {
            r_hash: invoice.r_hash,
          });
          if (response.status === 200) {
            const { settled } = response.data;
            console.log("settled", settled);
            if (settled) {
              setIsPaymentSettled(true);
              setIsPaymentModalOpen(false);
              setInvoice(defaultInvoice);
              clearInterval(intervalId);
            }
          }
        } catch (error) {
          console.log("Error polling payment status:", error);
        }
      }, 3000);

      return () => {
        clearInterval(intervalId);
      };
    }
    setIsPaymentSettled(false);
  }, [invoice.r_hash]);

  React.useEffect(() => {
    if (autoPaymentInvoice.r_hash) {
      const intervalId = setInterval(async () => {
        try {
          const response = await axios.post("/api/invoice/status", {
            r_hash: autoPaymentInvoice.r_hash,
          });
          if (response.status === 200) {
            const { settled } = response.data;
            if (settled) {
              setIsAutoPaymentSettled(true);
              setIsPaymentModalOpen(false);
              setAutoPaymentInvoice(defaultInvoice);
              clearInterval(intervalId);
              await saveAutoPayToken(autoPaymentInvoice.r_hash);
            }
          }
        } catch (error) {
          console.log("Error polling payment status:", error);
        }
      }, 3000);

      return () => {
        clearInterval(intervalId);
      };
    }
    setIsPaymentSettled(false);
  }, [autoPaymentInvoice.r_hash]);

  return (
    <PaymentContext.Provider
      value={{
        invoice,
        loading,
        error,
        setError,
        isPaymentModalOpen,
        isPaymentSettled,
        closePaymentModal,
        requestPayment,
        requestPaymentToken,
        setIsPaymentSettled,
        payWithWebln,
        selectTieredPayment,
        autoPaymentInvoice,
        autoPaymentTier,
        autoPaymentLoading,
        isAutoPaymentSettled,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = () => {
  const context = React.useContext(PaymentContext);
  if (!context) {
    throw new Error("usePaymentContext must be used within PaymentContext");
  }
  return context;
};
