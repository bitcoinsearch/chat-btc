import { SendIcon } from "@/chakra/custom-chakra-icons";
import { PromptAction } from "@/types";
import { Flex, IconButton, Textarea } from "@chakra-ui/react";
import { FormEvent, useEffect, useRef, useState } from "react";

const InputTextArea = ({submitInput}: {submitInput: PromptAction}) => {
  const [input, setInput] = useState("")
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // auto increase textarea column, max of 3
  useEffect(() => {
    if (textAreaRef?.current) {
      const _textarea = textAreaRef.current;
      const _length = input?.split("\n")?.length;
      _textarea.rows = _length > 3 ? 3 : (Boolean(_length) && _length) || 1;
    }
  }, [input]);

  const handleSubmit = (e: FormEvent) => {
    submitInput(input, "")
  }
  return (
    <form onSubmit={handleSubmit}>
      <Flex gap={2} alignItems="flex-end">
        <Textarea
          ref={textAreaRef}
          placeholder="Type your question here"
          name=""
          id="userInput"
          rows={1}
          resize="none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          bg="gray.700"
          flexGrow={1}
          flexShrink={1}
          // onKeyDown={handleEnter}
        />
        <IconButton aria-label="send chat" icon={<SendIcon />} type="submit" />
      </Flex>
    </form>
  );
};

export default InputTextArea;
