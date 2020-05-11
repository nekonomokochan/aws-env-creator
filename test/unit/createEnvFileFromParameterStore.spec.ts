import { AwsRegion } from "../../src/AwsRegion";
import { createEnvFile, EnvFileType } from "../../src/createEnvfile";
import fs from "fs";
import readline from "readline";
import AWS from "aws-sdk-mock";
import path from "path";

describe("createEnvFile.unitTest", () => {
  beforeEach(() => {
    AWS.setSDK(path.resolve("node_modules/aws-sdk"));
  });

  afterEach(() => {
    AWS.restore("SSM", "getParametersByPath");
    AWS.restore("SecretsManager", "getSecretValue");
  });

  it("should be able to create env file from ParameterStore", async () => {
    const mockResponse = (
      params: { Path: string; WithDecryption: true },
      callback: any
    ) => {
      callback(null, {
        Parameters: [
          {
            Name: `${params.Path}/SLACK_TOKEN`,
            Type: "SecureString",
            Value: "DummySlackToken0001",
            Version: 1,
            LastModifiedDate: "2019-03-18T14:23:17.774Z",
            ARN:
              "arn:aws:ssm:ap-northeast-1:000000000000:parameter/dev/test-app/weather/SLACK_TOKEN",
          },
        ],
      });
    };
    AWS.mock("SSM", "getParametersByPath", mockResponse);

    const params = {
      type: EnvFileType.dotenv,
      outputDir: "./",
      region: AwsRegion.ap_northeast_1,
      parameterPath: "/dev/test-app/weather",
      profile: "nekochans-dev",
      outputFilename: ".env.parameterStoreMock",
    };

    await createEnvFile(params);

    const stream = fs.createReadStream("./.env.parameterStoreMock");
    const reader = readline.createInterface({ input: stream });

    const expected = ["SLACK_TOKEN=DummySlackToken0001"];

    reader.on("line", (data: string) => {
      expect(expected.includes(data)).toBeTruthy();
    });
  });

  it("should be able to create env file from ParameterStore and SecretsManager", async () => {
    const mockResponse = (
      params: { Path: string; WithDecryption: true },
      callback: any
    ) => {
      callback(null, {
        Parameters: [
          {
            Name: `${params.Path}/GITHUB_TOKEN`,
            Type: "SecureString",
            Value: "DummyGitHubToken0001",
            Version: 1,
            LastModifiedDate: "2019-03-18T14:23:17.774Z",
            ARN:
              "arn:aws:ssm:ap-northeast-1:000000000000:parameter/dev/test-app/weather/GITHUB_TOKEN",
          },
        ],
      });
    };
    AWS.mock("SSM", "getParametersByPath", mockResponse);

    const getSecretValueMockResponse = (
      params: { SecretId: string },
      callback: any
    ) => {
      callback(null, {
        SecretString: JSON.stringify({
          SECRET_ID: params.SecretId,
          API_KEY: "api_key",
          API_SECRET: "api_secret",
        }),
      });
    };
    AWS.mock("SecretsManager", "getSecretValue", getSecretValueMockResponse);

    const params = {
      type: EnvFileType.dotenv,
      outputDir: "./",
      region: AwsRegion.ap_northeast_1,
      secretIds: ["dev/app"],
      parameterPath: "/dev/test-app/weather",
      profile: "nekochans-dev",
      outputFilename: ".env.parameterStoreSecretsManagerMock",
    };

    await createEnvFile(params);

    const stream = fs.createReadStream(
      "./.env.parameterStoreSecretsManagerMock"
    );
    const reader = readline.createInterface({ input: stream });

    const expected = [
      "SECRET_ID=dev/app",
      "API_KEY=api_key",
      "API_SECRET=api_secret",
      "GITHUB_TOKEN=DummyGitHubToken0001",
    ];

    reader.on("line", (data: string) => {
      expect(expected.includes(data)).toBeTruthy();
    });
  });
});
