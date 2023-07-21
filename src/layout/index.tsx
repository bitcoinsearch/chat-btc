import Navbar from "@/components/navbar/Navbar";
import Head from "next/head";
import React from "react";
import styles from "./layout.module.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Head>
        <title>ChatBTC</title>
        <meta name="description" content="Your technical bitcoin copilot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/bitcoin.svg" />
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
