import { getAllErrorMessages } from "@/config/error-config";

export const messageIsErrorMessage = (message: string) => {
  const errorMessages = getAllErrorMessages();
  return errorMessages.includes(message.trim());
};