import "@bitcoin-dev-project/bdp-ui/styles.css";
import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/chakra/chakra-theme";
import type { AppProps } from "next/app";
import Layout from "@/layout";
import { PaymentContextProvider } from "@/contexts/payment-context";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <PaymentContextProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </PaymentContextProvider>
    </ChakraProvider>
  );
}
