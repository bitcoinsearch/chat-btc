import { SendIcon } from '@/chakra/custom-chakra-icons';
import { PromptAction } from '@/types';
import { Flex, IconButton, Textarea } from '@chakra-ui/react';
import { FormEvent, useRef, useState } from 'react';
import { handleTextAreaChange } from '@/utils/text';
import { isMobile } from 'react-device-detect';

const InputTextArea = ({ submitInput }: { submitInput: PromptAction }) => {
  const [input, setInput] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitInput(input, '', { startChat: true });
  };

    const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isMobile) {
        e.preventDefault();
      } else {
        if (!e.shiftKey && input) {
          handleSubmit(e);
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex gap={2} alignItems='flex-end'>
        <Textarea
          ref={textAreaRef}
          placeholder='Type your question here'
          name=''
          id='userInput'
          rows={1}
          resize='none'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          bg='gray.700'
          flexGrow={1}
          flexShrink={1}
          onKeyDown={handleEnter}
          maxH='200px'
          onInput={handleTextAreaChange}
        />
        <IconButton aria-label='send chat' icon={<SendIcon />} type='submit' />
      </Flex>
    </form>
  );
};

export default InputTextArea;
