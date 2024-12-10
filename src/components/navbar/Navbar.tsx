import { Box, Container, Divider, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import BossBanner from "../banner/BossBanner";
import { useRouter } from "next/router";

const Navbar = () => {
  const router = useRouter();
  const isHomeScreen = Object.keys(router.query).length < 1;
  return (
    <Box
      as="nav"
      position="sticky"
      minH={12}
      top={"0px"}
      w="full"
      boxShadow="md"
      bgColor="gray.900"
      fontSize="14px"
      isolation="isolate"
      zIndex={1}
    >
      {isHomeScreen && <BossBanner />}
      <Flex
        alignItems="center"
        h="full"
        px={4}
        bgColor="gray.900"
        zIndex={1}
      >
        <Link href="/">
          <Text>
            chat
            <span style={{ color: "var(--chakra-colors-orange-400)" }}>
              btc
            </span>
          </Text>
        </Link>
        <Box h="full" mx={4} py={2}>
          <Divider orientation="vertical" />
        </Box>
      </Flex>
    </Box>
  );
};

export default Navbar;