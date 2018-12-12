import { AwsRegion } from "../../src/AwsRegion";
import { createEnvFile, EnvFileType } from "../../src/createEnvfile";
import fs from "fs";
import readline from "readline";

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
});
