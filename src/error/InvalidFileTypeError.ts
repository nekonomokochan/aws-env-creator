export default class InvalidFileTypeError extends Error {
  constructor() {
    super("It's a file type that is not allowed");
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
