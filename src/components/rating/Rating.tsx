import { useEffect, useRef, useState } from "react";
import { ThumbDownIcon, ThumbUpIcon } from "@/chakra/custom-chakra-icons";
import { SupaBaseDatabase } from "@/database/database";
import { AnswerQuality, FeedbackPayload, Ratings } from "@/types";
import {
  Button,
  Flex,
  Text,
  Textarea,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerCloseButton,
} from "@chakra-ui/react";

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
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState("");
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
    const { status, error } = await SupaBaseDatabase.getInstance().addFeedback({
      ...feedback,
      feedbackId,
    });

    if (status >= 200 && status < 300 && !error) {
      setIsFeedbackSubmitted(true);
      console.log("Feedback sent successfully");
    }
  };

  if (!isResponseGenerated) {
    return null;
  }

  const openFeedbackModal = async (feedback: FeedbackPayload) => {
    return setIsFeedbackOpen(true);
  };

  return (
    <Flex flexDir='column' alignItems='flex-start' gap='8' mt='8' pl={4} pb={4}>
      <Flex flexDir='column' alignItems='flex-start' gap={2}>
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
            return <Feedback message={value} key={key} feedback={feedback} sendFeedback={key === "other" ? openFeedbackModal : sendFeedback} />;
          })}
        </Flex>
      ) : null}

      {isFeedbackOpen ? (
        <>
          {feedback.rating === Ratings.NEGATIVE && Object.keys(AnswerQuality).map((key) => key === "other") ? (
            <div>
              <Drawer placement='bottom' onClose={() => setIsFeedbackOpen(false)} isOpen={isFeedbackOpen}>
                <DrawerOverlay />
                <DrawerContent>
                  <DrawerCloseButton />
                  <DrawerHeader fontSize={{ sm: "16px", md: "20px" }}>Provide additional feedback</DrawerHeader>
                  <DrawerBody>
                    <div>
                      <Textarea
                        placeholder='please provide more information here'
                        name=''
                        id='feedbackInput'
                        rows={3}
                        resize='none'
                        maxH='200px'
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        fontSize={{ sm: "14px", md: "16px" }}
                      />
                    </div>
                  </DrawerBody>
                  <DrawerFooter>
                    <Button
                      border={"1px solid white"}
                      borderRadius={"4px"}
                      padding={{ sm: "2px 10px", md: "4px 13px" }}
                      justifyContent={"center"}
                      fontWeight={"400"}
                      bg={"transparent"}
                      outline={"none"}
                      onClick={() => {
                        sendFeedback({ ...feedback, answerQuality: feedbackInput });
                        setIsFeedbackOpen(false);
                      }}
                    >
                      <Text fontSize={"14px"} lineHeight={"18px"}>
                        Submit feedback
                      </Text>
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          ) : null}
        </>
      ) : null}
    </Flex>
  );
};

export default Rating;
