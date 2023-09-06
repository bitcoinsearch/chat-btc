import React, { createContext } from "react";

import { Invoice } from "@/types";
import { requestProvider } from "webln";
import { getLSATDetailsFromHeader } from "@/utils/token";

type PaymentContextType = {
  invoice: Invoice;
  loading: boolean;
  error: string;
  setError: (err: string) => void;
  isPaymentModalOpen: boolean;
  isPaymentSettled: boolean;
  closePaymentModal: () => void;
  setIsPaymentSettled: (isPaymentSettled: boolean) => void;
  payWithWebln: (isAutoPayment?: boolean) => void;
  selectTieredPayment: (tier: PaymentTier) => Promise<void>;
  autoPaymentInvoice: Invoice;
  autoPaymentTier: PaymentTier | null;
  autoPaymentLoading: boolean;
  isAutoPaymentSettled: boolean;
  openPaymentModal: () => void;
  setInvoice: (invoice: Invoice) => void;
  resetPayment: () => void;
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
  const [autoPaymentLoading, setAutoPaymentLoading] = React.useState(false);
  const [autoPaymentTier, setAutoPaymentTier] =
    React.useState<PaymentTier | null>(null);
  const [isAutoPaymentSettled, setIsAutoPaymentSettled] = React.useState(false);
  const [isPaymentSettled, setIsPaymentSettled] = React.useState(false);

  const openPaymentModal = React.useCallback(() => {
    setIsPaymentModalOpen(true);
  }, []);

  const requestAutoPayment = React.useCallback(async (priceInSats: number) => {
    setIsAutoPaymentSettled(false);
    setAutoPaymentInvoice(defaultInvoice);
    setAutoPaymentLoading(true);
    const response = await fetch("/api/server", {
      method: "POST",
      body: JSON.stringify({ autoPayment: priceInSats }),
    });
    if (response.status === 402) {
      window.localStorage.removeItem("paymentToken");
      const L402 = response.headers.get("WWW-Authenticate");
      const { token, invoice, r_hash } = getLSATDetailsFromHeader(L402!) ?? {};
      localStorage.setItem("paymentToken", token ?? "");
      setAutoPaymentInvoice({ payment_request: invoice!, r_hash: r_hash! });
      setAutoPaymentLoading(false);
      return { payment_request: invoice!, r_hash: r_hash! };
    }
  }, []);

  const payWithWebln = async (isAutoPayment?: boolean) => {
    const payment_request = isAutoPayment
      ? autoPaymentInvoice.payment_request
      : invoice.payment_request;
    try {
      const webln = await requestProvider();
      if (!webln) {
        setError("webln not available");
      }
      const res = await webln.sendPayment(payment_request);
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
      setIsPaymentSettled(false);
      setIsAutoPaymentSettled(false);
      const intervalId = setInterval(async () => {
        try {
          const response = await fetch("/api/invoice/status", {
            method: "POST",
            body: JSON.stringify({ r_hash: invoice.r_hash }),
          });
          if (response.status === 200) {
            const { settled } = await response.json();
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
  }, [invoice.r_hash]);

  React.useEffect(() => {
    if (autoPaymentInvoice.r_hash) {
      setIsPaymentSettled(false);
      setIsAutoPaymentSettled(false);
      const intervalId = setInterval(async () => {
        try {
          const response = await fetch("/api/invoice/status", {
            method: "POST",
            body: JSON.stringify({ r_hash: autoPaymentInvoice.r_hash }),
          });
          if (response.status === 200) {
            const { settled } = await response.json();
            if (settled) {
              setIsAutoPaymentSettled(true);
              setIsPaymentModalOpen(false);
              setAutoPaymentInvoice(defaultInvoice);
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
  }, [autoPaymentInvoice.r_hash]);

  const resetPayment = React.useCallback(() => {
    setInvoice(defaultInvoice);
    setAutoPaymentInvoice(defaultInvoice);
    setIsPaymentSettled(false);
    setIsAutoPaymentSettled(false);
    setAutoPaymentTier(null);
  }, []);

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
        setIsPaymentSettled,
        resetPayment,
        payWithWebln,
        selectTieredPayment,
        autoPaymentInvoice,
        autoPaymentTier,
        autoPaymentLoading,
        isAutoPaymentSettled,
        openPaymentModal,
        setInvoice,
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
