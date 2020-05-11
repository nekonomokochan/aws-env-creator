import { AwsRegion } from "../../src/AwsRegion";
import { createEnvFile, EnvFileType } from "../../src/createEnvfile";
import fs from "fs";
import readline from "readline";

describe("createEnvFile.integrationTest", () => {
  it("should be able to create env file from ParameterStore", async () => {
    const params = {
      type: EnvFileType.dotenv,
      outputDir: "./",
      region: AwsRegion.ap_northeast_1,
      parameterPath: "/dev/test-app/weather",
      profile: "nekochans-dev",
      outputWhitelist: ["sendgrid-api-key"],
      outputFilename: ".env.parameterStore",
      keyMapping: {
        "sendgrid-api-key": "SENDGRID_API_KEY",
      },
    };

    await createEnvFile(params);

    const stream = fs.createReadStream("./.env.parameterStore");
    const reader = readline.createInterface({ input: stream });

    const expected = ["SENDGRID_API_KEY=DummySendGridAPIKEY0001"];

    reader.on("line", (data: string) => {
      expect(expected.includes(data)).toBeTruthy();
    });
  });

  it("should be able to create env file from ParameterStore and SecretsManager", async () => {
    const params = {
      type: EnvFileType.dotenv,
      outputDir: "./",
      region: AwsRegion.ap_northeast_1,
      secretIds: ["dev/app", "dev/db"],
      parameterPath: "/dev/test-app/weather",
      profile: "nekochans-dev",
      outputFilename: ".env.parameterStoreAndSecretsManager",
      keyMapping: {
        "sendgrid-api-key": "SENDGRID_API_KEY",
        "slack-token": "SLACK_TOKEN",
      },
    };

    await createEnvFile(params);

    const stream = fs.createReadStream(
      "./.env.parameterStoreAndSecretsManager"
    );
    const reader = readline.createInterface({ input: stream });

    const expected = [
      "API_KEY=My API Key",
      "API_SECRET=My API Secret",
      "DB_USER=admin",
      "DB_PASSWORD=AdminPassword",
      "SENDGRID_API_KEY=DummySendGridAPIKEY0001",
      "SLACK_TOKEN=DummySlackToken0001",
    ];

    reader.on("line", (data: string) => {
      expect(expected.includes(data)).toBeTruthy();
    });
  });

  it("should give an authentication error, because the profile name is wrong", async () => {
    try {
      const params = {
        type: EnvFileType.dotenv,
        outputDir: "./",
        region: AwsRegion.ap_northeast_1,
        parameterPath: "/dev/test-app/weather",
        profile: "unknown",
        outputWhitelist: ["sendgrid-api-key"],
        outputFilename: ".env.parameterStore",
        keyMapping: {
          "sendgrid-api-key": "SENDGRID_API_KEY",
        },
      };

      const result = await createEnvFile(params);
      fail(result);
    } catch (error) {
      expect(error.message).toStrictEqual("CredentialsError");
      expect(error.name).toStrictEqual("AwsEnvCreatorError");
    }
  });
});
