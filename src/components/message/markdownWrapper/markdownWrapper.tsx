import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import atomDark from "react-syntax-highlighter/dist/cjs/styles/prism/atom-dark";
import styles from ".././message.module.css";
import Image from "next/image";
import CopyIcon from "@/assets/CopyIcon";
import { useState } from "react";
import rehypeInlineCodeProperty from "../../../utils/rehypeInlineCodeProperty";
import { useCopyToClipboard } from "usehooks-ts";
import { Box, Flex, Text } from "@chakra-ui/react";
import TickIcon from "@/assets/TickIcon";

export const CopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  return (
    <div
      role="button"
      data-copied={copied}
      className={styles.copyCodeblock}
      onClick={() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
      }}
      onMouseLeave={() =>
        setTimeout(() => {
          setCopied(false);
        }, 1000)
      }
    >
      <CopyIcon />
    </div>
  );
};

export const CopyResponseButton = ({
  msg,
  isCopyText,
}: {
  msg: string;
  isCopyText?: boolean;
}) => {
  const [copiedValue, setCopiedValue] = useCopyToClipboard();
  const [afterCopied, setAfterCopied] = useState(false);
  const onClickCopy = () => {
    setCopiedValue(msg);
    setAfterCopied(true);
    setTimeout(() => {
      setAfterCopied(false);
    }, 2000);
  };
  return (
    <Flex
      onClick={onClickCopy}
      cursor={"pointer"}
      alignItems={"center"}
      gap={1}
      maxWidth={"max-content"}
    >
      {isCopyText && <Text>{afterCopied ? "Copied" : "Copy"}</Text>}
      {afterCopied ? <TickIcon /> : <CopyIcon />}
    </Flex>
  );
};
const MarkdownWrapper = ({
  text,
  className,
}: {
  text: string;
  className?: string | null | undefined;
}) => {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeInlineCodeProperty]}
      className={`${styles.markdownClass} ${className}`}
      components={{
        code(props) {
          const { children, className, node, ref, style, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          // match returns a match and capture group in an array of the codeblock language given the className.
          // e.g the className is 'language-python', match returns ['language-python', 'python'] or null
          const codeString = String(children).replace(/\n$/, "");
          const isCodeblock = node?.properties?.isBlock;
          return match || isCodeblock ? (
            <div style={{ position: "relative" }}>
              <CopyButton code={codeString} />
              <SyntaxHighlighter
                {...rest}
                ref={ref as React.LegacyRef<SyntaxHighlighter> | undefined}
                PreTag="div"
                language={match ? match[1] : ""}
                style={atomDark}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export default MarkdownWrapper;
