import QRCode from "react-qr-code";

import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import useTruncatedString from "@/hooks/useTruncatedString";
import {
  Box,
  Button,
  Checkbox,
  Code,
  Flex,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { usePaymentContext } from "@/contexts/payment-context";
import { useEffect } from "react";

function InvoiceModal() {
  const toast = useToast();
  const { onClose } = useDisclosure();
  const { invoice, error, setError, loading, isPaymentModalOpen, closePaymentModal, payWithWebln } =
    usePaymentContext();
  const copy = useCopyToClipboard();
  const truncatedStr = useTruncatedString(invoice.payment_request, 10);

  const handleCopy = () => {
    copy(invoice.payment_request);
    toast({
      title: "Invoice copied to clipboard",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  if (error) {
    toast({
      title: "Error",
      status: "error",
      description: error,
      duration: null,
      isClosable: true,
      position: "top-right"
    });
    setError("")
  }

  useEffect(() => {
    const showPaymentToast = !Boolean(window.localStorage.getItem("showInfoPaymentToast") === "false")
    const handleInfoToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        window.localStorage.setItem("showInfoPaymentToast", "false")
      } else {
        window.localStorage.setItem("showInfoPaymentToast", "true")
      }
    }
    if (showPaymentToast && isPaymentModalOpen) {
      toast({
        duration: 10000,
        isClosable: true,
        position: "top",
        render: (props) => (
          <Box py={2} px={4} bgColor="blue.800" rounded="md" position="relative">
            <Box position="absolute" top={0} right={0} mr={3} role="button" fontSize="lg" fontWeight={700} color="red.400" onClick={() => props.onClose()}>x</Box>
            <Text fontSize="lg" fontWeight={600} textAlign="center">Free Chat Exhausted</Text>
            <Text fontSize="sm">You have exhausted your free chat on ChatBTC. All subsequent chat queries must be paid for</Text>
            <Text fontSize="sm">You can pay with webln using alby, pay a lightning invoice, or scan the QR code below with a lightning enabled wallet</Text>
            <Box ml="auto" display="flex" justifyContent="flex-end" w="full">
              <Checkbox ml="auto" width="fit-content" onChange={handleInfoToggle}>Do not show again</Checkbox>
            </Box>
          </Box>
        )
      });
    }
  }, [toast, isPaymentModalOpen])
  
  return (
    <Modal
      isCentered
      onClose={onClose}
      isOpen={isPaymentModalOpen}
      motionPreset="slideInBottom"
    >
      <ModalOverlay />
      <ModalContent bgColor={"#0D2333"}>
        <ModalHeader textAlign={"center"} color={"white"}>
          Scan to pay
        </ModalHeader>
        <ModalCloseButton
          color={"white"}
          onClick={() => {
            onClose();
            closePaymentModal();
          }}
        />
        <ModalBody display={"flex"} justifyContent={"center"} columnGap={4}>
          {loading && !invoice.payment_request ? (
            <Spinner
              size="xl"
              color={"blue.500"}
              emptyColor="gray.200"
              thickness="4px"
            />
          ) : (
            <>
              <Box maxWidth={200} width={"100%"}>
                <Box
                  height={"auto"}
                  margin={"0 auto"}
                  width={"100%"}
                  border={"1px solid"}
                  padding={2}
                  bg={"white"}
                  bgColor={"white"}
                  borderRadius={"md"}
                >
                  <QRCode
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={invoice.payment_request}
                    viewBox={`0 0 256 256`}
                    level={"Q"}
                  />
                </Box>
                <Button mt={5} variant="link" color="orange.200" onClick={payWithWebln}>Pay with webln?</Button>
              </Box>
              <Flex flexDir={"column"}>
                <Code
                  bg={"none"}
                  color={"white"}
                  fontSize={14}
                  textAlign={"center"}
                >
                  {truncatedStr}
                </Code>
                <Flex justifyContent={"center"} marginY={2}>
                  <Button colorScheme={"blue"} size={"sm"} onClick={handleCopy}>
                    Copy invoice
                  </Button>
                </Flex>
                <Text color={"white"} textAlign={"center"} fontSize={15} mt={4}>
                  Scan this QR code or copy and paste it in your lightning
                  enabled wallet.
                </Text>
              </Flex>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="red"
            size={"sm"}
            mr={3}
            onClick={() => {
              onClose();
              closePaymentModal();
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default InvoiceModal;
