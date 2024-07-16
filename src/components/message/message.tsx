import React from "react";
import { Box, Button, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { BeatLoader } from "react-spinners";
import styles from "./message.module.css";
import { LinkShareIcon } from "@/chakra/custom-chakra-icons";
import { USER_REFERENCE_NAME } from "@/config/ui-config";
import { separateLinksFromApiMessage } from "@/utils/links";
import MarkdownWrapper, { CopyButton, CopyResponseButton } from "./markdownWrapper/markdownWrapper";

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

type MessageConfig = {
  [key in MessageType]: {
    color: string | null;
    bg: string;
    headingColor: string;
  };
};

const messageConfig: MessageConfig = {
  apiMessage: {
    color: null,
    bg: "gray.600",
    headingColor: "orange.400",
  },
  authorMessage: {
    color: null,
    bg: "gray.600",
    headingColor: "orange.400",
  },
  userMessage: {
    color: null,
    bg: "gray.800",
    headingColor: "purple.400",
  },
  errorMessage: {
    color: "red.200",
    bg: "gray.600",
    headingColor: "red.500",
  },
  apiStream: {
    color: null,
    bg: "gray.600",
    headingColor: "orange.400",
  },
};

const MessageBox = ({
  content,
  author,
  loading,
  streamLoading,
  handleFollowUpQuestion,
}: {
  content: Message;
  author: string;
  loading?: boolean;
  streamLoading?: boolean;
  handleFollowUpQuestion: (question: string) => void;
}) => {
  const { message, type } = content;

  return (
    <Flex
      flexDir="column"
      gap={{ base: 1, md: 2 }}
      w="100%"
      bgColor={messageConfig[type].bg ?? ""}
      textAlign={type === "userMessage" ? "right" : "left"}
      py={{ base: 3, md: 4 }}
      px={{ base: 3, md: 4 }}
    >
      <Heading
        color={messageConfig[type].headingColor}
        fontSize="sm"
        fontWeight={600}
      >
        {type === "userMessage" ? USER_REFERENCE_NAME : author}
      </Heading>
      {loading ? (
        <BeatLoader color="white" />
      ) : streamLoading ? (
        <MessageContent
          message={message}
          type={type}
          uniqueId={""}
          handleFollowUpQuestion={handleFollowUpQuestion}
        />
      ) : (
        <MessageContent
          message={message}
          type={type}
          uniqueId={""}
          handleFollowUpQuestion={handleFollowUpQuestion}
        />
      )}
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
      minW="220px"
      maxW="220px"
      minH="120px"
      h="100%"
      w="100%"
      padding="16px"
      borderRadius="12px"
      fontSize="14px"
      fontWeight="400"
      color="white"
      bgGradient="linear(to-b, gray.900, brand.bg_base_purple)"
      alignItems="flex-start"
      textAlign="left"
      dropShadow="dark-lg"
      _hover={{
        scale: 1.5,
      }}
      onClick={() => handleFollowUpQuestion(question.trim())}
    >
      <Text whiteSpace="break-spaces">{question}</Text>
    </Button>
  );
};

const MessageContent = ({
  message,
  type,
  handleFollowUpQuestion,
}: Message & { handleFollowUpQuestion: (question: string) => void }) => {
  if (!message?.trim()) return null;
  const { messageBody, messageLinks, messageQuestions, isErrorMessage } =
    separateLinksFromApiMessage(message);
  const showCopyIcon = type === "apiMessage" && message.length;
  
  if (!messageBody?.trim()) return null;

 
  return (
    <>
      <Text whiteSpace="pre-wrap" color={messageConfig[type].color || ""}>
        <MarkdownWrapper text={messageBody.trim()} />
        {showCopyIcon && (
          <Box paddingY={"16px"} maxH={"max-content"} marginTop={"16px"} >
            <CopyResponseButton msg={message} />
          </Box>
        )}
      </Text>

      {isErrorMessage ? null : (
        <Box>
          {Boolean(messageQuestions.length) && (
            <Box paddingTop="16px">
              <Text fontSize="14px" paddingBottom="16px" fontWeight={500}>
                Follow up questions
              </Text>
              <Flex
                alignItems="flex-start"
                justifyContent="flex-start"
                overflowX={messageQuestions?.length >= 2 ? `scroll` : "hidden"}
                gap="24px"
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
            <>
              <Text fontSize="14px" paddingTop="16px" fontWeight={500}>
                Sources
              </Text>
              {messageLinks.map((link, idx) => (
                <div key={idx}>
                  <ClickableLink linkString={link} />
                </div>
              ))}
            </>
          )}
        </Box>
      )}
    </>
  );
};
