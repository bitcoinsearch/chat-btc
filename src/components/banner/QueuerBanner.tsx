import { CancelIcon } from "@/chakra/custom-chakra-icons";
import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import styles from "./banner.module.css";

const BANNER_KEY = "queuer-banner";

const QueuerBanner = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(BANNER_KEY, "hidden");
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const banner_in_session = window.sessionStorage.getItem(BANNER_KEY);
    if (banner_in_session === "hidden") {
      setIsOpen(false);
    } else {
      setIsOpen(true)
    }
  }, []);

  // if (queuerBanner == "hidden") return null;
  if (!isOpen) return null;
  return (
    <Flex className={styles.banner} bgColor="orange.100" alignItems="center" position="sticky" top="0px" zIndex={99}>
      <Flex grow={1} fontSize={{base: "12px", md: "16px"}} paddingInline={{base: 2, md: 10}} justifyContent="space-between">
        <Box color={"gray.600"} flex="1 1 100%" fontWeight="medium" textAlign="center">
          <Link href="https://learning.chaincode.com/#FOSS" target="_blank">
            <span>{`Start Your Career in Bitcoin Open Source`}</span>
            <br />
            <span>{`Development in 2024 `}</span>
            <span
              style={{
                fontWeight: "medium",
                textTransform: "uppercase",
                color: "#ED8936",
                textDecoration: "underline",
              }}
            >{`Apply Today!`}</span>
          </Link>
        </Box>
      </Flex>
      <IconButton
        variant="ghost"
        colorScheme="orange"
        aria-label="close"
        onClick={handleClose}
        icon={<CancelIcon />}
      />
    </Flex>
  );
};

export default QueuerBanner;
