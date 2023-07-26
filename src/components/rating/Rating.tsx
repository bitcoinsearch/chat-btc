import { useEffect, useRef, useState } from "react";

import { ThumbDownIcon, ThumbUpIcon } from "@/chakra/custom-chakra-icons";
import { isSupabaseInitialized, addFeedback } from "@/database/database";
import { AnswerQuality, FeedbackPayload, Ratings } from "@/types";
import { Button, Flex, Text } from "@chakra-ui/react";

import Feedback from "./feedback";

interface RatingProps {
  isResponseGenerated: boolean;
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
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const feedbackRef = useRef<HTMLDivElement | null>(null);

  const showAnswerQuality =
    feedback.rating === Ratings.NEGATIVE && !feedback.answerQuality;

  useEffect(() => {
    if (isResponseGenerated) {
      setFeedback(defaultFeedback);
    }
  }, [isResponseGenerated]);

  useEffect(() => {
    if (showAnswerQuality) {
      feedbackRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [feedback, showAnswerQuality]);

  const sendFeedback = async (feedback: FeedbackPayload) => {
    setFeedback(feedback);
    if (feedback.rating === Ratings.NEGATIVE && !feedback.answerQuality) {
      return;
    }

    if (isSupabaseInitialized) {
      // TODO: Since this function returns true or false, we should assign the
      // return value to a variable and check if the feedback was submitted
      await addFeedback(feedback, feedbackId);
    } else {
      console.error('Cannot submit rating because supabase is not initialized');
    }
    // TODO: properly replace this to close negative ratings
    // without indicating it was properly sent
    setIsFeedbackSubmitted(true);
  };

  if (!isResponseGenerated) {
    return null;
  }

  return (
    <Flex
      flexDir="column"
      alignItems="flex-start"
      gap="8"
      mt="8"
      pl={4}
      pb={4}
    >
      <Flex flexDir="column" alignItems="flex-start" gap={2}>
        <Text fontWeight={500} fontSize={14}>
          Answer quality
        </Text>
        <Flex gap={2}>
          {Object.entries(thumbsIcon).map(([key, value]) => {
            return (
              <Button
                isActive={feedback.rating === Number(key)}
                isDisabled={isFeedbackSubmitted}
                key={key}
                alignItems={"center"}
                justifyContent={"center"}
                borderRadius={0}
                padding={0}
                width={"45px"}
                border={"1px solid white"}
                bg={"transparent"}
                outline={"none"}
                _active={{
                  bg: "button.accent.100",
                  border: "none",
                  outline: "none",
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

      {feedback.rating === Ratings.NEGATIVE && !isFeedbackSubmitted ? (
        <Flex wrap={"wrap"} maxW={"400px"} gap={"10px"} ref={feedbackRef}>
          <Text fontWeight={500} fontSize={14}>
            What was the issue with this response?
          </Text>
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
      ) : null}
    </Flex>
  );
};

export default Rating;
