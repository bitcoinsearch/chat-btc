import QRCode from "react-qr-code";

import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import useTruncatedString from "@/hooks/useTruncatedString";
import {
  Box,
  Button,
  Checkbox,
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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { usePaymentContext } from "@/contexts/payment-context";
import { paymentTierList } from "@/config/constants";
import { useEffect } from "react";
import { isMobile } from "react-device-detect";

function InvoiceModal() {
  const toast = useToast();
  const { onClose } = useDisclosure();
  const {
    error,
    setError,
    isPaymentModalOpen,
    closePaymentModal,
    payWithWebln,
    autoPaymentInvoice,
    autoPaymentTier,
    autoPaymentLoading,
    selectTieredPayment,
    preferAutoPayment,
    setPreferAutoPayment,
  } = usePaymentContext();
  const copy = useCopyToClipboard();
  const truncatedAutoPayInvoice = useTruncatedString(
    autoPaymentInvoice.payment_request,
    10
  );

  const handleCopyAutoPayInvoice = () => {
    copy(autoPaymentInvoice.payment_request);
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
      position: "top-right",
    });
    setError("");
  }

  useEffect(() => {
    const showPaymentToast = !Boolean(
      window.localStorage.getItem("showInfoPaymentToast") === "false"
    );
    const handleInfoToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        window.localStorage.setItem("showInfoPaymentToast", "false");
      } else {
        window.localStorage.setItem("showInfoPaymentToast", "true");
      }
    };
    if (showPaymentToast && isPaymentModalOpen) {
      toast({
        duration: 10000,
        isClosable: true,
        position: "top",
        render: (props) => (
          <Box
            py={2}
            px={4}
            bgColor="blue.800"
            rounded="md"
            position="relative"
          >
            <Box
              position="absolute"
              top={0}
              right={0}
              mr={3}
              role="button"
              fontSize="lg"
              fontWeight={700}
              color="red.400"
              onClick={() => props.onClose()}
            >
              x
            </Box>
            <Text fontSize="lg" fontWeight={600} textAlign="center">
              We hope you are enjoying ChatBTC
            </Text>
            <Text fontSize="sm">
              To keep this service sustainable (and guard against DoS problems)
              we ask that you pay a few sats.
            </Text>
            <Text fontSize="sm">
              You can pay with WebLN using Alby, pay a lightning invoice, or
              scan the QR code below with a lightning enabled wallet.
            </Text>
            <Box ml="auto" display="flex" justifyContent="flex-end" w="full">
              <Checkbox
                ml="auto"
                width="fit-content"
                onChange={handleInfoToggle}
              >
                Do not show again
              </Checkbox>
            </Box>
          </Box>
        ),
      });
    }
  }, [toast, isPaymentModalOpen]);

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
          Choose payment type
        </ModalHeader>
        <ModalCloseButton
          color={"white"}
          onClick={() => {
            onClose();
            closePaymentModal();
          }}
        />
        <ModalBody>
          <Tabs isFitted size={{ base: "sm", md: "md" }} variant="enclosed">
            <TabList mb={4}>
              <Tab>Buy credits (auto-pay)</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}>
                <Box mb={{ sm: 4, md: 8 }}>
                  <Text fontWeight={600} fontSize="sm" pb={2}>
                    Select a tier
                  </Text>
                  <Flex gap={4} justifyContent="space-between">
                    {paymentTierList.map((tier, index) => (
                      <TierCard
                        key={index}
                        priceInSats={tier.priceInSats}
                        timeForDisplay={tier.timeForDisplay}
                        handleClick={() => selectTieredPayment(tier)}
                        isActive={autoPaymentTier?.id === tier.id}
                      />
                    ))}
                  </Flex>
                </Box>
                {autoPaymentLoading ? (
                  <Flex alignItems="center" justifyContent="center" w="full">
                    <Spinner
                      size="xl"
                      color={"blue.500"}
                      emptyColor="gray.200"
                      thickness="4px"
                    />
                  </Flex>
                ) : autoPaymentInvoice.payment_request ? (
                  <>
                    <Flex gap={4}>
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
                            style={{
                              height: "auto",
                              maxWidth: "100%",
                              width: "100%",
                            }}
                            value={autoPaymentInvoice.payment_request}
                            viewBox={`0 0 256 256`}
                            level={"Q"}
                          />
                        </Box>
                        <PayWithWebLN clickHandler={() => payWithWebln()} />
                      </Box>

                      <Flex flexDir={"column"}>
                        <Code
                          bg={"none"}
                          color={"white"}
                          fontSize={14}
                          textAlign={"center"}
                        >
                          {truncatedAutoPayInvoice}
                        </Code>
                        <Flex justifyContent={"center"} marginY={2}>
                          <Button
                            colorScheme={"blue"}
                            size={"sm"}
                            onClick={handleCopyAutoPayInvoice}
                          >
                            Copy invoice
                          </Button>
                        </Flex>
                        <Text
                          color={"white"}
                          textAlign={"center"}
                          fontSize={15}
                          mt={4}
                        >
                          Scan this QR code or copy and paste it in your
                          lightning enabled wallet.
                        </Text>
                      </Flex>
                    </Flex>
                    <Checkbox
                      mt={5}
                      isChecked={preferAutoPayment}
                      onChange={() => setPreferAutoPayment(!preferAutoPayment)}
                    >
                      Don&apos;t ask me again. Use webln auto-pay for future
                      payments.
                    </Checkbox>
                  </>
                ) : null}
              </TabPanel>
            </TabPanels>
          </Tabs>
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

const TierCard = ({
  handleClick,
  priceInSats,
  timeForDisplay,
  isActive,
}: {
  handleClick: () => void;
  priceInSats: number;
  timeForDisplay: string;
  isActive: boolean;
}) => {
  return (
    <Button
      display="flex"
      flexGrow={1}
      flexDir={"column"}
      h="auto"
      py={4}
      rounded="md"
      bg={isActive ? "orange.200" : "blackAlpha.400"}
      colorScheme="blue"
      onClick={handleClick}
      _disabled={{
        bg: "orange.200",
        _hover: { bg: "orange.200" },
        cursor: "not-allowed",
      }}
      isDisabled={isActive}
    >
      <Box
        display="flex"
        alignItems="end"
        gap={1}
        color={isActive ? "gray.800" : "white"}
      >
        <Text fontSize="2xl" fontWeight={600}>
          {priceInSats}
        </Text>
        <Text fontSize="sm">SATS</Text>
      </Box>
      <Text py={4} fontSize="12px" color={isActive ? "gray.800" : "white"}>
        {timeForDisplay}
      </Text>
    </Button>
  );
};

const PayWithWebLN = ({ clickHandler }: { clickHandler: () => void }) => {
  if (isMobile) return null;
  return (
    <Button mt={5} variant="link" color="orange.200" onClick={clickHandler}>
      Pay with webln?
    </Button>
  );
};
