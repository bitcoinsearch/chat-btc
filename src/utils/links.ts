
const regexForLinks = /(^\[\d+\]:\s.*)/gm;

export const separateLinksFromApiMessage = (message: string) => {
  const chunks = message?.split(regexForLinks).filter(value => (value.length>1))
  const messageBody = chunks[0]
  const messageLinks = chunks.slice(1)
  return {messageBody, messageLinks}
}
