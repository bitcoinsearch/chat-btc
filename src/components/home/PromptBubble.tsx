import { PromptAction } from "@/types";
import { Box, Button, Grid, Text } from "@chakra-ui/react";
import React from "react";

type PromptBubbleProps = { text: string; author: string; onPrompt: PromptAction };

const PromptBubble = ({ text, author, onPrompt }: PromptBubbleProps) => {
  const handlePromptClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onPrompt(text, author)
  }
  return (
    <Box
      role="button"
      w="full"
      // maxW="224px"
      bgColor={"gray.500"}
      placeItems="center"
      p={{base: "6px", md: "8px"}}
      rounded={{base: "md", md: "xl"}}
      onClick={handlePromptClick}
      cursor={"pointer"}
      _hover={{ bgColor: "orange.200", color: "gray.700" }}
      _active={{ bgColor: "orange.300", color: "gray.700" }}
    >
      <Text
        fontSize={{ base: "10px", md: "14px" }}
        fontWeight={500}
        textAlign="center"
      >
        {text}
      </Text>
    </Box>
  );
};

export default PromptBubble;
