import React from "react";

import { AnswerQualityType, FeedbackPayload } from "@/types";
import { Button, Text } from "@chakra-ui/react";

type FeedbackProps = {
  message: AnswerQualityType;
  feedback: FeedbackPayload;
  sendFeedback: (feedback: FeedbackPayload) => Promise<void>;
};

const Feedback = ({ message, feedback, sendFeedback }: FeedbackProps) => {
  const [active, setActive] = React.useState(false);

  const onFeedbackChange = async (feedback: FeedbackPayload) => {
    setActive(!active);

    await sendFeedback({
      ...feedback,
      answerQuality: message,
    });
  };

  return (
    <Button
      isActive={active}
      border={"1px solid white"}
      borderRadius={"0"}
      padding={"4px 13px"}
      justifyContent={"center"}
      fontWeight={"400"}
      bg={"transparent"}
      _active={{
        bg: "button.accent.50",
        fontWeight: "500",
      }}
      onClick={() => {
        onFeedbackChange(feedback);
      }}
    >
      <Text fontSize={"16px"} lineHeight={"18px"}>
        {message}
      </Text>
    </Button>
  );
};

export default Feedback;
