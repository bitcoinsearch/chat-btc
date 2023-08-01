import axios from "axios";
import React, { createContext } from "react";

import { Invoice } from "@/types";
import { generateToken } from "@/utils/token";
import { requestProvider } from "webln";

type PaymentContextType = {
  invoice: Invoice;
  loading: boolean;
  isPaymentModalOpen: boolean;
  isPaymentSettled: boolean;
  closePaymentModal: () => void;
  requestPayment: () => Promise<Invoice>;
  requestPaymentToken: () => Promise<{ token: string }>;
  setIsPaymentSettled: (isPaymentSettled: boolean) => void;
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
  const [invoice, setInvoice] = React.useState({
    payment_request: "",
    r_hash: "",
  });
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [paymentToken, setPaymentToken] = React.useState("");
  const [isPaymentSettled, setIsPaymentSettled] = React.useState(false);

  const paymentTokenRef = React.useRef<string>(paymentToken);
  paymentTokenRef.current = paymentToken;

  const requestPayment = React.useCallback(async () => {
    setIsPaymentSettled(false);
    setLoading(true);
    setIsPaymentModalOpen(true);
    const response = await axios.get("/api/invoice");
    if (response.status !== 200) {
      setError("Error generating invoice");
      setLoading(false);
      return defaultInvoice;
    }
    const { payment_request, r_hash } = response.data;
    setInvoice({ payment_request, r_hash });
    setLoading(false);
    try {
      const webln = await requestProvider();
      if (!webln) {
        console.log("Error: webln not available");
      }
      const res = await webln.sendPayment(payment_request);
      if (res instanceof Error) {
        alert("Error: could not pay with webln");
      }
    } catch (error) {
      alert("Error: could not pay with webln");
      console.log("error", error);
    }
    return { payment_request, r_hash };
  }, []);

  const requestPaymentToken = React.useCallback(async () => {
    const paymentToken = paymentTokenRef.current;
    if (paymentToken) {
      return { token: paymentToken };
    }
    const token = await generateToken(invoice.payment_request);
    setPaymentToken(token);
    return { token };
  }, [invoice.payment_request]);

  const closePaymentModal = React.useCallback(() => {
    if (!isPaymentSettled) {
      setInvoice(defaultInvoice);
    }
    setLoading(false);
    setIsPaymentSettled(false);
    setIsPaymentModalOpen(false);
  }, [isPaymentSettled]);

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
              setInvoice({ payment_request: "", r_hash: "" });
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

  return (
    <PaymentContext.Provider
      value={{
        invoice,
        loading,
        isPaymentModalOpen,
        isPaymentSettled,
        closePaymentModal,
        requestPayment,
        requestPaymentToken,
        setIsPaymentSettled,
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
