import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "@/components/message/message";
import { v4 as uuidv4 } from "uuid";
import { SupaBaseDatabase } from "@/database/database";
import { useRouter } from "next/router";
import ChatScreen from "@/components/chat/ChatScreen";
import HomePage from "@/components/home/Home";
import authorsConfig, { AUTHOR_QUERY } from "@/config/authorsConfig";
import useUpdateRouterQuery from "@/hooks/useUpdateRouterQuery";
import { GeneratingErrorMessages, PromptAction } from "@/types";
import ERROR_MESSAGES, { getAllErrorMessages } from "@/config/error-config";
import { usePaymentContext } from "@/contexts/payment-context";
import InvoiceModal from "@/components/invoice/modal";
import { constructTokenHeader, getLSATDetailsFromHeader } from "@/utils/token";
import { formatDate } from "@/utils/date";
import { createReadableStream } from "@/utils/stream";
import { separateLinksFromApiMessage } from "@/utils/links";

const initialStream: Message = {
  type: "apiStream",
  message: "",
  uniqueId: "",
};

const getCachedAnswer = async (question: string, author?: string) => {
  question = question.toLowerCase();
  author = author?.toLocaleLowerCase();
  const errorMessages = getAllErrorMessages();
  try {
    const answers = await SupaBaseDatabase.getInstance().getAnswerByQuestion(
      question,
      author
    );

    if (!answers || answers.length === 0) {
      console.error("Error fetching answer: No answers found.");
      return null;
    }

    const findNonEmptyAnswer = (item: {
      answer: string | null;
      createdAt: string;
    }) => {
      if (!item.answer && !item.answer?.trim()) {
        return false;
      }
      const messageBodyNoLinks = separateLinksFromApiMessage(
        item.answer
      ).messageBody;
      return !errorMessages.includes(messageBodyNoLinks);
    };
    const nonEmptyAnswer = answers.find((item) => findNonEmptyAnswer(item));

    if (!nonEmptyAnswer) {
      console.error("Error fetching answer: No non-empty answers found.");
      return null;
    }
    return createReadableStream(nonEmptyAnswer.answer);
  } catch (error) {
    return null;
  }
};

// temporary concat
const errorMessages = [
  "I am not able to find an answer to this question. So please rephrase your question and ask again.",
  "The system is overloaded with requests, can you please ask your question in 5 seconds again? Thank you!",
  "I am not able to provide you with a proper answer to the question, but you can follow up with the links provided to find the answer on your own. Sorry for the inconvenience.",
  "Currently server is overloaded with API calls, please try again later.",
  "null",
  "undefined",
].concat(getAllErrorMessages());

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamData, setStreamData] = useState<Message>(initialStream);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string | undefined>(
    undefined
  );

  const {
    setLoading: setPaymentLoading,
    paymentCancelled,
    setInvoice,
    openPaymentModal,
    resetPayment,
    isPaymentSettled,
    isAutoPaymentSettled,
  } = usePaymentContext();

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
    setMessages([]);
  };

  useEffect(() => {
    if (authorQuery === undefined) {
      resetChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const updateMessages = async (finalText: string, uuid: string) => {
    // Call the addTypingEffect function to add a typing effect to the finalText
    setTimeout(() => {
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
    }, 500);
  };

  const startChatQuery = useCallback(
    async (prompt?: string, author?: string) => {
      const query = prompt ? prompt.trim() : userInput.trim();
      if (query === "") {
        return;
      }
      // Reset the typedMessage state
      let uuid = uuidv4();
      setLoading(true);
      setMessages((prevMessages) => {
        if (prevMessages.length > 0) {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage.message === query) {
            return prevMessages;
          }
        }
        return [
          ...prevMessages,
          { message: query, type: "userMessage", uniqueId: uuid },
        ];
      });

      try {
        const cachedAnswer = await getCachedAnswer(query, author);

        let data;
        if (!cachedAnswer) {
          const savedToken = localStorage.getItem("paymentToken") || "";
          const authHeader = constructTokenHeader({
            token: savedToken,
          });

          const response = await fetch("/api/server", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify({
              inputs: {
                query,
                author,
              },
            }),
          });
          if (response.status === 402) {
            localStorage.removeItem("paymentToken");
            const L402 = response.headers.get("WWW-Authenticate");
            const { token, invoice, r_hash } =
              getLSATDetailsFromHeader(L402!) ?? {};
            localStorage.setItem("paymentToken", token ?? "");
            setInvoice({ payment_request: invoice!, r_hash: r_hash! });
            setPaymentLoading(true);
            openPaymentModal();
            return;
          }
          if (!response.ok || response.status !== 200) {
            throw new Error(ERROR_MESSAGES.UNKNOWN);
          }
          data = response.body;
        } else {
          data = cachedAnswer;
        }
        setUserInput("");
        const reader = data?.getReader();
        let doneReading = false;
        let finalAnswerWithLinks = "";

        if (!reader) throw new Error(ERROR_MESSAGES.UNKNOWN);
        const decoder = new TextDecoder();
        setLoading(false);
        setStreamLoading(true);
        while (!doneReading) {
          const { value, done } = await reader.read();
          doneReading = done;
          const chunk = decoder.decode(value);

          finalAnswerWithLinks += chunk; // Store the plain text in finalAnswerWithLinks
          setStreamData((data) => {
            const _updatedData = { ...data };
            _updatedData.message += chunk;
            return _updatedData;
          });
        }

        await updateMessages(finalAnswerWithLinks, uuid);

        let question = query;
        let author_name = author?.toLowerCase();
        let answer = finalAnswerWithLinks;
        let uniqueIDD = uuid;
        let dateString = "03-08-2023"; // DD-MM-YY
        let timeString = "00:00:00";

        const dateTimeString =
          dateString.split("-").reverse().join("-") + "T" + timeString;
        const dateObject = new Date(dateTimeString);
        const formattedDateTime = formatDate(dateObject);

        const isValidAnswer = answer?.trim() && !errorMessages.includes(answer);

        let payload = {
          uniqueId: uniqueIDD,
          question: question,
          answer: isValidAnswer ? answer : null,
          author_name: author_name,
          rating: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
          releasedAt: formattedDateTime,
        };
        await SupaBaseDatabase.getInstance().insertData(payload);
      } catch (err: any) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            message: err?.message ?? ERROR_MESSAGES.UNKNOWN,
            type: "errorMessage",
            uniqueId: uuidv4(),
          },
        ]);
      }
      setLoading(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [userInput]
  );

  const promptChat: PromptAction = async (prompt, author, options) => {
    updateRouterQuery(AUTHOR_QUERY, author);
    if (!prompt?.trim()) return;
    const authorValue =
      authorsConfig.find((_author) => author === _author.slug)?.value ?? "";
    if (options?.startChat) {
      setUserInput(prompt);
      setSelectedAuthor(authorValue);
      startChatQuery(prompt, authorValue);
    } else {
      setUserInput(prompt);
    }
  };

  useEffect(() => {
    if (isPaymentSettled || isAutoPaymentSettled) {
      resetPayment();
      startChatQuery(userInput, selectedAuthor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaymentSettled, isAutoPaymentSettled, startChatQuery]);

  useEffect(() => {
    setLoading(!paymentCancelled);
    setStreamLoading(!paymentCancelled);
    if (paymentCancelled) {
      setMessages([]);
    }
  }, [paymentCancelled]);

  return (
    <>
      {authorQuery !== undefined ? (
        <ChatScreen
          messages={messages}
          userInput={userInput}
          streamData={streamData}
          handleInputChange={handleInputChange}
          startChat={promptChat}
          loading={loading}
          streamLoading={streamLoading}
        />
      ) : (
        <HomePage onPrompt={promptChat} />
      )}
      <InvoiceModal />
    </>
  );
}
