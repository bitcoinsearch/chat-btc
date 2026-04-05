import { PromptAction } from "@/types";
import { Box, Text, useColorMode, useColorModeValue } from "@chakra-ui/react";
import React from "react";

type PromptBubbleProps = { text: string; author: string; onPrompt: PromptAction };

const PromptBubble = ({ text, author, onPrompt }: PromptBubbleProps) => {
  const handlePromptClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onPrompt(text, author)
  }
  const bg = useColorModeValue("gray.200", "gray.500")
  const textColor = useColorModeValue("gray.800", "white")
  const hoverBg = useColorModeValue("orange.200", "orange.300");
  const activeBg = useColorModeValue("orange.300", "orange.400");
  return (
    <Box
      role="button"
      w="full"
      bgColor={bg}
      color={textColor}
      placeItems="center"
      p={{base: "6px", md: "8px"}}
      rounded={{base: "md", md: "xl"}}
      onClick={handlePromptClick}
      cursor={"pointer"}
      _hover={{ bgColor: hoverBg}}
      _active={{ bgColor: activeBg}}
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
