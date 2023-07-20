import error from "./errors-config.json"


export const getErrorByBlockIndex = (idx: number) => {
  if (idx === -1) error.defaultErrorMessage
  return error.errorMessagesByBlock[idx]
}

export const defaultErrorMessage = error.defaultErrorMessage