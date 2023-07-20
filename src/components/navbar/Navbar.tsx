import { Box, Container, Divider, Flex, Text } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

const Navbar = () => {
  return (
    <Box as="nav"
      position="fixed"
      h={12}
      w="full"
      boxShadow="md"
      bgColor="gray.900"
      fontSize="14px"
      isolation="isolate"
      zIndex={1}
    >
      <Flex alignItems="center" h="full" px={4}>
        <Link href="/">
          <Text>chat<span style={{ color: "var(--chakra-colors-orange-400)" }}>
              btc
            </span></Text>
        </Link>
        <Box h="full" mx={4} py={2}>
          <Divider orientation='vertical' />
        </Box>
      </Flex>
    </Box>
  )
}

export default Navbar