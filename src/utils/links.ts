const linksRegex = /(^\[\d+\]:\s.*)/gm;
const questionsRegexIII = /\-[\{]?(\w+|\d+)[\}]?\-[\{]{1,2}(.*[^\}])[\}]{1,2}/g;

export const separateLinksFromApiMessage = (message: string) => {
  const filterFunc = (arg: string, regex: RegExp | string): string[] => {
    return arg
      ?.trim()
      ?.split(regex)
      .filter((v) => v?.length > 1);
  };

  const chunks = message.split(linksRegex).filter((value) => value.length > 1);
  const bodyAndQuestionsII = filterFunc(chunks[0], questionsRegexIII) ?? [];

  const body = bodyAndQuestionsII[0];
  const questions =
    bodyAndQuestionsII
      .slice(1)
      .map((i) => {
        if (i.startsWith("question_")) {
          i = i.trim().replace("question_", "");
        } else if (i.startsWith("-")) {
          i = i.replace("-", "").trim();
        }
        return i;
      })
      .filter((v) => {
        return v.trim()?.length > 1;
      }) ?? [];

  const messageBody = body;
  const messageQuestions = questions;
  const messageLinks = chunks.slice(1);

  return { messageBody, messageLinks, messageQuestions };
};
