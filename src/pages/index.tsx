import Head from "next/head";
import { useEffect, useRef, useState } from "react";
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

const initialStream: Message = {
  type: "apiStream",
  message: "",
  uniqueId: "",
};
const matchFinalWithLinks = /(^\[\d+\]:\shttps:\/\/)/gm;

interface FeedbackStatus {
  [messageId: string]: "submitted" | undefined;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so we need to add 1
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamData, setStreamData] = useState<Message>(initialStream);
  const [typedMessage, setTypedMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      message: "Hi there! How can I help?",
      type: "apiMessage",
      uniqueId: "",
    },
  ]);

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const idleBackground =
    !userInput.trim() && messages.length === 1 && loading === false;

  // add typing effect
  const addTypingEffect = async (
    message: string,
    callback: (typedText: string) => void
  ) => {
    setTypedMessage("");

    let typedText = "";
    for (const char of message) {
      typedText += char;
      setTypedMessage(typedText);
      await new Promise((resolve) => setTimeout(resolve, 15)); // Adjust 15ms to change typing speed
    }
    // Call the callback function to update the message in the state
    callback(typedText);
  };

  // Auto scroll chat to bottom
  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.scrollTop = messageList?.scrollHeight;
    }
  }, [messages]);

  // Focus on text field on load
  useEffect(() => {
    textAreaRef.current && textAreaRef.current.focus();
  }, []);

  useEffect(() => {
    if (textAreaRef?.current) {
      const _textarea = textAreaRef.current;
      const _length = userInput?.split("\n")?.length;
      _textarea.rows = _length > 3 ? 3 : (Boolean(_length) && _length) || 1;
    }
  }, [userInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const updateMessages = async (finalText: string, uuid: string) => {
    // Call the addTypingEffect function to add a typing effect to the finalText
    await addTypingEffect(finalText, (messageWithTypingEffect: string) => {
      setStreamLoading(false);
      setStreamData(initialStream);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: messageWithTypingEffect,
          type: "apiMessage",
          uniqueId: uuid,
        },
      ]);
    });
  };

  const addDocumentToMongoDB = async (payload: any) => {
    const response = await fetch("/api/mongo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const { data } = await response.json();
    return data;
  };
  const getDocumentInMongoDB = async (uniqueId: string) => {
    const response = await fetch("/api/mongo?unique=" + uniqueId, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const { data } = await response.json();
    return data;
  };

  const updateDocumentInMongoDB = async (uniqueId: string, payload: any) => {
    const response = await fetch("/api/mongo?unique=" + uniqueId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const { data } = await response.json();
    return data;
  };

  const fetchESResult = async (query: string) => {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          question: query,
        },
      }),
    });
    return response.json(); // Add this line
  };

  const errorMessages = [
    'I am not able to find an answer to this question. So please rephrase your question and ask again.',
    'The system is overloaded with requests, can you please ask your question in 5 seconds again? Thank you!',
    'I am not able to provide you with a proper answer to the question, but you can follow up with the links provided to find the answer on your own. Sorry for the inconvenience.',
    'Currently server is overloaded with API calls, please try again later.'
   ];

  const fetchResult = async (query: string) => {
    const errMessage = "Something went wrong. Try again later";
    const searchResults = await fetchESResult(query); // Remove ": Response" type here
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [
          {
            question: query,
            searchResults: searchResults,
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(errMessage);
    }
    return response; // Add this line to correctly access the output
  };

  const handleSubmit = async (e: React.FormEvent, prompt?: string) => {
    if (e) {
      e.preventDefault();
    }
    const query = prompt ? prompt.trim() : userInput.trim();
    if (query === "") {
      return;
    }
    // Reset the typedMessage state
    setTypedMessage("");
    let uuid = uuidv4();
    setLoading(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: query, type: "userMessage", uniqueId: uuid },
    ]);
    setUserInput("");

    const errMessage = "Something went wrong. Try again later";

    try {
      const response: Response = await fetchResult(query);
      if (!response.ok) {
        throw new Error(errMessage);
      }
      const data = response.body;
      const reader = data?.getReader();
      let done = false;
      let finalAnswerWithLinks = "";

      if (!reader) throw new Error(errMessage);
      const decoder = new TextDecoder();
      setLoading(false);
      setStreamLoading(true);
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value);
        if (matchFinalWithLinks.test(chunk)) {
          finalAnswerWithLinks = chunk;
        } else {
          finalAnswerWithLinks += chunk; // Store the plain text in finalAnswerWithLinks
          setStreamData((data) => {
            const _updatedData = { ...data };
            _updatedData.message += chunk;
            return _updatedData;
          });
        }
      }

      let question = userInput;
      let answer = finalAnswerWithLinks;
      let uniqueIDD = uuid;
      let dateString = "03-07-2023"; // DD-MM-YY
      let timeString = "00:00:00";

      const dateTimeString =
        dateString.split("-").reverse().join("-") + "T" + timeString;
      const dateObject = new Date(dateTimeString);
      const formattedDateTime = formatDate(dateObject);

      if (!errorMessages.includes(answer)) {
        let payload = {
          uniqueId: uniqueIDD,
          question: question,
          answer: answer,
          rating: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
          releasedAt: formattedDateTime
        };
        await SupaBaseDatabase.getInstance().insertData(payload);
      } else {
        // If answer contains error messages, only add the question to DB
        let payload = {
          uniqueId: uniqueIDD,
          question: question,
          answer: null, // Set answer as null
          rating: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
          releasedAt: formattedDateTime
        };
        await SupaBaseDatabase.getInstance().insertData(payload);
      }
      await updateMessages(finalAnswerWithLinks, uuid);
    } catch (err: any) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: err?.message ?? defaultErrorMessage,
          type: "errorMessage",
          uniqueId: uuidv4(),
        },
      ]);
    }
    setLoading(false);
  };

  const promptChat = async (e: any, prompt: string) => {
    handleSubmit(e, prompt);
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

  return (
    <>
      <Head>
        <title>Chat BTC</title>
        <meta name="description" content="Your technical bitcoin copilot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/bitcoin.svg" />
      </Head>
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
              {idleBackground ? (
                <BackgroundHelper promptChat={promptChat} />
              ) : (
                <>
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
                </>
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
}
