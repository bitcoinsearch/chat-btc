import { AuthorConfig } from '@/utils/authorsConfig'
import { Box, Flex, Text } from '@chakra-ui/react'
import Image from 'next/image'
import React from 'react'
import { PromptAction } from './Home'
import PromptBubble from './PromptBubble'

const AuthorCard = ({author, onPrompt}: {author: AuthorConfig, onPrompt: PromptAction}) => {
  return (
    <>
    <Flex direction="column" gap={3}>
      <Box position="relative" pt="100%" w="full" rounded="full" overflow="hidden" bgColor="blackAlpha.400">
        <Image src={author.imgURL} alt={`author-${author.slug}`} fill={true} />
      </Box>
      <Box textAlign="center">
        <Text fontWeight={600}>{author.name}</Text>
        <Text fontSize="14px" color="gray.400">{author.title}</Text>
      </Box>
      <Flex direction="column" gap={2}>
        {author.questions.map((question, index) => <PromptBubble key={index} onPrompt={onPrompt} author={author.value} text={question} />)}
      </Flex>
    </Flex>
    </>
  )
}

export default AuthorCard