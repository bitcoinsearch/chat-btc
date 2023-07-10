import { AuthorConfig, PromptAction } from "@/types";
import { Box, Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import PromptBubble from "./PromptBubble";

const AuthorCard = ({
  author,
  onPrompt,
}: {
  author: AuthorConfig;
  onPrompt: PromptAction;
}) => {
  return (
    <>
      <Flex direction="column" gap={3}>
        <Link href={`?author=${author.value}`} shallow={true}>
          <Flex w="full" maxW="150px" mx="auto">
            <Box
              position="relative"
              pt="100%"
              w="full"
              rounded="full"
              overflow="hidden"
              bgColor="blackAlpha.400"
              cursor="pointer"
              _hover={{
                "transform": "translate(0, -2%)",
                transitionDuration: "0.4s",
                dropShadow: "0 0 10px #3345"
              }}
              transitionDuration="0.2s"
            >
              <Image
                src={author.imgURL}
                alt={`author-${author.slug}`}
                fill={true}
              />
            </Box>
          </Flex>
        </Link>
        <Link href={`?author=${author.value}`} shallow={true}>
          <Box textAlign="center" role="group">
            <Text fontWeight={600} _groupHover={{color: "orange.200"}}>{author.name}</Text>
            <Text fontSize="14px" color="gray.400">
              {author.title}
            </Text>
          </Box>
        </Link>
        <Flex direction="column" gap={2}>
          {author.questions.map((question, index) => (
            <PromptBubble
              key={index}
              onPrompt={onPrompt}
              author={author.value}
              text={question}
            />
          ))}
        </Flex>
      </Flex>
    </>
  );
};

export default AuthorCard;
