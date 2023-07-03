import { SupaBaseDatabase } from "@/database/database";
import { useEffect, useState } from "react";

interface RatingProps {
  messageId: string;
  rateAnswer: (messageId: string, value: number) => void;
}

const Rating = ({ messageId, rateAnswer }: RatingProps) => {
  const [rating, setRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (feedbackSubmitted) {
      // Clear the feedbackSubmitted state after 3 seconds
      const setTimeoutId = setTimeout(() => {
        setFeedbackSubmitted(false);
      }, 3000);
      // Cleanup on unmount
      return () => clearTimeout(setTimeoutId);
    }
  }, [feedbackSubmitted]);

  const onRatingChange = async (value: number) => {
    setRating(value);
    setFeedbackSubmitted(true);
  
    // Moved from the rateAnswer function
    const currentdate = new Date().toISOString();
    await SupaBaseDatabase.getInstance().updateData(
      value,
      messageId,
      currentdate
    );
  
    // Reset feedbackSubmitted state after 3 seconds
    setTimeout(() => {
      setFeedbackSubmitted(false);
    }, 3000);
  };

  return (
    <div>
      {feedbackSubmitted ? (
        <span>
          Your feedback is recorded. You can update it after 3 seconds.
        </span>
      ) : (
        <>
          <span>Rate this answer:</span>
          {["😢", "😐", "🥳"].map((value, index) => (
            <button
              key={index + 1}
              onClick={() => onRatingChange(index + 1)}
              disabled={rating === index + 1}
            >
              {value}
            </button>
          ))}
        </>
      )}
    </div>
  );
};

export default Rating;
