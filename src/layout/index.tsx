import Navbar from "@/components/navbar/Navbar";
import Head from "next/head";
import React from "react";
import styles from "./layout.module.css";

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
        <meta name="twitter:site" content="@chaincodelabs"></meta>
        <meta name="twitter:creator" content="@chaincodelabs"></meta>
      </Head>
      <div className={styles.app_container}>
        <Navbar />
        <div className={styles.child_container}>
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;
