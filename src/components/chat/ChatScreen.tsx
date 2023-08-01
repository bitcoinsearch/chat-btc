import { SendIcon } from "@/chakra/custom-chakra-icons";
import MessageBox, { Message } from "@/components/message/message";
import Rating from "@/components/rating/Rating";
import authorsConfig, {
  AUTHOR_QUERY,
  deriveAuthorIntroduction,
} from "@/config/authorsConfig";
import {
  Box,
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
import InvoiceModal from "../invoice/modal";
import { usePaymentContext } from "@/contexts/payment-context";
import { PromptAction } from "@/types";

type ChatProps = {
  userInput: string;
  typedMessage: string;
  streamData: Message;
  messages: Message[];
  startChat: PromptAction;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  loading: boolean;
  streamLoading: boolean;
  resetChat: () => void;
};

const blippy = authorsConfig[0];

const ChatScreen = ({
  userInput,
  typedMessage,
  streamData,
  messages,
  startChat,
  handleInputChange,
  loading,
  streamLoading,
  resetChat,
}: ChatProps) => {
  const { setIsPaymentSettled, requestPayment, isPaymentSettled } =
    usePaymentContext();
  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const initMessageListHeight = useRef(
    messageListRef.current?.scrollHeight ?? 0
  );

  const router = useRouter();
  const authorQuery = router.query[AUTHOR_QUERY];

  const author = useMemo(() => {
    return (
      authorsConfig.find((authorConfig) => authorConfig.slug === authorQuery) ||
      blippy
    );
  }, [authorQuery]);

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
  }, [typedMessage, userHijackedScroll]);

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
    startChat(userInput, author.slug, { startChat: true })
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

  return (
    <>
      <Box position="relative" overflow="hidden" w="full" h="full">
        <Container
          display="flex"
          flexDir="column"
          alignItems="center"
          maxW={"1280px"}
          h="100%"
          p={4}
          // centerContent
        >
          <Flex
            id="main"
            width="full"
            h="full"
            maxW="820px"
            my={4}
            flexDir="column"
            gap="4"
            justifyContent="space-around"
            overflow="auto"
          >
            <Flex
              w="full"
              gap={4}
              alignItems="center"
              // mt={{ base: 3, md: 8 }}
              // justifyContent="center"
            >
              <Box w="75px">
                <Box
                  position="relative"
                  pt="100%"
                  w="full"
                  rounded="full"
                  overflow="hidden"
                  bgColor="blackAlpha.400"
                >
                  <Image
                    src={author.imgURL}
                    alt={`author-${author.slug}`}
                    fill={true}
                    // sizes="50px"
                  />
                </Box>
              </Box>
              <Box>
                <Text fontSize={{ base: "18px", md: "24px" }} fontWeight={500}>
                  {author.name}
                </Text>
                <Text fontSize={{ base: "12px", md: "16px" }} fontWeight={300}>
                  {author.title}
                </Text>
              </Box>
            </Flex>
            <Box
              ref={messageListRef}
              w="full"
              bgColor="gray.900"
              borderRadius="md"
              flex="1 1 0%"
              overflow="auto"
              maxH="100lvh"
            >
              {chatList.length &&
                chatList.map((message, index) => {
                  const isApiMessage = message.type === "apiMessage";
                  return (
                    <div key={index}>
                      <MessageBox author={author.name} content={message} />
                      {isApiMessage && (
                        <Rating
                          feedbackId={message.uniqueId}
                          isResponseGenerated={!loading || !streamLoading}
                        />
                      )}
                    </div>
                  );
                })}
              {(loading || streamLoading) && (
                <MessageBox
                  // messageId={uuidv4()}
                  author={author.name}
                  content={{
                    message: streamLoading ? typedMessage : streamData.message,
                    type: "apiStream",
                    uniqueId: uuidv4(),
                  }}
                  loading={loading}
                  streamLoading={streamLoading}
                />
              )}
            </Box>
            {/* <Box w="100%" maxW="100%" flex={{base: "0 0 50px", md:"0 0 100px"}} mb={{base: "70px", md: "70px"}}> */}
            <Box w="100%">
              <form onSubmit={handleSubmit}>
                <Flex gap={2} alignItems="flex-end">
                  <Textarea
                    ref={textAreaRef}
                    placeholder="Type your question here"
                    name=""
                    id="userInput"
                    rows={1}
                    resize="none"
                    disabled={loading || streamLoading}
                    value={userInput}
                    onChange={handleInputChange}
                    bg="gray.700"
                    flexGrow={1}
                    flexShrink={1}
                    onKeyDown={handleEnter}
                  />
                  <IconButton
                    isLoading={loading || streamLoading}
                    aria-label="send chat"
                    icon={<SendIcon />}
                    type="submit"
                  />
                </Flex>
              </form>
            </Box>
          </Flex>
        </Container>
      </Box>
    </>
  );
};

export default ChatScreen;
