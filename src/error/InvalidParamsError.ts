export default class InvalidParamsError extends Error {
  constructor() {
    super("secretIds or parameterPath is required");
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
