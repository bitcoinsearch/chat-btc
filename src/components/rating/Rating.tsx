import { useEffect, useState } from "react";

import { ThumbDownIcon, ThumbUpIcon } from "@/chakra/custom-chakra-icons";
import { SupaBaseDatabase } from "@/database/database";
import { AnswerQuality, FeedbackPayload, Ratings } from "@/types";
import { Button, Flex, Text } from "@chakra-ui/react";

import Feedback from "./feedback";

interface RatingProps {
  isResponseGenerated?: boolean;
  feedbackId: string;
}

const thumbsIcon = {
  "1": <ThumbUpIcon />,
  "-1": <ThumbDownIcon />,
} as const;

const defaultFeedback = {
  rating: 0,
  answerQuality: null,
  timestamp: new Date().toISOString(),
  feedbackId: "",
};

const Rating = ({ isResponseGenerated, feedbackId }: RatingProps) => {
  const [feedback, setFeedback] = useState<FeedbackPayload>(defaultFeedback);

  useEffect(() => {
    if (isResponseGenerated) {
      setFeedback(defaultFeedback);
    }
  }, [isResponseGenerated]);

  const sendFeedback = async (feedback: FeedbackPayload) => {
    setFeedback(feedback);
    if (feedback.rating === Ratings.NEGATIVE && !feedback.answerQuality) {
      return;
    }

    await SupaBaseDatabase.getInstance().addFeedback({
      ...feedback,
      feedbackId,
    });
  };

  if (!isResponseGenerated) {
    return null;
  }

  return (
    <Flex flexDir="column" alignItems="flex-start" width={"400px"} gap="10">
      <Flex flexDir="column" alignItems="flex-start" gap={2}>
        <Text fontWeight={500}>Answer quality</Text>
        <Flex gap={2}>
          {Object.entries(thumbsIcon).map(([key, value]) => {
            return (
              <Button
                isActive={feedback.rating === Number(key)}
                key={key}
                alignItems={"center"}
                justifyContent={"center"}
                borderRadius={0}
                padding={0}
                width={"45px"}
                border={"1px solid white"}
                bg={"transparent"}
                _active={{
                  bg: "button.accent.100",
                  border: "none",
                }}
                onClick={() => {
                  sendFeedback({
                    ...feedback,
                    answerQuality: null,
                    rating: Number(key),
                  });
                }}
              >
                {{
                  ...value,
                  props: {
                    ...value.props,
                    color: feedback.rating === Number(key) ? "#000" : "#fff",
                  },
                }}
              </Button>
            );
          })}
        </Flex>
      </Flex>

      {feedback?.rating === Ratings.NEGATIVE && (
        <Flex wrap={"wrap"} maxW={"400px"} gap={"10px"}>
          <Text fontWeight={500}>What was the issue with this response?</Text>
          {Object.entries(AnswerQuality).map(([key, value]) => {
            return (
              <Feedback
                message={value}
                key={key}
                feedback={feedback}
                sendFeedback={sendFeedback}
              />
            );
          })}
        </Flex>
      )}
    </Flex>
  );
};

export default Rating;
