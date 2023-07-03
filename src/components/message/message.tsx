import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { BeatLoader } from "react-spinners";
import styles from "./message.module.css"

export interface Message {
  message: string;
  type: "userMessage" | "apiMessage" | "errorMessage" | "apiStream";
  uniqueId: string;
}

type MessageType = "userMessage" | "apiMessage" | "errorMessage" | "apiStream";

type MessageConfig = {
  [key in MessageType]: {
    color: string | null;
    bg: string;
    text: string;
    headingColor: string;
  };
};

const messageConfig: MessageConfig = {
  apiMessage: {
    color: null,
    bg: "gray.600",
    text: "ChatBTC",
    headingColor: "orange.400",
  },
  userMessage: {
    color: null,
    bg: "gray.800",
    text: "You",
    headingColor: "purple.400",
  },
  errorMessage: {
    color: "red.200",
    bg: "gray.600",
    text: "ChatBTC",
    headingColor: "red.500",
  },
  apiStream: {
    color: null,
    bg: "gray.600",
    text: "ChatBTC",
    headingColor: "orange.400",
  },
};

const MessageBox = ({
  content,
  loading,
  streamLoading,
}: {
  content: Message;
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
        {messageConfig[type].text}
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
  const splitRegex = /(^\[\d+\]:\s.*)/gm
  const chunks = message?.split(splitRegex).filter(value => (value.length>1))
  const messageBody = chunks[0]
  const messageLinks = chunks.slice(1)

  const ClickableLink = ({linkString}: {linkString: string}) => {
    let url = linkString.split(" ")[1].trim()
    return <a href={url} target="_blank" rel="noreferrer" className={styles.reference_link}>{linkString}</a>
  }

  if (!chunks) return null

  return (
    <>
      <Text whiteSpace="pre-wrap" color={messageConfig[type].color || ""}>
        {messageBody}
      </Text>
      <Box>
        {messageLinks.map((link, idx) => (
          <div key={idx}>
            <ClickableLink linkString={link} />
          </div>
        ))}
      </Box>
    </>
  )
}

const StreamMessageContent = ({message, type}: Message) => {
  return (
    <>
      <Text whiteSpace="pre-wrap" color={messageConfig[type].color || ""}>
        {message}
      </Text>
    </>
  )
}
