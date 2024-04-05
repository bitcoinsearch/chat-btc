import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

const MaintenanceBanner = () => {
  return (
    <Flex bgColor='orange.100' pos={'absolute'} right={'0px'} width={'100%'} alignItems='center' zIndex={99}>
      <Box color={"gray.600"} flex='1 1 100%' fontWeight='medium' textAlign='center' padding={"16px"}>
        <Text fontSize={"20px"} fontWeight={"black"} textTransform={"uppercase"}>
          Maintenance ongoing !!!
        </Text>
        <Text fontSize={"16px"}>We are currently undergoing maintenance. We will remove this banner when we are fully operational again.</Text>
      </Box>
    </Flex>
  );
};

export default MaintenanceBanner;
