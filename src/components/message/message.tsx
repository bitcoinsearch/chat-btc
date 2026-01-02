import React from "react";
import { Box, Button, Flex, Heading, Text, Avatar } from "@chakra-ui/react";
import { BeatLoader } from "react-spinners";
import styles from "./message.module.css";
import { LinkShareIcon } from "@/chakra/custom-chakra-icons";
import { USER_REFERENCE_NAME } from "@/config/ui-config";
import { separateLinksFromApiMessage } from "@/utils/links";
import MarkdownWrapper, {
  CopyResponseButton,
} from "./markdownWrapper/markdownWrapper";

type MessageType =
  | "userMessage"
  | "authorMessage"
  | "apiMessage"
  | "errorMessage"
  | "apiStream";

export interface Message {
  message: string;
  type: MessageType;
  uniqueId: string;
}

const messageConfig = {
  apiMessage: {
    bg: "gray.700",
    color: "gray.100",
    headingColor: "orange.400",
  },
  authorMessage: {
    bg: "gray.700",
    color: "gray.100",
    headingColor: "orange.400",
  },
  userMessage: {
    bg: "purple.600",
    color: "white",
    headingColor: "purple.400",
  },
  errorMessage: {
    bg: "red.900",
    color: "red.200",
    headingColor: "red.500",
  },
  apiStream: {
    bg: "gray.700",
    color: "gray.100",
    headingColor: "orange.400",
  },
};

const MessageBox = ({
  content,
  author,
  loading,
  streamLoading,
  handleFollowUpQuestion,
  avatarSrc,
}: {
  content: Message;
  author: string;
  loading?: boolean;
  streamLoading?: boolean;
  handleFollowUpQuestion: (question: string) => void;
  avatarSrc?: string;
}) => {
  const { message, type } = content;
  const isUser = type === "userMessage";

  const UserAvatar = () => (
    <Box minW="40px" display="flex" flexDirection="column" justifyContent="flex-start">
      <Avatar
        size="sm"
        name={isUser ? "User" : author}
        src={isUser ? undefined : avatarSrc}
        bg={isUser ? "gray.500" : "transparent"}
        ignoreFallback={isUser}
        mt={1} // Visual tweaking to align with top of bubble
      />
    </Box>
  );

  return (
    <Flex
      w="100%"
      justify={isUser ? "flex-end" : "flex-start"} // Keeps user on right, AI on left
      alignItems="flex-start" // ENFORCES VERTICAL TOP ALIGNMENT with flow
      py={2}
      px={{ base: 2, md: 0 }}
      gap={3}
    >
      {!isUser && <UserAvatar />}

      <Flex
        maxW={{ base: "85%", md: "80%" }}
        flexDir="column"
        alignItems={isUser ? "flex-end" : "flex-start"}
      >
        <Box
          bgColor={messageConfig[type].bg}
          color={messageConfig[type].color ?? "inherit"}
          borderRadius="2xl"
          borderTopLeftRadius={!isUser ? "sm" : "2xl"}
          borderTopRightRadius={isUser ? "sm" : "2xl"}
          px={5}
          py={3}
          boxShadow="md"
        >
          {!isUser && (
             <Heading size="xs" mb={1} color={messageConfig[type].headingColor} opacity={0.8}>
               {author}
             </Heading>
          )}

          {loading ? (
            <BeatLoader color="white" size={8} />
          ) : (
            <MessageContent
              message={message}
              type={type}
              uniqueId={""}
              handleFollowUpQuestion={handleFollowUpQuestion}
              streamLoading={streamLoading} // PASSING PROP DOWN
            />
          )}
        </Box>
      </Flex>

      {isUser && <UserAvatar />}
    </Flex>
  );
};

export default MessageBox;

const ClickableLink = ({ linkString }: { linkString: string }) => {
  let url = linkString.split(" ")[1]?.trim();
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={styles.reference_link}
    >
      {linkString}{" "}
      <span style={{ marginLeft: "5px" }}>
        <LinkShareIcon />
      </span>
    </a>
  );
};

const ClickableQuestions = ({
  question,
  handleFollowUpQuestion,
}: {
  question: string;
  handleFollowUpQuestion: (question: string) => void;
}) => {
  return (
    <Button
      minW="200px"
      maxW="200px"
      minH="auto"
      h="100%"
      p={3}
      borderRadius="xl"
      fontSize="sm"
      fontWeight="400"
      whiteSpace="normal"
      color="white"
      bg="whiteAlpha.200"
      _hover={{ bg: "whiteAlpha.300" }}
      onClick={() => handleFollowUpQuestion(question.trim())}
      justifyContent="flex-start"
      textAlign="left"
    >
      <Text noOfLines={3}>{question}</Text>
    </Button>
  );
};

const MessageContent = ({
  message,
  type,
  handleFollowUpQuestion,
  streamLoading, // Receive prop
}: Message & { handleFollowUpQuestion: (question: string) => void, streamLoading?: boolean }) => {
  if (!message?.trim()) return null;
  const { messageBody, messageLinks, messageQuestions, isErrorMessage } =
    separateLinksFromApiMessage(message);
  
  // Logic: Show copy only if NOT streaming and message has content
  const showCopyIcon = !streamLoading && (type === "apiMessage") && message.length > 0;

  if (!messageBody?.trim()) return null;

  return (
    <>
      <Box className={styles.markdownClass}>
        <MarkdownWrapper text={messageBody.trim()} />
      </Box>

      {isErrorMessage ? null : (
        <Box mt={3}>
          {Boolean(messageQuestions.length) && (
            <Box pt={2}>
              <Text fontSize="xs" color="gray.400" mb={2} fontWeight={600}>
                SUGGESTED QUESTIONS
              </Text>
              <Flex
                alignItems="stretch"
                overflowX="auto"
                gap={2}
                pb={2}
                css={{
                  "&::-webkit-scrollbar": { height: "4px" },
                  "&::-webkit-scrollbar-track": { background: "transparent" },
                  "&::-webkit-scrollbar-thumb": { background: "#555", borderRadius: "4px" },
                }}
              >
                {messageQuestions.map((question, idx) => (
                  <ClickableQuestions
                    question={question}
                    key={`${question}_${idx}`}
                    handleFollowUpQuestion={() => {
                      if (type === "apiMessage") {
                        handleFollowUpQuestion(question.trim());
                      }
                    }}
                  />
                ))}
              </Flex>
            </Box>
          )}

          {Boolean(messageLinks.length) && (
            <Box mt={3} pt={2} borderTop="1px solid" borderColor="whiteAlpha.200">
              <Text fontSize="xs" fontWeight={600} mb={1} color="gray.400">
                SOURCES
              </Text>
              {messageLinks.map((link, idx) => (
                <div key={idx}>
                  <ClickableLink linkString={link} />
                </div>
              ))}
            </Box>
          )}
        </Box>
      )}

      {showCopyIcon && (
        <Flex justify="flex-end" mt={2} gap={2}>
          <CopyResponseButton isCopyText msg={message} />
        </Flex>
      )}
    </>
  );
};