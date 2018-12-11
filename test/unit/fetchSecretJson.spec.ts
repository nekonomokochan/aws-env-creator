import AWS from "aws-sdk-mock";
import path from "path";
import { fetchSecretJson } from "../../src";
import { SecretsManager } from "aws-sdk";
import MockError from "../lib/MockError";

describe("fetchSecretJson.unitTest", () => {
  beforeEach(() => {
    AWS.setSDK(path.resolve("node_modules/aws-sdk"));
  });

  afterEach(() => {
    AWS.restore("SecretsManager", "getSecretValue");
  });

  it("should be able to fetch Secret JSON", async () => {
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

    expect(secretJson).toEqual(expectedJson);
  });

  it("will be DecryptionFailureException", async () => {
    const error = new MockError(
      "Secrets Manager can't decrypt the protected secret text using the provided KMS key.",
      "DecryptionFailureException"
    );

    const mockResponse = (params: any, callback: any) => {
      callback(error, params);
    };

    AWS.mock("SecretsManager", "getSecretValue", mockResponse);

    const client = new SecretsManager();
    await fetchSecretJson(client, "dev/app")
      .then((secretJson: { [name: string]: any }) => {
        fail(secretJson);
      })
      .catch((error: MockError) => {
        expect(error.message).toBe("DecryptionFailureException");
      });
  });

  it("will be InternalServiceErrorException", async () => {
    const error = new MockError(
      "An error occurred on the server side.",
      "InternalServiceErrorException"
    );

    const mockResponse = (params: any, callback: any) => {
      callback(error, params);
    };

    AWS.mock("SecretsManager", "getSecretValue", mockResponse);

    const client = new SecretsManager();
    await fetchSecretJson(client, "dev/app")
      .then((secretJson: { [name: string]: any }) => {
        fail(secretJson);
      })
      .catch((error: MockError) => {
        expect(error.message).toBe("InternalServiceErrorException");
      });
  });

  it("will be InvalidParameterException", async () => {
    const error = new MockError(
      "You provided an invalid value for a parameter.",
      "InvalidParameterException"
    );

    const mockResponse = (params: any, callback: any) => {
      callback(error, params);
    };

    AWS.mock("SecretsManager", "getSecretValue", mockResponse);

    const client = new SecretsManager();
    await fetchSecretJson(client, "dev/app")
      .then((secretJson: { [name: string]: any }) => {
        fail(secretJson);
      })
      .catch((error: MockError) => {
        expect(error.message).toBe("InvalidParameterException");
      });
  });

  it("will be InvalidRequestException", async () => {
    const error = new MockError(
      "You provided a parameter value that is not valid for the current state of the resource.",
      "InvalidRequestException"
    );

    const mockResponse = (params: any, callback: any) => {
      callback(error, params);
    };

    AWS.mock("SecretsManager", "getSecretValue", mockResponse);

    const client = new SecretsManager();
    await fetchSecretJson(client, "dev/app")
      .then((secretJson: { [name: string]: any }) => {
        fail(secretJson);
      })
      .catch((error: MockError) => {
        expect(error.message).toBe("InvalidRequestException");
      });
  });

  it("will be ResourceNotFoundException", async () => {
    const error = new MockError(
      "We can't find the resource that you asked for.",
      "ResourceNotFoundException"
    );

    const mockResponse = (params: any, callback: any) => {
      callback(error, params);
    };

    AWS.mock("SecretsManager", "getSecretValue", mockResponse);

    const client = new SecretsManager();
    await fetchSecretJson(client, "dev/app")
      .then((secretJson: { [name: string]: any }) => {
        fail(secretJson);
      })
      .catch((error: MockError) => {
        expect(error.message).toBe("ResourceNotFoundException");
      });
  });
});
