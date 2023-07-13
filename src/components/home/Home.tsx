import { PromptAction } from "@/types";
import authorsConfig from "@/config/authorsConfig";
import { Box, Container, Flex, Grid, Heading, Text, Link } from "@chakra-ui/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import AuthorCard from "./AuthorCard";
import InputTextArea from "./InputTextArea";
import PromptBubble from "./PromptBubble";

type HomePageProps = {
  onPrompt: PromptAction;
};

const HomePage = ({ onPrompt }: HomePageProps) => {
  const handleLandingPagePrompt = (text: string, author: string) => {
    onPrompt(text, author, { startChat: true })
  }
  return (
    <Container maxW="container.lg" centerContent>
      <Box my={10} w="full">
        <Flex
          direction="column"
          alignItems="center"
          // gap={{base: 1, md: 2}}
          w={{ base: "70%", md: "300px", lg: "480px" }}
          mx="auto"
          textAlign="center"
        >
          <Heading fontSize={{ base: "48px", md:"64px", lg: "106px" }} fontWeight={400} >
            chat
            <span style={{ color: "var(--chakra-colors-orange-300)" }}>
              btc
            </span>
          </Heading>
          <Text fontSize={{ base: "20px", md: "28px", lg: "36px" }} fontWeight={300}>
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
              onPrompt={handleLandingPagePrompt}
            />
            <PromptBubble
              text="Why is SegWit a useful upgrade?"
              author=""
              onPrompt={handleLandingPagePrompt}
            />
            <PromptBubble
              text="Why would we want PTLCs rather than HTLCs?"
              author=""
              onPrompt={handleLandingPagePrompt}
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
        <Container maxW="2xl">
          <Flex
            fontSize={{ base: "12px", md: "16px" }}
            color="gray.400"
            direction="column"
            gap={2}
            mt={4}
          >
            <Text>
              All characters are, of course, fake and do not represent the
              actual thoughts and opinions of real people. These are AI
              responses that are informed by some of these authors public
              writings.
            </Text>
          </Flex>
        </Container>
        <Grid
          templateColumns={{ base: "1fr 1fr", sm: "1fr 1fr 1fr 1fr" }}
          gap={{ base: 6, md: 14 }}
          mt={{ base: 6, md: 10 }}
        >
          {authorsConfig.length
            ? authorsConfig.map((author) => (
                <AuthorCard
                  onPrompt={handleLandingPagePrompt}
                  key={author.slug}
                  author={author}
                />
              ))
            : null}
        </Grid>
      </Box>
      <Box my={10}>
        <Container maxW="2xl">
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
                ChatBTC is designed to help you learn about bitcoin technology
                and the history of how it was built. All the data is sourced
                from the bitcoin-dev mailing list, Bitcointalk, Lightning dev
                mailing list, Bitcoin StackExchange, Bitcoin Optech, and BTC
                Transcripts.
              </Text>
            </Flex>
            <Text
              fontSize={{ base: "16px", md: "20px" }}
              color="gray.200"
              textAlign="center"
            >
              Built with ❤️ by {" "}
              <Link href="https://chaincode.com" isExternal color="yellow.200">
                Chaincode Labs
              </Link>
            </Text>
            <Link
              href="https://cryptpad.fr/form/#/2/form/view/3P2CsohsHOkcH7C+WdtX0-tvqjBHqXnAmz5D9yx0e04/"
              isExternal
              fontSize={{ base: "12px", md: "16px" }}
              color="orange.200"
              textAlign="center"
            >
              Submit Feedback
            </Link>
          </Flex>
        </Container>
      </Box>
    </Container>
  );
};

export default HomePage;
