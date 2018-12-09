export default class AwsEnvCreatorError extends Error {
  constructor(message: string, stack?: string) {
    super(message);
    this.name = this.constructor.name;
    this.stack = stack;

    Error.captureStackTrace(this, this.constructor);
  }
}
