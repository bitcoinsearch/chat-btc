import '@/styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '@/chakra/chakra-theme'
import type { AppProps } from 'next/app'
import Layout from '@/layout'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme} >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  )
}
