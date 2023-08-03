import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Message } from "@/components/message/message";
import { defaultErrorMessage } from "@/config/error-config";
import { v4 as uuidv4 } from "uuid";
import { SupaBaseDatabase } from "@/database/database";
import { useRouter } from "next/router";
import ChatScreen from "@/components/chat/ChatScreen";
import HomePage from "@/components/home/Home";
import authorsConfig, { AUTHOR_QUERY } from "@/config/authorsConfig";
import useUpdateRouterQuery from "@/hooks/useUpdateRouterQuery";
import { GeneratingErrorMessages, PromptAction } from "@/types";
import { separateLinksFromApiMessage } from "@/utils/links";
import { TYPING_DELAY_IN_MILLISECONDS } from "@/config/ui-config";
import { usePaymentContext } from "@/contexts/payment-context";
import InvoiceModal from "@/components/invoice/modal";
import { shouldUserPay } from "@/utils/token";

const initialStream: Message = {
  type: "apiStream",
  message: "",
  uniqueId: "",
};
const matchFinalWithLinks = /(^\[\d+\]:\shttps:\/\/)/gm;

const errorMessages = [
  "I am not able to find an answer to this question. So please rephrase your question and ask again.",
  "The system is overloaded with requests, can you please ask your question in 5 seconds again? Thank you!",
  "I am not able to provide you with a proper answer to the question, but you can follow up with the links provided to find the answer on your own. Sorry for the inconvenience.",
  "Currently server is overloaded with API calls, please try again later.",
  "null",
  "undefined"
];

function createReadableStream(text: string) {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
  return readable;
}

const getCachedAnswer = async (question: string, author?: string) => {
  question = question.toLowerCase();
  author = author?.toLocaleLowerCase();
  try {
    const answers = await SupaBaseDatabase.getInstance().getAnswerByQuestion(
      question,
      author
    );

    if (!answers || answers.length === 0) {
      console.error("Error fetching answer: No answers found.");
      return null;
    }

    const nonEmptyAnswer = answers.find((item) => Boolean(item.answer && item.answer?.trim() && !errorMessages.includes(item.answer)));

    if (!nonEmptyAnswer) {
      console.error("Error fetching answer: No non-empty answers found.");
      return null;
    }
    return createReadableStream(nonEmptyAnswer.answer);
  } catch (error) {
    return null;
  }
};

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
  const [selectedAuthor, setSelectedAuthor] = useState<string | undefined>(
    undefined
  );

  const { requestPayment, isPaymentSettled, isAutoPaymentSettled } = usePaymentContext();

  const router = useRouter();
  const updateRouterQuery = useUpdateRouterQuery();

  const searchQuery = router.query;
  const authorQuery = searchQuery[AUTHOR_QUERY];

  const abortTypingRef = useRef<AbortController>();

  const resetChat = async () => {
    streamLoading &&
      abortTypingRef.current?.abort(GeneratingErrorMessages.resetChat);
    setUserInput("");
    setLoading(false);
    setStreamData(initialStream);
    setStreamLoading(false);
    setTypedMessage("");
    setMessages([]);
  };

  useEffect(() => {
    if (authorQuery === undefined) {
      resetChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorQuery]);

  // add typing effect
  const addTypingEffect = (message: string) => {
    // instantiate new AbortController
    const typingAbortController = new AbortController();
    abortTypingRef.current = typingAbortController;
    setTypedMessage("");
    const { messageBody } = separateLinksFromApiMessage(message);
    let typedText = "";
    let index = 0;
    let messageInterval: NodeJS.Timer;

    return new Promise((resolve, reject) => {
      messageInterval = setInterval(() => {
        if (index >= messageBody.length - 1) {
          clearInterval(messageInterval);
          resolve(typedText);
        }
        typedText += messageBody[index];
        index += 1;
        setTypedMessage(typedText);
      }, TYPING_DELAY_IN_MILLISECONDS);

      typingAbortController.signal.addEventListener("abort", () => {
        clearInterval(messageInterval);
        abortTypingRef.current = undefined;
        if (
          typingAbortController.signal.reason ===
          GeneratingErrorMessages.resetChat
        ) {
          reject(new Error(GeneratingErrorMessages.resetChat));
        } else {
          reject(new Error(GeneratingErrorMessages.abortTyping));
        }
      });
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const updateMessages = useCallback(
    async (finalText: string, uuid: string) => {
      // Call the addTypingEffect function to add a typing effect to the finalText
      await addTypingEffect(finalText)
        .then((_res) => {
          setStreamLoading(false);
          setStreamData(initialStream);

          setMessages((prevMessages) => [
            ...prevMessages,
            {
              message: finalText,
              type: "apiMessage",
              uniqueId: uuid,
            },
          ]);
        })
        .catch((err) => {
          if (err.message === GeneratingErrorMessages.abortTyping) {
            const cutoffMessage = typedMessage;
            setStreamLoading(false);
            setStreamData(initialStream);

            setMessages((prevMessages) => [
              ...prevMessages,
              {
                message: cutoffMessage,
                type: "apiMessage",
                uniqueId: uuid,
              },
            ]);
          }
        })
        .finally(() => {
          setTypedMessage("");
        });
    },
    [typedMessage]
  );

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

  const errorMessages = useMemo(
    () => [
      "I am not able to find an answer to this question. So please rephrase your question and ask again.",
      "The system is overloaded with requests, can you please ask your question in 5 seconds again? Thank you!",
      "I am not able to provide you with a proper answer to the question, but you can follow up with the links provided to find the answer on your own. Sorry for the inconvenience.",
      "Currently server is overloaded with API calls, please try again later.",
    ],
    []
  );

  const fetchResult = useCallback(async (query: string, author?: string) => {
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
  }, []);

  const startChatQuery = useCallback(
    async (prompt?: string, author?: string) => {
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
        const cachedAnswer = await getCachedAnswer(query, author);
        let data = null;
        if (!cachedAnswer) {
          const response: Response = await fetchResult(query, author);
          if (!response.ok) {
            throw new Error(errMessage);
          }
          data = response.body;
        } else {
          data = cachedAnswer;
        }

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

        let question = query;
        let author_name = author?.toLocaleLowerCase();
        let answer = finalAnswerWithLinks;
        let uniqueIDD = uuid;
        let dateString = "03-08-2023"; // DD-MM-YY
        let timeString = "00:00:00";

        const dateTimeString =
          dateString.split("-").reverse().join("-") + "T" + timeString;
        const dateObject = new Date(dateTimeString);
        const formattedDateTime = formatDate(dateObject);

      if (answer?.trim() && !errorMessages.includes(answer)) {
        let payload = {
          uniqueId: uniqueIDD,
          question: question,
          answer: answer,
          author_name: author_name,
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
          author_name: author_name,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const promptChat: PromptAction = async (prompt, author, options) => {
    updateRouterQuery(AUTHOR_QUERY, author);
    if (!prompt?.trim()) return
    const authorValue =
      authorsConfig.find((_author) => author === _author.slug)?.value ?? "";
    if (options?.startChat) {
      setUserInput(prompt)
      setSelectedAuthor(authorValue);
      const userMessages = messages.filter((message) => message.type === "userMessage")
      const shouldPay = shouldUserPay(userMessages.length)
      if (shouldPay) {
        const { payment_request, r_hash } = await requestPayment();
        if (!payment_request && !r_hash) {
          return;
        }
      } else {
        startChatQuery(prompt, authorValue);
      }
    } else {
      setUserInput(prompt);
    }
  };

  useEffect(() => {
    if (isPaymentSettled || isAutoPaymentSettled) {
      startChatQuery(userInput, selectedAuthor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaymentSettled, isAutoPaymentSettled, startChatQuery]);

  return (
    <>
      {authorQuery !== undefined ? (
        <ChatScreen
          messages={messages}
          userInput={userInput}
          typedMessage={typedMessage}
          streamData={streamData}
          handleInputChange={handleInputChange}
          startChat={promptChat}
          loading={loading}
          streamLoading={streamLoading}
          resetChat={resetChat}
        />
      ) : (
        <HomePage onPrompt={promptChat} />
      )}
      <InvoiceModal />
    </>
  );
}
