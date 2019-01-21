import { createSecretsManagerClient } from "../../src/factories";
import { fetchSecretJson } from "../../src/fetchSecretJson";
import { AwsRegion } from "../../src/AwsRegion";

describe("fetchSecretJson.integrationTest", () => {
  it("should be able to fetch Secret JSON", async () => {
    const secretsManager = createSecretsManagerClient({
      profile: "nekochans-dev",
      region: AwsRegion.ap_northeast_1
    });

    const secretJson = await fetchSecretJson(secretsManager, "dev/app");

    const expectedJson = {
      API_KEY: "My API Key",
      API_SECRET: "My API Secret"
    };

    expect(secretJson).toEqual(expectedJson);
  });

  it("should be able to fetch Secret JSON even without profile", async () => {
    // In order to make this test successful,
    // the same credentials as nekochans-dev must be set in the default profile of aws
    const secretsManager = createSecretsManagerClient({
      region: AwsRegion.ap_northeast_1
    });

    const secretJson = await fetchSecretJson(secretsManager, "dev/app");

    const expectedJson = {
      API_KEY: "My API Key",
      API_SECRET: "My API Secret"
    };

    expect(secretJson).toEqual(expectedJson);
  });
});
