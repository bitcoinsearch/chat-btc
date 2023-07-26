import authorsConfig from "@/config/authorsConfig";
import useScrollEffectContainer from "@/hooks/useScrollEffectContainer";
import { PromptAction } from "@/types";
import {
  Box,
  Container, Flex,
  Grid,
  Heading, Link, Text
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useEffect, useRef } from "react";
import AuthorCard from "./AuthorCard";
import styles from "./home.module.css";
import InputTextArea from "./InputTextArea";
import PromptBubble from "./PromptBubble";

type HomePageProps = {
  onPrompt: PromptAction;
};

type SectionName = "chat" | "authors" | "about";

const HomePage = ({ onPrompt }: HomePageProps) => {
  const handleLandingPagePrompt = (text: string, author: string) => {
    onPrompt(text, author, { startChat: true });
  };
  const fullScreenContainer = useRef<HTMLDivElement>(null);
  useScrollEffectContainer({ containerRef: fullScreenContainer });

  return (
    <>
      <Box
        display={{ base: "none", md: "block" }}
        position={"fixed"}
        right={0}
        top={14}
        mr={6}
        zIndex={1}
      >
        <Container maxW="2xl">
          <Flex
            direction="column"
            alignItems="center"
            fontSize="12px"
            color="gray.300"
          >
            <InLink name="chat" />
            <Box w="1px" rounded="sm" bgColor="whiteAlpha.600" h={4} />
            <InLink name="authors" />
            <Box w="1px" rounded="sm" bgColor="whiteAlpha.600" h={4} />
            <InLink name="about" />
          </Flex>
        </Container>
      </Box>
      <Box
        className={styles.full_screen_section}
        ref={fullScreenContainer}
        bgColor="brand.bg_base_purple"
      >
        <Box
          id="chat"
          pt={{ base: 4, md: 10 }}
          bgGradient="linear(to-b, gray.900, brand.bg_base_purple)"
        >
          <Container maxW="container.lg">
            <Flex
              direction="column"
              alignItems="center"
              w={{ base: "70%", md: "300px", lg: "480px" }}
              mx="auto"
              mt={{ base: "15vh", md: 16, lg: 32 }}
              textAlign="center"
            >
              <Heading
                fontSize={{ base: "48px", md: "64px", lg: "106px" }}
                fontWeight={400}
              >
                chat
                <span style={{ color: "var(--chakra-colors-orange-300)" }}>
                  btc
                </span>
              </Heading>
              <Text
                fontSize={{ base: "20px", md: "28px", lg: "36px" }}
                fontWeight={300}
              >
                Learn about bitcoin technology and history
              </Text>
            </Flex>
            <Flex
              direction="column"
              gap={{ base: 16, sm: 5 }}
              w={{ base: "full", lg: "800px" }}
              justifyContent="center"
              mx="auto"
            >
              <Grid
                templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }}
                w={{ base: "80%", sm: "full" }}
                gap={{ base: 4, md: 8 }}
                mt={{ base: 14, md: 16 }}
                mx="auto"
              >
                <PromptBubble
                  text="What are some approaches to mitigating fee sniping?"
                  author="holocat"
                  onPrompt={handleLandingPagePrompt}
                />
                <PromptBubble
                  text="Why is SegWit a useful upgrade?"
                  author="holocat"
                  onPrompt={handleLandingPagePrompt}
                />
                <PromptBubble
                  text="Why would we want PTLCs rather than HTLCs?"
                  author="holocat"
                  onPrompt={handleLandingPagePrompt}
                />
              </Grid>
              <Box w="100%">
                <InputTextArea submitInput={onPrompt} />
              </Box>
            </Flex>
          </Container>
        </Box>
        <Box
          id="authors"
          position="relative"
          pt={{ base: 4, md: 10 }}
          display="flex"
          alignItems={"center"}
        >
          <Box
            position="absolute"
            className={styles.bg_blur_container}
            top="15%"
            left="10%"
            w="30%"
            zIndex={0}
          >
            <Box
              backgroundColor="#ff9966"
              className={styles.bg_blur_ring}
            ></Box>
          </Box>
          <Box
            position="absolute"
            className={styles.bg_blur_container}
            top="15%"
            right="10%"
            w="30%"
            zIndex={0}
          >
            <Box
              backgroundColor="#ff5e62"
              className={styles.bg_blur_ring}
            ></Box>
          </Box>
          <Box
            position="absolute"
            className={styles.bg_blur_container}
            top="40%"
            left="35%"
            w="35%"
            zIndex={0}
          >
            <Box
              backgroundColor="#a17fe0"
              className={styles.bg_blur_ring}
            ></Box>
          </Box>
          <Container position="relative" maxW="container.lg" centerContent>
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
              mt={{ base: 10, md: 24 }}
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
          </Container>
        </Box>
        <Box id="about" py={10} display="flex" alignItems={"center"}>
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
                  from the bitcoin-dev mailing list, Lightning dev
                  mailing list, Bitcoin StackExchange, Bitcoin Optech, and BTC
                  Transcripts.
                </Text>
              </Flex>
              <Text
                fontSize={{ base: "16px", md: "20px" }}
                color="grey.200"
                textAlign="center"
              >
                Built with ❤️ by bitcoiners
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
      </Box>
    </>
  );
};

export default HomePage;

const InLink = ({ name }: { name: SectionName }) => {
  const locationRef = useRef<Location>();
  const isActive = locationRef?.current?.hash === `#${name}`;
  useEffect(() => {
    if (window.location) {
      locationRef.current = window.location;
    }
  }, []);
  return (
    <NextLink href={`#${name}`}>
      <Text
        color={isActive ? "orange.200" : "gray.200"}
        transitionDuration="1s"
      >
        {name}
      </Text>
    </NextLink>
  );
};
