import Navbar from "@/components/navbar/Navbar";
import Head from "next/head";
import React from "react";
import styles from "./layout.module.css";
import MaintenanceBanner from '@/components/banner/MaintenanceBanner';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Head>
        <title>ChatBTC</title>
        <meta name="description" content="A conversational AI based on technical bitcoin sources" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="favicon.ico" type="image/x-icon" />
        <meta property="og:image" content="https://chat.bitcoinsearch.xyz/chat-btc-square.png"></meta>
        <meta property="og:title" content="ChatBTC"></meta>
        <meta property="og:url" content="https://chat.bitcoinsearch.xyz"></meta>
        <meta property="og:description" content="A conversational AI based on technical bitcoin sources"></meta>
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:image" content="https://chat.bitcoinsearch.xyz/chat-btc-landscape_v1.png"></meta>
      </Head>
      <div className={styles.app_container}>
        <MaintenanceBanner />
        <Navbar />
        <div className={styles.child_container}>
          {children}
        </div>
      </div>
      <script async src="https://visits.bitcoindevs.xyz/script.js" data-website-id="3ec81b2a-ffba-41cb-91b0-68c30f8bea85"></script>
    </>
  );
};

export default Layout;
