import { AwsRegion } from "../../src/AwsRegion";
import { createEnvFile, EnvFileType } from "../../src/createEnvfile";
import fs from "fs";
import readline from "readline";

describe("createTfvars.integrationTest", () => {
  it("should be able to create a terraform.tfvars", async () => {
    const params = {
      type: EnvFileType.terraform,
      outputDir: "./",
      secretIds: ["dev/app"],
      profile: "nekochans-dev",
      region: AwsRegion.ap_northeast_1
    };

    await createEnvFile(params);

    const stream = fs.createReadStream("./terraform.tfvars");
    const reader = readline.createInterface({ input: stream });

    const expected = ['API_KEY = "My API Key"', 'API_SECRET = "My API Secret"'];

    reader.on("line", (data: string) => {
      expect(expected.includes(data)).toBeTruthy();
    });
  });

  it("can create terraform.tfvars with multiple secretId", async () => {
    const params = {
      type: EnvFileType.terraform,
      outputDir: "./",
      secretIds: ["dev/app", "dev/db"],
      profile: "nekochans-dev",
      region: AwsRegion.ap_northeast_1,
      keyMapping: {
        API_KEY: "AWS_API_KEY",
        API_SECRET: "AWS_API_SECRET",
        DB_USER: "ADMIN_DB_USER",
        DB_PASSWORD: "ADMIN_DB_PASSWORD"
      }
    };

    await createEnvFile(params);

    const stream = fs.createReadStream("./terraform.tfvars");
    const reader = readline.createInterface({ input: stream });

    const expected = [
      'AWS_API_KEY = "My API Key"',
      'AWS_API_SECRET = "My API Secret"',
      'ADMIN_DB_USER = "admin"',
      'ADMIN_DB_PASSWORD = "AdminPassword"'
    ];

    reader.on("line", (data: string) => {
      expect(expected.includes(data)).toBeTruthy();
    });
  });

  it("should be able to create a terraform.tfvars with outputWhitelist", async () => {
    const params = {
      type: EnvFileType.terraform,
      outputDir: "./",
      secretIds: ["stg/app"],
      profile: "nekochans-dev",
      region: AwsRegion.ap_northeast_1,
      outputWhitelist: ["BACKEND_URL", "QIITA_REDIRECT_URI"],
      keyMapping: {
        BACKEND_URL: "VUE_APP_API_URL_BASE",
        QIITA_REDIRECT_URI: "VUE_APP_QIITA_REDIRECT_URI"
      },
      addParams: {
        VUE_APP_STAGE: "stg"
      }
    };

    await createEnvFile(params);

    const stream = fs.createReadStream("./terraform.tfvars");
    const reader = readline.createInterface({ input: stream });

    const expected = [
      'VUE_APP_STAGE = "stg"',
      'VUE_APP_API_URL_BASE = "https://stg-api.sample.net"',
      'VUE_APP_QIITA_REDIRECT_URI = "https://stg-www.sample.net/oauth/callback"'
    ];

    reader.on("line", (data: string) => {
      expect(expected.includes(data)).toBeTruthy();
    });
  });
});
