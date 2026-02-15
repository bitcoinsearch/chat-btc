import { Box, Divider, Flex, Text, Button, useColorMode, useColorModeValue } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  return (
    <Box
      as="nav"
      position={"fixed"}
      h={12}
      w="full"
      boxShadow="md"
      bgColor={bg}
      fontSize="14px"
      isolation="isolate"
      zIndex={1}
    >
      <Flex
        alignItems="center"
        justifyContent={"space-between"}
        h="full"
        px={4}
        bgColor={bg}
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
        <Button onClick={toggleColorMode} size="sm" variant="outline">
          {colorMode === "light" ? "Dark" : "Light"}
        </Button>
      </Flex>
    </Box>
  );
};

export default Navbar;