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
        <Box color={"gray.600"}  fontWeight="medium">
          <Link href="https://review.btctranscripts.com/transcripts" target="_blank">
            <span>{`Get `}</span>
            <span
              style={{
                fontWeight: "medium",
                textTransform: "uppercase",
                color: "#ED8936",
              }}
            >{`paid `}</span>
            <span>{`to review technical Bitcoin transcripts`}</span>
          </Link>
        </Box>
        <Button variant="link" color="orange.400" display={{base: "none", md: "block"}}>
          <Link href="https://review.btctranscripts.com/transcripts" target="_blank">
            BTCTranscripts Review
          </Link>
        </Button>
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
