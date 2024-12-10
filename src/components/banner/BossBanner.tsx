import { Banner } from "@bitcoin-dev-project/bdp-ui";
import { Box } from "@chakra-ui/react";

const BossBanner = () => {
  return (
    <Box
      className={`dark w-full`}
      zIndex={1}
      position={"sticky"}
      top={0}
      width={"full"}
      background={"#171923"}
    >
      <Banner
        headingText="Start your career in bitcoin open source —"
        linkText="APPLY TODAY"
        linkTo="https://learning.chaincode.com/#BOSS"
        hasBoss
        styles={{
          container: "boss-container-bg",
        }}
      />
    </Box>
  );
};

export default BossBanner;
