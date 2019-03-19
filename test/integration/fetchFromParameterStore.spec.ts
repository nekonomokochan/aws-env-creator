import { createParameterStoreClient } from "../../src/factories";
import { fetchFromParameterStore } from "../../src/fetchFromParameterStore";
import { AwsRegion } from "../../src/AwsRegion";

describe("fetchFromParameterStore.integrationTest", () => {
  it("should be able to fetch Params", async () => {
    const parameterStore = createParameterStoreClient({
      profile: "nekochans-dev",
      region: AwsRegion.ap_northeast_1
    });

    const storeParamsList = await fetchFromParameterStore(
      parameterStore,
      "/dev/test-app/news"
    );

    const expectedList = [
      {
        "sendgrid-api-key": "DummySendGridAPIKEY0001"
      },
      {
        "slack-token": "DummySlackToken0001"
      }
    ];

    expect(storeParamsList).toEqual(expectedList);
  });

  it("should be able to fetch Params even without profile", async () => {
    // In order to make this test successful,
    // the same credentials as nekochans-dev must be set in the default profile of aws
    const parameterStore = createParameterStoreClient({
      region: AwsRegion.ap_northeast_1
    });

    const storeParamsList = await fetchFromParameterStore(
      parameterStore,
      "/dev/test-app/weather"
    );

    const expectedList = [
      {
        "sendgrid-api-key": "DummySendGridAPIKEY0001"
      },
      {
        "slack-token": "DummySlackToken0001"
      }
    ];

    expect(storeParamsList).toEqual(expectedList);
  });
});
