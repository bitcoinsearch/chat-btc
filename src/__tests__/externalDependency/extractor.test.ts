import { GPTKeywordExtractor } from "@/service/chat/extractor";
import { chatHistory, chatHistoryContextAware, chatHistorySwitchContext } from "@/__tests__/__mocks__/mockChatHistory";

describe("GPTKeywordExtractor", () => {
  it("should extract keywords from a given history", async () => {
    const keywords = await GPTKeywordExtractor(chatHistory);
    expect(keywords).toContain("OP_CODES");
  });

  it("should return context aware keywords", async () => {
    const keywords = await GPTKeywordExtractor(chatHistoryContextAware);
    const lowerCaseKeywords = keywords?.map(keyword => keyword.toLowerCase());
    expect(lowerCaseKeywords).toContain("segwit");
  });

  it("should switch context", async () => {
    const keywords = await GPTKeywordExtractor(chatHistorySwitchContext);
    expect(keywords).not.toContain("segwit");
  });
});