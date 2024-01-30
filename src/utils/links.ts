const splitBodyRegex = /([\s\S]*?)(?=\n\n(?:-\d+-\{\{|\[\d+\]:))/;
const questionsRegex = /-\d+-\{\{(.*?)\}\}/g;

export const separateLinksFromApiMessage = (message: string) => {
  const filterFunc = (arg: string, regex: RegExp | string): string[] => {
    return arg
      ?.trim()
      ?.split(regex)
      .filter((v) => v.length > 1);
  };

  const extractBodyParts = message?.split(splitBodyRegex).filter((v) => v.length > 1);

  const messageBody = extractBodyParts[0];
  const messageQuestions = filterFunc(extractBodyParts[1], questionsRegex) ?? [];
  const messageLinks = filterFunc(extractBodyParts[2], "\n") ?? [];

  return { messageBody, messageLinks, messageQuestions };
};
