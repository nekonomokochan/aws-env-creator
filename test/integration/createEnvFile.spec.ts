import { AwsRegion } from "../../src/AwsRegion";
import { createEnvFile, EnvFileType } from "../../src/createEnvfile";
import fs from "fs";
import readline from "readline";
import InvalidFileTypeError from "../../src/error/InvalidFileTypeError";

describe("createEnvFile.integrationTest", () => {
  it("should be able to create a .env", async () => {
    const params = {
      type: EnvFileType.dotenv,
      outputDir: "./",
      secretId: "dev/app",
      profile: "nekochans-dev",
      region: AwsRegion.ap_northeast_1
    };

    await createEnvFile(params);

    const stream = fs.createReadStream("./.env");
    const reader = readline.createInterface({ input: stream });

    const expected = ["API_KEY=My API Key", "API_SECRET=My API Secret"];

    reader.on("line", (data: string) => {
      expect(expected.includes(data)).toBeTruthy();
    });
  });

  it("will be InvalidFileTypeError", async () => {
    const params = {
      type: "unknown",
      outputDir: "./",
      secretId: "dev/app",
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
