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
        linkText="APPLY FOR THE ₿OSS CHALLENGE TODAY"
        linkTo="https://bosschallenge.xyz"
        hasBoss
        styles={{
          container: "boss-container-bg",
        }}
      />
    </Box>
  );
};

export default BossBanner;
