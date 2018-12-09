export default class MockError extends Error {
  private readonly _code: any;

  constructor(message: string, code: any) {
    super(message);
    this.name = this.constructor.name;
    this._code = code;

    Error.captureStackTrace(this, this.constructor);
  }

  get code() {
    return this._code;
  }
}
