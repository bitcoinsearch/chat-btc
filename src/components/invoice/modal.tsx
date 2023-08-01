import QRCode from "react-qr-code";

import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import useTruncatedString from "@/hooks/useTruncatedString";
import {
  Box,
  Button,
  Code,
  Flex,
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
