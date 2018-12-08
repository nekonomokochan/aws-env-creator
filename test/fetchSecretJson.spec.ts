import AWS from "aws-sdk-mock";
import path from "path";
import { fetchSecretJson } from "../src/index";
import { SecretsManager } from "aws-sdk";

describe("fetchSecretJson", () => {
  it("should be able to fetch Secret JSON", async () => {
    AWS.setSDK(path.resolve("node_modules/aws-sdk"));

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

    const client = new SecretsManager();
    const secretJson = await fetchSecretJson(client, "dev/app");

    const expectedJson = {
      SECRET_ID: "dev/app",
      ANOTHER_API_KEY: "another_api_key",
      ANOTHER_API_SECRET: "another_api_secret"
    };

    AWS.restore("SecretsManager", "getSecretValue");

    expect(secretJson).toEqual(expectedJson);
  });
});
