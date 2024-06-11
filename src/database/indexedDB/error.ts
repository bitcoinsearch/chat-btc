export const parseErrorMessageFromUnknown = (error: unknown): string => {
  const errMsg =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : error instanceof Object
      ? JSON.stringify(error)
      : "Unknown error";
  return errMsg;
};

export class RepositoryError extends Error {
  name: string;
  constructor(message?: string | unknown | Error) {
    super(parseErrorMessageFromUnknown(message));
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends RepositoryError {}

export class UnknownDBError extends RepositoryError {}
