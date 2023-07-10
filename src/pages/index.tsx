import Head from "next/head";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
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
import ChatScreen from "@/components/chat/ChatScreen";
import HomePage from "@/components/home/Home";
import { AUTHOR_QUERY } from "@/config/authorsConfig";
import useUpdateRouterQuery from "@/hooks/useUpdateRouterQuery";
import { PromptAction } from "@/types";
import { separateLinksFromApiMessage } from "@/utils/links";
import { TYPING_DELAY_IN_MILLISECONDS } from "@/config/ui-config";

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
  const [messages, setMessages] = useState<Message[]>([]);

  const router = useRouter();
  const updateRouterQuery = useUpdateRouterQuery();

  const searchQuery = router.query;
  const authorQuery = searchQuery[AUTHOR_QUERY];

  const resetChat = () => {
    setUserInput("");
    setLoading(false)
    setStreamData(initialStream)
    setStreamLoading(false)
    setTypedMessage("")
    setMessages([])
  }

  useEffect(() => {
    if (authorQuery === undefined) {
      resetChat();
    }
  }, [authorQuery])

  // add typing effect
  const addTypingEffect = async (
    message: string,
    callback: (typedText: string) => void
  ) => {
    setTypedMessage("");

    const { messageBody } = separateLinksFromApiMessage(message)
    
    let typedText = "";
    for (const char of messageBody) {
      typedText += char;
      setTypedMessage(typedText);
      await new Promise((resolve) => setTimeout(resolve, TYPING_DELAY_IN_MILLISECONDS)); // Adjust 15ms to change typing speed
    }
    // Call the callback function to update the message in the state
    callback(message);
  };

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

  const fetchESResult = async (query: string, author?: string) => {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          question: query,
          author: author,
        },
      }),
    });
    return response.json(); // Add this line
  };

  const errorMessages = [
    "I am not able to find an answer to this question. So please rephrase your question and ask again.",
    "The system is overloaded with requests, can you please ask your question in 5 seconds again? Thank you!",
    "I am not able to provide you with a proper answer to the question, but you can follow up with the links provided to find the answer on your own. Sorry for the inconvenience.",
    "Currently server is overloaded with API calls, please try again later.",
  ];

  const fetchResult = async (query: string, author?: string) => {
    const errMessage = "Something went wrong. Try again later";
    const searchResults = await fetchESResult(query, author); // Remove ": Response" type here
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    startChatQuery()
  }

  const startChatQuery = async (prompt?: string, author?: string) => {

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
      const response: Response = await fetchResult(query, author);
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
          releasedAt: formattedDateTime,
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
          releasedAt: formattedDateTime,
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

  const promptChat: PromptAction = async (prompt, author, options) => {
    updateRouterQuery(AUTHOR_QUERY, author)
    if (options?.startChat) {
      startChatQuery(prompt, author);
    } else {
      setUserInput(prompt)
    }
  };

  return (
    <>
      {authorQuery !== undefined ? (
        <ChatScreen
          messages={messages}
          userInput={userInput}
          typedMessage={typedMessage}
          streamData={streamData}
          handleInputChange={handleInputChange}
          promptChat={promptChat}
          loading={loading}
          streamLoading={streamLoading}
          resetChat={resetChat}
        />
      ) : (
        <HomePage onPrompt={promptChat} />
      )}
    </>
  );
}
