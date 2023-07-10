import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { BeatLoader } from "react-spinners";
import styles from "./message.module.css"
import NextLink from "next/link";
import { LinkShareIcon } from "@/chakra/custom-chakra-icons";
import { USER_REFERENCE_NAME } from "@/config/ui-config";
import { separateLinksFromApiMessage } from "@/utils/links";

type MessageType = "userMessage" | "authorMessage" | "apiMessage" | "errorMessage" | "apiStream";
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
}: {
  content: Message;
  author: string;
  loading?: boolean;
  streamLoading?: boolean;
}) => {
  const {message, type} = content

  // const bodyRegex = /^\[\d+\]:/gm
  // const urlRegex = /^\[\d+\]:(.*)/gm
  // const messageLinks = message?.match(urlRegex)

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
      {/* <Box w="100%" bgColor={type === "userMessage" ? "gray.800" : "gray.600"} py="8" px={{base: 3, md: 4}}> */}
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
        <StreamMessageContent message={message} type={type} uniqueId={""} />
      ) : (
        <MessageContent message={message} type={type} uniqueId={""} />
      )}
    </Flex>
  );
};

export default MessageBox;

const MessageContent = ({message, type}: Message) => {
  const { messageBody, messageLinks } = separateLinksFromApiMessage(message)

  const ClickableLink = ({linkString}: {linkString: string}) => {
    let url = linkString.split(" ")[1].trim()
    return (
      <a href={url} target="_blank" rel="noreferrer" className={styles.reference_link}>
        {linkString} <span style={{marginLeft: "5px"}}><LinkShareIcon /></span>
      </a>
    )
  }

  if (!messageBody.trim()) return null

  return (
    <>
      <Text whiteSpace="pre-wrap" color={messageConfig[type].color || ""}>
        {messageBody.trim()}
      </Text>
      {Boolean(messageLinks.length) && 
        <Box>
          <Text fontSize="14px" fontWeight={500}>Sources</Text>
          {messageLinks.map((link, idx) => (
            <div key={idx}>
              <ClickableLink linkString={link} />
            </div>
          ))}
        </Box>
      }
    </>
  )
}

const StreamMessageContent = ({message, type}: Message) => {
  return (
    <>
      <Text whiteSpace="pre-wrap" color={messageConfig[type].color || ""}>
        {message.trim()}
      </Text>
    </>
  )
}
