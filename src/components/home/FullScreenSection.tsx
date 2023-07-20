import { Container, ContainerProps } from '@chakra-ui/react'
import styles from "./home.module.css"

const FullScreenSection = ({children, ...props}: {children: React.ReactNode, props: ContainerProps}) => {
  return (
    <Container maxW="container.lg" centerContent {...props}>
      {children}
    </Container>
  )
}

export default FullScreenSection