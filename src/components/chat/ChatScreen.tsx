import { SendIcon } from "@/chakra/custom-chakra-icons";
import MessageBox, { Message } from "@/components/message/message";
import Rating from "@/components/rating/Rating";
import authorsConfig, {
  AUTHOR_QUERY,
  deriveAuthorIntroduction,
} from "@/config/authors-config";
import {
  Box,
  Button,
  Container,
  Flex,
  IconButton,
  Text,
  Textarea,
} from "@chakra-ui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { v4 as uuidv4 } from "uuid";
import { PromptAction } from "@/types";
import { handleTextAreaChange } from "@/utils/text";
import useUpdateRouterQuery from "@/hooks/useUpdateRouterQuery";

type ChatProps = {
  userInput: string;
  streamData: Message;
  messages: Message[];
  startChat: PromptAction;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  loading: boolean;
  streamLoading: boolean;
  stopGenerating: () => void;
};

const blippy = authorsConfig[0];

const ChatScreen = ({
  userInput,
  streamData,
  messages,
  startChat,
  handleInputChange,
  loading,
  streamLoading,
  stopGenerating,
}: ChatProps) => {
  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const initMessageListHeight = useRef(
    messageListRef.current?.scrollHeight ?? 0,
  );

  const router = useRouter();
  const authorQuery = router.query[AUTHOR_QUERY];
  const searchParams = new URLSearchParams(window.location.search);

  const updateRouterQuery = useUpdateRouterQuery();

  const author = useMemo(() => {
    let authorInConfig = authorsConfig.find(
      (authorConfig) => authorConfig.slug === authorQuery,
    );
    if (!authorQuery || !authorInConfig) {
      updateRouterQuery(AUTHOR_QUERY, blippy.slug);
    }
    return authorInConfig || blippy;
  }, [authorQuery, updateRouterQuery]);

  const authorInitialDialogue: Message = useMemo(() => {
    return {
      type: "authorMessage",
      message: author.introduction ?? deriveAuthorIntroduction(author.name),
      uniqueId: "",
    };
  }, [author]);

  const [userHijackedScroll, setUserHijackedScroll] = useState(false);

  const chatList: Message[] = [authorInitialDialogue, ...messages];

  // Auto scroll chat to bottom
  useEffect(() => {
    const messageList = messageListRef.current;
    if (userHijackedScroll) return;
    if (!messageList) return;
    const listHeight = messageList.scrollHeight;
    const scrollBottom = messageList.scrollHeight - messageList.clientHeight;
    if (listHeight > initMessageListHeight.current) {
      messageList.scrollTo({ top: scrollBottom, behavior: "smooth" });
      initMessageListHeight.current = listHeight;
    }
  }, [streamData, userHijackedScroll]);

  // scroll to last message (user text after submit)
  useEffect(() => {
    if (userHijackedScroll || streamLoading) return;
    const messageList = messageListRef.current;
    if (messageList) {
      const scrollBottom = messageList.scrollHeight - messageList.clientHeight;
      messageList.scrollTo({ top: scrollBottom, behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUserHijackedScroll(false);
    startChat(userInput, author.slug, { startChat: true });
  };

  // Prevent blank submissions and allow for multiline input
  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isMobile) {
        e.preventDefault();
      } else {
        if (!e.shiftKey && userInput) {
          handleSubmit(e);
        }
      }
    }
  };

  const handleFollowUpQuestion = (question: string) => {
    startChat(question, author.slug, { startChat: true });
  };

  useEffect(() => {
    const messageListBox = messageListRef.current;
    if (!messageListBox) return;
    let initScroll = messageListBox.scrollTop;
    const handleScroll = (e: Event) => {
      const hasScrolledUp = messageListBox.scrollTop < initScroll;
      const hasScrolledToBottom =
        messageListBox.scrollTop + messageListBox.clientHeight ===
        messageListBox.scrollHeight;
      initScroll = messageListBox.scrollTop;
      if (hasScrolledUp && streamLoading) {
        setUserHijackedScroll(true);
      }
      // return hijackedScroll back to generator
      if (hasScrolledToBottom && streamLoading && userHijackedScroll) {
        setUserHijackedScroll(false);
      }
    };
    messageListBox.addEventListener("scroll", handleScroll);
    return () => {
      messageListBox.removeEventListener("scroll", handleScroll);
    };
  }, [messageListRef, streamLoading, userHijackedScroll]);

  // add columns to textarea for multiline text
  useEffect(() => {
    if (textAreaRef?.current) {
      const _textarea = textAreaRef.current;
      const _length = userInput?.split("\n")?.length;
      _textarea.rows = _length > 3 ? 3 : (Boolean(_length) && _length) || 1;
    }
  }, [userInput]);

  // Focus on text field on load
  useEffect(() => {
    if (!isMobile) {
      textAreaRef.current && textAreaRef.current.focus();
    }
  }, []);

  // starts a chat with a shareable link
  const initRender = useRef(true);
  useEffect(() => {
    const getExternalUrl = () => {
      if (!searchParams.has("question")) {
        return;
      }
      const sharedQuestion = searchParams.get("question");

      if (userInput === "" && sharedQuestion) {
        const question = decodeURIComponent(sharedQuestion);
        startChat(question, author.slug, { startChat: true });
      }
    };
    initRender.current && getExternalUrl();
    initRender.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update history state with a shareabe link
  useEffect(() => {
    const setUrlParamsQuery = () => {
      let cachedQuestion = chatList.reverse().find((chat) => {
        return chat.type === "userMessage";
      })?.message;

      const questionToUse = userInput === "" ? cachedQuestion : userInput;

      if (questionToUse) {
        const encodedQuestionToUse = encodeURIComponent(questionToUse);

        let url = new URL(window.location.href);
        if (!url.searchParams.has("question")) {
          url.searchParams.append("question", encodedQuestionToUse);
        } else {
          url.searchParams.set("question", encodedQuestionToUse);
        }

        history.pushState({}, "", url.href);
      }
    };

    setUrlParamsQuery();
  }, [router]);

  return (
    <>
      <Box position="relative" overflow="hidden" w="full" h="full" bg="black">
        <Container
          display="flex"
          flexDir="column"
          alignItems="center"
          maxW={"1400px"}
          h="100%"
          p={0}
        >
          <Flex
            id="main"
            width="full"
            h="full"
            flexDir={{ base: "column", lg: "row" }}
            gap="0"
          >
            {/* Sidebar / Author Info */}
            <Flex
              display={{ base: "none", md: "flex" }}
              flexDir="column"
              gap={4}
              alignItems="center"
              p={6}
              minW="250px"
              borderRight="1px solid"
              borderColor="gray.800"
              bg="gray.900"
            >
              <Box
                w="120px"
                h="120px"
                position="relative"
                rounded="full"
                overflow="hidden"
                border="2px solid"
                borderColor="purple.500"
                boxShadow="0 0 20px rgba(128, 90, 213, 0.3)"
              >
                <Image
                  src={author.imgURL}
                  alt={`author-${author.slug}`}
                  fill={true}
                  style={{ objectFit: 'cover' }}
                />
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight={700} color="white">
                  {author.name}
                </Text>
                <Text fontSize="md" color="gray.400" fontWeight={300}>
                  {author.title}
                </Text>
              </Box>
            </Flex>

            {/* Main Chat Area */}
            <Flex
              flexDir={"column"}
              width="full"
              h="full"
              position="relative"
              bg="gray.900"
            >
              <Box
                ref={messageListRef}
                w="full"
                flex="1"
                overflowY="auto"
                px={{ base: 4, md: 8, lg: 12 }}
                py={6}
                css={{
                  "&::-webkit-scrollbar": { width: "8px" },
                  "&::-webkit-scrollbar-track": { background: "transparent" },
                  "&::-webkit-scrollbar-thumb": { background: "#4A5568", borderRadius: "4px" },
                }}
              >
                {/* Centered Column for Messages */}
                <Flex flexDir="column" maxW="900px" mx="auto" gap={6}>
                  {chatList.length &&
                    chatList.map((message, index) => {
                      const isApiMessage = message.type === "apiMessage";
                      return (
                        <div key={index} style={{ width: '100%' }}>
                          <MessageBox
                            author={author.name}
                            avatarSrc={author.imgURL}
                            content={message}
                            handleFollowUpQuestion={handleFollowUpQuestion}
                          />
                          {isApiMessage && (
                            <Box pl={16} mt={-2}>
                              <Rating
                                feedbackId={message.uniqueId}
                                isResponseGenerated={!loading || !streamLoading}
                              />
                            </Box>
                          )}
                        </div>
                      );
                    })}
                  {(loading || streamLoading) && (
                    <MessageBox
                      author={author.name}
                      avatarSrc={author.imgURL}
                      content={{
                        message: streamData.message,
                        type: "apiStream",
                        uniqueId: uuidv4(),
                      }}
                      loading={loading}
                      streamLoading={streamLoading}
                      handleFollowUpQuestion={handleFollowUpQuestion}
                    />
                  )}
                  <Box h="20px" />
                </Flex>
              </Box>

              {/* Input Area - Floating & Centered */}
              <Box
                w="full"
                p={4}
                bgGradient="linear(to-t, gray.900 85%, transparent)"
                zIndex={10}
              >
                <Box maxW="900px" mx="auto" position="relative">
                  {streamLoading && (
                    <Button
                      position="absolute"
                      top="-50px"
                      left="50%"
                      transform="translateX(-50%)"
                      colorScheme="purple"
                      size="sm"
                      onClick={stopGenerating}
                      shadow="lg"
                      rounded="full"
                    >
                      Stop Generating
                    </Button>
                  )}

                  <form onSubmit={handleSubmit}>
                    <Flex
                      gap={2}
                      alignItems="center"
                      bg="gray.800"
                      p={2}
                      pl={4}
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor="gray.700"
                      boxShadow="lg"
                      transition="all 0.2s"
                      _focusWithin={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                    >
                      <Textarea
                        ref={textAreaRef}
                        placeholder={`Ask ${author.name} anything...`}
                        name=""
                        id="userInput"
                        rows={1}
                        resize="none"
                        disabled={loading || streamLoading}
                        value={userInput}
                        onChange={handleInputChange}
                        bg="transparent"
                        border="none"
                        _focus={{ boxShadow: "none" }}
                        flexGrow={1}
                        onKeyDown={handleEnter}
                        maxH="200px"
                        onInput={handleTextAreaChange}
                        py={3}
                        fontSize="md"
                        color="white"
                      />
                      <IconButton
                        isLoading={loading || streamLoading}
                        aria-label="send chat"
                        icon={<SendIcon />}
                        type="submit"
                        colorScheme="purple"
                        variant="solid"
                        isRound
                        size="md"
                        m={1}
                        _hover={{ bg: "purple.600" }}
                        isDisabled={!userInput.trim() || loading || streamLoading}
                      />
                    </Flex>
                  </form>
                  <Text fontSize="xs" color="gray.500" textAlign="center" mt={3}>
                    AI can make mistakes. Please verify important information.
                  </Text>
                </Box>
              </Box>
            </Flex>
          </Flex>
        </Container>
      </Box>
    </>
  );
};

export default ChatScreen;