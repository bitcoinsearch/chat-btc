import { responseData, responseDataBody, responseDataFUQ, responseDataLinks } from "./__mocks__/apiResponse";
import { separateLinksFromApiMessage } from "../utils/links";

describe("apiMessageSeparator", () => {
  const {messageBody, messageLinks, messageQuestions} = separateLinksFromApiMessage(responseData);
  test("equalMessageBody", () => {
    expect(messageBody.trim()).toBe(responseDataBody.trim());
  });
  test("equalMessageLinks", () => {
    expect(messageLinks.length).toBe(6);
  });
  test("equalMessageQuestions", () => {
    expect(messageQuestions.length).toBe(4);
  });
});