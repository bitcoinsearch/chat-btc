import authorsConfig, { AuthorConfig } from "@/utils/authorsConfig";
import { Box, Container, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import AuthorCard from "./AuthorCard";
import InputTextArea from "./InputTextArea";
import PromptBubble from "./PromptBubble";

export type PromptAction = (_x?: string) => void;

const HomePage = () => {
  const onPrompt = () => {};

  return (
    <Container maxW="container.lg" centerContent>
      <Box my={10} w="full">
        <Flex
          direction="column"
          alignItems="center"
          gap={3}
          w={{ base: "full", lg: "800px" }}
          mx="auto"
          textAlign="center"
        >
          <Heading size={{ base: "2xl", lg: "4xl" }}>
            chat
            <span style={{ color: "var(--chakra-colors-orange-400)" }}>
              btc
            </span>
          </Heading>
          <Text fontSize={{ base: "20px", lg: "28px" }}>
            Learn about bitcoin technology and history
          </Text>
        </Flex>
        <Flex
          direction="column"
          gap={5}
          w={{ base: "full", lg: "800px" }}
          justifyContent="center"
          mx="auto"
        >
          <Grid
            templateColumns="1fr 1fr 1fr"
            gap={{ base: 6, md: 8 }}
            mt={{ base: 14, md: 16 }}
          >
            <PromptBubble
              text="What are the benefits of using miniscript?"
              author=""
              onPrompt={onPrompt}
            />
            <PromptBubble
              text="Why is SegWit a useful upgrade?"
              author=""
              onPrompt={onPrompt}
            />
            <PromptBubble
              text="Why would we want PTLCs rather than HTLCs?"
              author=""
              onPrompt={onPrompt}
            />
          </Grid>
          <Box w="100%">
            <InputTextArea submitInput={onPrompt} />
          </Box>
        </Flex>
      </Box>
      <Box w="full" my={10}>
        <Heading
          fontWeight={600}
          fontSize={{ base: "24px", md: "30px" }}
          textAlign="center"
        >
          Pick a bitcoiner to chat with
        </Heading>
        <Grid
          templateColumns={{ base: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }}
          gap={{ base: 6, md: 8 }}
          mt={{ base: 6, md: 10 }}
        >
          {authorsConfig.length
            ? authorsConfig.map((author) => (
                <AuthorCard
                  onPrompt={onPrompt}
                  key={author.slug}
                  author={author}
                />
              ))
            : null}
        </Grid>
      </Box>
      <Box my={10}>
        <Flex direction="column" gap={10} alignItems="center">
          <Heading
            fontWeight={600}
            fontSize={{ base: "24px", md: "30px" }}
            textAlign="center"
          >
            About ChatBTC
          </Heading>
          <Flex
            fontSize={{ base: "16px", md: "20px" }}
            color="gray.400"
            direction="column"
            gap={2}
          >
            <Text>
              ChatBTC is designed to help you learn about bitcoin technology and
              the history of how it was built. All the data is sourced from the
              bitcoin-dev mailing list, Bitcointalk, Lightning dev mailing list,
              Bitcoin StackExchange, Bitcoin Optech, and BTC Transcripts.
            </Text>
            <Text>
              All characters are, of course, fake and do not represent the
              actual thoughts and opinions of real people. These are AI
              responses that are informed by some of these authors public
              writings.
            </Text>
          </Flex>
          <Text
            fontSize={{ base: "16px", md: "20px" }}
            color="gray.200"
            textAlign="center"
          >
            Built with ❤️ by Chaincode Labs.
          </Text>
        </Flex>
      </Box>
    </Container>
  );
};

export default HomePage;
