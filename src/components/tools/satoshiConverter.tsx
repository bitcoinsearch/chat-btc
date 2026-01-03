import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Text,
  Input,
  InputGroup,
  InputRightAddon,
  VStack,
  Divider,
  Spinner,
  Flex,
  IconButton,
  Tooltip,
  useToast,
  Badge,
} from "@chakra-ui/react";
import { BitcoinIcon, RefreshIcon } from "@/chakra/custom-chakra-icons";

const SatsConverter = () => {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [usdValue, setUsdValue] = useState<string>("");
  const [btcValue, setBtcValue] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const toast = useToast();

  // --- ROBUST FETCHING STRATEGY ---
  const fetchPrice = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Try Binance API (Fastest)
      try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        if (!res.ok) throw new Error("Binance failed");
        const data = await res.json();
        const price = parseFloat(data.price);
        setBtcPrice(price);
        setLastUpdated(new Date());
        setLoading(false);
        return; // Success, exit
      } catch (e) {
        console.warn("Binance API failed, trying CoinGecko...", e);
      }

      // 2. Fallback to CoinGecko
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        if (!res.ok) throw new Error("CoinGecko failed");
        const data = await res.json();
        setBtcPrice(data.bitcoin.usd);
        setLastUpdated(new Date());
        setLoading(false);
        return; // Success, exit
      } catch (e) {
        console.warn("CoinGecko API failed, trying CoinDesk...", e);
      }

      // 3. Fallback to CoinDesk
      const res = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json");
      if (!res.ok) throw new Error("All APIs failed");
      const data = await res.json();
      setBtcPrice(data.bpi.USD.rate_float);
      setLastUpdated(new Date());

    } catch (error) {
      console.error("All price APIs failed:", error);
      toast({
        title: "Price Fetch Failed",
        description: "Could not fetch live BTC price. Using fallback.",
        status: "error",
        duration: 3000,
      });
      // Fallback
      if (!btcPrice) setBtcPrice(95000); 
    } finally {
      setLoading(false);
    }
  }, [btcPrice, toast]);

  // Initial Fetch
  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  // Handle Conversions (BTC <-> USD)
  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsdValue(val);
    if (val && btcPrice) {
      // BTC = USD / Price
      const btc = parseFloat(val) / btcPrice;
      // Show up to 8 decimal places for BTC accuracy
      setBtcValue(btc.toFixed(8).replace(/\.?0+$/, "")); 
    } else {
      setBtcValue("");
    }
  };

  const handleBtcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBtcValue(val);
    if (val && btcPrice) {
      // USD = BTC * Price
      const usd = parseFloat(val) * btcPrice;
      setUsdValue(usd.toFixed(2));
    } else {
      setUsdValue("");
    }
  };

  return (
    <Box
      p={4}
      bg="gray.800"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.700"
      w="full"
      color="white"
      boxShadow="lg"
    >
      {/* Header with Refresh */}
      <Flex align="center" justify="space-between" mb={3}>
        <Text fontWeight="bold" fontSize="sm" display="flex" alignItems="center" gap={2}>
          <BitcoinIcon boxSize="4" color="orange.400" /> BTC Converter
        </Text>
        
        <Flex align="center" gap={2}>
            {loading ? (
                <Spinner size="xs" color="orange.400" />
            ) : (
                <Tooltip label="Refresh Price" fontSize="xs">
                    <IconButton 
                        aria-label="Refresh Price"
                        icon={<RefreshIcon />}
                        size="xs"
                        variant="ghost"
                        color="gray.400"
                        onClick={fetchPrice}
                        _hover={{ color: "white", bg: "whiteAlpha.200" }}
                    />
                </Tooltip>
            )}
        </Flex>
      </Flex>

      {/* Live Price Display */}
      <Flex justify="space-between" align="center" mb={3}>
         <Badge colorScheme="green" variant="solid" fontSize="0.7rem" px={2} borderRadius="full">
            LIVE
         </Badge>
         <Text fontSize="xs" color="gray.400" fontWeight="mono">
            1 BTC = ${btcPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
         </Text>
      </Flex>

      <Divider mb={4} borderColor="gray.600" />

      {/* Inputs */}
      <VStack spacing={4}>
        <InputGroup size="sm">
          <Input
            placeholder="0.00"
            value={usdValue}
            onChange={handleUsdChange}
            type="number"
            bg="blackAlpha.300"
            borderColor="gray.600"
            _focus={{ borderColor: "orange.400", boxShadow: "none" }}
            color="white"
          />
          <InputRightAddon bg="gray.700" borderColor="gray.600" color="gray.300">
            USD
          </InputRightAddon>
        </InputGroup>

        <Flex w="full" justify="center">
            <Text fontSize="xs" color="gray.500">⇅</Text>
        </Flex>

        <InputGroup size="sm">
          <Input
            placeholder="0"
            value={btcValue}
            onChange={handleBtcChange}
            type="number"
            bg="blackAlpha.300"
            borderColor="gray.600"
            _focus={{ borderColor: "orange.400", boxShadow: "none" }}
            color="white"
          />
          <InputRightAddon bg="gray.700" borderColor="gray.600" color="gray.300">
            BTC
          </InputRightAddon>
        </InputGroup>
      </VStack>

      {/* Timestamp Footer */}
      {lastUpdated && (
        <Text fontSize="10px" color="gray.600" mt={3} textAlign="center">
            Updated: {lastUpdated.toLocaleTimeString()}
        </Text>
      )}
    </Box>
  );
};

export default SatsConverter;