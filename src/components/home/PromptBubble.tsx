import { Box, Button, Grid, Text } from "@chakra-ui/react";
import React from "react";

type PromptBubbleProps = { text: string; author: string; onPrompt: () => void };

const PromptBubble = ({ text, author, onPrompt }: PromptBubbleProps) => {
  return (
    <Box
      role="button"
      w="full"
      // maxW="224px"
      bgColor={"gray.500"}
      placeItems="center"
      p={2}
      rounded="xl"
      onClick={onPrompt}
      cursor={"pointer"}
      _hover={{ bgColor: "orange.200", color: "gray.700" }}
      _active={{ bgColor: "orange.300", color: "gray.700" }}
    >
      <Text
        fontSize={{ base: "10px", md: "14px" }}
        fontWeight={{ base: 600, md: 500 }}
        textAlign="center"
      >
        {text}
      </Text>
    </Box>
  );
};

export default PromptBubble;
