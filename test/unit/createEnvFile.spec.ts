import { AwsRegion } from "../../src/AwsRegion";
import { createEnvFile, EnvFileType } from "../../src/createEnvfile";
import fs from "fs";
import readline from "readline";
import InvalidFileTypeError from "../../src/error/InvalidFileTypeError";
import AWS from "aws-sdk-mock";
import path from "path";

describe("createEnvFile.unitTest", () => {
  beforeEach(() => {
    AWS.setSDK(path.resolve("node_modules/aws-sdk"));
  });

  afterEach(() => {
    AWS.restore("SecretsManager", "getSecretValue");
  });

  it("should be able to create a .env", async () => {
    const mockResponse = (params: { SecretId: string }, callback: any) => {
      callback(null, {
        SecretString: JSON.stringify({
          SECRET_ID: params.SecretId,
          ANOTHER_API_KEY: "another_api_key",
          ANOTHER_API_SECRET: "another_api_secret"
        })
      });
    };

    AWS.mock("SecretsManager", "getSecretValue", mockResponse);

    const params = {
      type: EnvFileType.dotenv,
      outputDir: "./",
      secretIds: ["dev/app"],
      profile: "nekochans-dev",
      region: AwsRegion.ap_northeast_1,
      addParams: { APP_URL: "http://localhost/3000" }
    };

    await createEnvFile(params);

    const stream = fs.createReadStream("./.env");
    const reader = readline.createInterface({ input: stream });

    const expected = [
      "SECRET_ID=dev/app",
      "ANOTHER_API_KEY=another_api_key",
      "ANOTHER_API_SECRET=another_api_secret",
      "APP_URL=http://localhost/3000"
    ];

    reader.on("line", (data: string) => {
      expect(expected.includes(data)).toBeTruthy();
    });
  });

  it("should be able to create a .envrc", async () => {
    const mockResponse = (params: { SecretId: string }, callback: any) => {
      callback(null, {
        SecretString: JSON.stringify({
          SECRET_ID: params.SecretId,
          ANOTHER_API_KEY: "another_api_key",
          ANOTHER_API_SECRET: "another_api_secret"
        })
      });
    };

    AWS.mock("SecretsManager", "getSecretValue", mockResponse);

    const params = {
      type: EnvFileType.direnv,
      outputDir: "./",
      secretIds: ["dev/app"],
      profile: "nekochans-dev",
      region: AwsRegion.ap_northeast_1,
      addParams: { APP_URL: "http://localhost/3000" }
    };

    await createEnvFile(params);

    const stream = fs.createReadStream("./.envrc");
    const reader = readline.createInterface({ input: stream });

    const expected = [
      "export SECRET_ID=dev/app",
      "export ANOTHER_API_KEY=another_api_key",
      "export ANOTHER_API_SECRET=another_api_secret",
      "export APP_URL=http://localhost/3000"
    ];

    reader.on("line", (data: string) => {
      expect(expected.includes(data)).toBeTruthy();
    });
  });

  it("should be able to output .env with any key name", async () => {
    const mockResponse = (params: { SecretId: string }, callback: any) => {
      callback(null, {
        SecretString: JSON.stringify({
          SECRET_ID: params.SecretId,
          ANOTHER_API_KEY: "another_api_key",
          ANOTHER_API_SECRET: "another_api_secret"
        })
      });
    };

    AWS.mock("SecretsManager", "getSecretValue", mockResponse);

    const params = {
      type: EnvFileType.dotenv,
      outputDir: "./",
      secretIds: ["dev/app"],
      profile: "nekochans-dev",
      region: AwsRegion.ap_northeast_1,
      keyMapping: {
        SECRET_ID: "SECRET_CODE",
        ANOTHER_API_KEY: "AWS_API_KEY",
        ANOTHER_API_SECRET: "AWS_API_SECRET"
      }
    };

    await createEnvFile(params);

    const stream = fs.createReadStream("./.env");
    const reader = readline.createInterface({ input: stream });

    const expected = [
      "SECRET_CODE=dev/app",
      "AWS_API_KEY=another_api_key",
      "AWS_API_SECRET=another_api_secret"
    ];

    reader.on("line", (data: string) => {
      expect(expected.includes(data)).toBeTruthy();
    });
  });

  it("should be able to output .envrc with any key name", async () => {
    const mockResponse = (params: { SecretId: string }, callback: any) => {
      callback(null, {
        SecretString: JSON.stringify({
          SECRET_ID: params.SecretId,
          ANOTHER_API_KEY: "another_api_key",
          ANOTHER_API_SECRET: "another_api_secret"
        })
      });
    };

    AWS.mock("SecretsManager", "getSecretValue", mockResponse);

    const params = {
      type: EnvFileType.direnv,
      outputDir: "./",
      secretIds: ["dev/app"],
      profile: "nekochans-dev",
      region: AwsRegion.ap_northeast_1,
      keyMapping: {
        SECRET_ID: "SECRET_CODE",
        ANOTHER_API_KEY: "AWS_API_KEY",
        ANOTHER_API_SECRET: "AWS_API_SECRET"
      }
    };

    await createEnvFile(params);

    const stream = fs.createReadStream("./.envrc");
    const reader = readline.createInterface({ input: stream });

    const expected = [
      "export SECRET_CODE=dev/app",
      "export AWS_API_KEY=another_api_key",
      "export AWS_API_SECRET=another_api_secret"
    ];

    reader.on("line", (data: string) => {
      expect(expected.includes(data)).toBeTruthy();
    });
  });

  it("will be InvalidFileTypeError", async () => {
    const params = {
      type: "unknown",
      outputDir: "./",
      secretIds: ["dev/app"],
      profile: "nekochans-dev",
      region: AwsRegion.ap_northeast_1
    };

    await createEnvFile(params)
      .then(() => {
        fail();
      })
      .catch((error: InvalidFileTypeError) => {
        expect(error.message).toBe("It's a file type that is not allowed");
        expect(error.name).toBe("InvalidFileTypeError");
      });
  });
});
