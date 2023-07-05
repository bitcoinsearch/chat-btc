import Head from "next/head";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  IconButton,
  Textarea,
} from "@chakra-ui/react";
import { BitcoinIcon, SendIcon } from "@/chakra/custom-chakra-icons";
import { isMobile } from "react-device-detect";
import MessageBox, { Message } from "@/components/message/message";
import { defaultErrorMessage } from "@/config/error-config";
import { v4 as uuidv4 } from "uuid";
import { SupaBaseDatabase } from "@/database/database";
import BackgroundHelper from "@/components/background/BackgroundHelper";
import Rating from "@/components/rating/Rating";
import { useRouter } from "next/router";

type ChatProps = {
  userInput: string;
  typedMessage: string;
  streamData: Message;
  messages: Message[];
  handleSubmit: (e:FormEvent, prompt?: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  loading: boolean;
  streamLoading: boolean;
}

const ChatScreen = ({userInput, typedMessage, streamData, messages, handleSubmit, handleInputChange, loading, streamLoading}: ChatProps) => {
  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.scrollTop = messageList?.scrollHeight;
    }
  }, [messages]);

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
    textAreaRef.current && textAreaRef.current.focus();
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
          centerContent
        >
          <Flex
            gap={2}
            alignItems="center"
            mt={{ base: 3, md: 8 }}
            justifyContent="center"
          >
            <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>
              ChatBTC
            </Heading>
            <BitcoinIcon
              fontSize={{ base: "4xl", md: "7xl" }}
              color="orange.400"
            />
          </Flex>
          <Flex
            id="main"
            width="full"
            h="full"
            maxW="820px"
            my={5}
            flexDir="column"
            gap="4"
            justifyContent="space-around"
            overflow="auto"
          >
            <Box
              ref={messageListRef}
              w="full"
              bgColor="gray.900"
              borderRadius="md"
              flex="1 1 0%"
              overflow="auto"
              maxH="100lvh"
            >
                {messages.length &&
                  messages.map((message, index) => {
                    const isApiMessage = message.type === "apiMessage";
                    const greetMsg =
                      message.message === "Hi there! How can I help?";
                    return (
                      <div key={index}>
                        <MessageBox content={message} />
                        {isApiMessage && !greetMsg && (
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
                    content={{
                      message: streamLoading
                        ? typedMessage
                        : streamData.message,
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
                    disabled={loading}
                    value={userInput}
                    onChange={handleInputChange}
                    bg="gray.700"
                    flexGrow={1}
                    flexShrink={1}
                    onKeyDown={handleEnter}
                  />
                  <IconButton
                    isLoading={loading}
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
