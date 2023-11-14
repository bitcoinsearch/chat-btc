import React, { createContext } from "react";

import { Invoice } from "@/types";
import { requestProvider } from "webln";
import { getLSATDetailsFromHeader } from "@/utils/token";
import { useLocalStorage } from "usehooks-ts";

type PaymentContextType = {
  loading: boolean;
  error: string;
  setError: (err: string) => void;
  isPaymentModalOpen: boolean;
  closePaymentModal: () => void;
  payWithWebln: () => Promise<void>;
  selectTieredPayment: (tier: PaymentTier) => Promise<void>;
  autoPaymentInvoice: Invoice;
  autoPaymentTier: PaymentTier | null;
  autoPaymentLoading: boolean;
  isAutoPaymentSettled: boolean;
  openPaymentModal: () => void;
  resetPayment: () => void;
  setLoading: (loading: boolean) => void;
  paymentCancelled: boolean;
  preferAutoPayment: boolean;
  setPreferAutoPayment: (preferAutoPayment: boolean) => void;
  requestAutoPayment: (priceInSats: number) => Promise<Invoice | undefined>;
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
  const [autoPaymentInvoice, setAutoPaymentInvoice] =
    React.useState(defaultInvoice);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [autoPaymentLoading, setAutoPaymentLoading] = React.useState(false);
  const [autoPaymentTier, setAutoPaymentTier] =
    React.useState<PaymentTier | null>(null);
  const [isAutoPaymentSettled, setIsAutoPaymentSettled] = React.useState(false);
  const [paymentCancelled, setPaymentCancelled] = React.useState(false);
  const [preferAutoPayment, setPreferAutoPayment] = useLocalStorage(
    "prefer-auto-payment",
    false
  );

  const openPaymentModal = React.useCallback(() => {
    setIsPaymentModalOpen(true);
  }, []);

  const autoPayWithWebln = React.useCallback(
    async (invoice?: string) => {
      const payment_request = invoice ?? autoPaymentInvoice.payment_request;
      try {
        const webln = await requestProvider();
        if (!webln) {
          setError("webln not available");
          setIsPaymentModalOpen(true);
          return { error: null, preimage: null };
        }

        const res = await webln.sendPayment(payment_request);
        if (res instanceof Error) {
          setError("could not pay with webln");
          setIsPaymentModalOpen(true);
          return { error: res, preimage: null };
        }

        return { error: null, preimage: res.preimage };
      } catch (error) {
        setError("could not pay with webln");
        return { error, preimage: null };
      }
    },
    [autoPaymentInvoice.payment_request]
  );

  const payWithWebln = async () => {
    const payment_request = autoPaymentInvoice.payment_request;
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

  const requestAutoPayment = React.useCallback(
    async (priceInSats: number) => {
      setIsAutoPaymentSettled(false);
      setAutoPaymentInvoice(defaultInvoice);
      setAutoPaymentLoading(true);
      const response = await fetch("/api/server", {
        method: "POST",
        body: JSON.stringify({ autoPayment: priceInSats }),
      });
      if (response.status === 402) {
        localStorage.removeItem("paymentToken");

        const L402 = response.headers.get("WWW-Authenticate");
        const { token, invoice, r_hash } =
          getLSATDetailsFromHeader(L402!) ?? {};

        localStorage.setItem("paymentToken", token ?? "");
        setAutoPaymentInvoice({ payment_request: invoice!, r_hash: r_hash! });

        if (preferAutoPayment) {
          const { error, preimage } = await autoPayWithWebln(invoice);
          if (preimage && !error) {
            setAutoPaymentLoading(false);
            return;
          }
        }
        setAutoPaymentLoading(false);
        return { payment_request: invoice!, r_hash: r_hash! };
      }
    },
    [autoPayWithWebln, preferAutoPayment]
  );

  const selectTieredPayment = async (tier: PaymentTier) => {
    if (autoPaymentTier?.id === tier.id) return;
    setAutoPaymentTier(tier);
    requestAutoPayment(tier.priceInSats);
  };

  const closePaymentModal = React.useCallback(() => {
    if (!isAutoPaymentSettled) {
      setAutoPaymentInvoice(defaultInvoice);
    }
    setLoading(false);
    setIsPaymentModalOpen(false);
    setAutoPaymentLoading(false);
    setIsAutoPaymentSettled(false);
    setAutoPaymentTier(null);
    setPaymentCancelled(true);
  }, [isAutoPaymentSettled]);

  const resetPayment = React.useCallback(() => {
    setAutoPaymentInvoice(defaultInvoice);
    setIsAutoPaymentSettled(false);
    setAutoPaymentTier(null);
    setPaymentCancelled(false);
  }, []);

  React.useEffect(() => {
    if (autoPaymentInvoice.r_hash) {
      setPaymentCancelled(false);
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

  return (
    <PaymentContext.Provider
      value={{
        loading,
        error,
        setError,
        isPaymentModalOpen,
        closePaymentModal,
        resetPayment,
        payWithWebln,
        selectTieredPayment,
        autoPaymentInvoice,
        autoPaymentTier,
        autoPaymentLoading,
        isAutoPaymentSettled,
        openPaymentModal,
        setLoading,
        paymentCancelled,
        preferAutoPayment,
        setPreferAutoPayment,
        requestAutoPayment,
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
