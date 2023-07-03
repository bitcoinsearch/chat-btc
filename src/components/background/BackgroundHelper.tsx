import { BitcoinIcon, LightBulbIcon, PencilIcon } from '@/chakra/custom-chakra-icons';
import { Box, Button, Flex, Grid, GridItem, Heading, Icon, Text } from '@chakra-ui/react';
import React from 'react';

type TextBubble = {text: string, type: "prompt" | "about"}

type Props = {
  promptChat: (e: any, x: string) => void;
}

const textBubbles: TextBubble[] = [
  {text: "What are the benefits of using miniscript?", type: "prompt"},
  {text: "We don't log your IP address or any personal info", type: "about"},
  {text: "Why is SegWit a useful upgrade?", type: "prompt"},
  {text: "Data sourced from bitcoin-dev mailing list, Bitcointalk, Lightning dev mailing list, Bitcoin StackExchange, Bitcoin Optech, & BTC Transcripts", type: "about"},
  {text: "Why would we want PTLCs rather than HTLCs?", type: "prompt"},
  {text: "Built with ❤️ by Chaincode Labs.", type: "about"},
]

const BackgroundHelper = ({promptChat}: Props) => {

  const TextBubble = ({item}: {item: TextBubble}) => {
    return (
      <Grid w="full" h="full"  bgColor={"gray.700"} placeItems="center" p={2} rounded="xl"
      >
        <Text fontSize={{base: "10px", md: "14px"}} fontWeight={{base: 600, md: 500}} 
          textAlign="center"
          color={"orange.400"}
          cursor={"default"}
        >
          {item.text}
        </Text>
      </Grid>
    )
  }
  const PromptBubble = ({item}: {item: TextBubble}) => {
    const handleBubbleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      promptChat(e, item.text)
    }
    return (
      <Button variant="unstyled" w="full" h="full"  bgColor={"gray.500"} placeItems="center" p={2} rounded="xl"
        onClick={(e) => handleBubbleClick(e)} 
        cursor={"pointer"}
        _hover={{bgColor: "orange.200", color: "gray.700"}}
        _active={{bgColor: "orange.300", color: "gray.700" }}
      >
        <Text fontSize={{base: "10px", md: "14px"}} fontWeight={{base: 600, md: 500}} 
          textAlign="center"
        >
          {`"${item.text}"`}
        </Text>
      </Button>
    )
  }

  return (
    <Box p={2}>
      <Text mt={4} textAlign="center" fontSize={{base: "sm", md:"lg"}} fontWeight="bold" color="gray.400" >Explore & learn technical bitcoin concepts and their history</Text>
      <Grid templateColumns="1fr 1fr" gap={{base: 6, md: 8}} mt={{base: 14, md: 16}} w="80%" maxW="600px" mx="auto">
        <GridItem>
          <Flex direction="column" justifyContent="center" alignItems="center" gap={2}>
            <PencilIcon
              fontSize={{ base: "4xl", md: "7xl" }}
              color="orange.400"
            />
            <Text fontSize={{base: "12px", md: "18px"}} textAlign="center" fontWeight={700}>Prompt Examples</Text>
          </Flex>
        </GridItem>
        <GridItem>
          <Flex direction="column" justifyContent="center" alignItems="center" gap={2}>
            <LightBulbIcon
              fontSize={{ base: "4xl", md: "7xl" }}
              color="orange.400"
            />
            <Text fontSize={{base: "12px", md: "18px"}} textAlign="center" fontWeight={700}>About</Text>
          </Flex>
        </GridItem>
        {textBubbles.map((item, idx) => {
          const isPrompt = item.type === "prompt";
          return (
            <GridItem key={idx}>
              {isPrompt ? <PromptBubble item={item} /> : <TextBubble item={item} />}
            </GridItem>
          )
        })}
      </Grid>
    </Box>
  )
}

export default BackgroundHelper;

