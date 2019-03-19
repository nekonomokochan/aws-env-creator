import AWS from "aws-sdk-mock";
import path from "path";
import { fetchFromParameterStore } from "../../src/fetchFromParameterStore";
import { SSM } from "aws-sdk";
import AwsEnvCreatorError from "../../src/error/AwsEnvCreatorError";

describe("fetchFromParameterStore.unitTest", () => {
  beforeEach(() => {
    AWS.setSDK(path.resolve("node_modules/aws-sdk"));
  });

  afterEach(() => {
    AWS.restore("SSM", "getParametersByPath");
  });

  it("should be able to fetch Params", async () => {
    const mockResponse = (
      params: { Path: string; WithDecryption: true },
      callback: any
    ) => {
      callback(null, {
        Parameters: [
          {
            Name: `${params.Path}/API_TOKEN`,
            Type: "SecureString",
            Value: "DummyAPIToken0001",
            Version: 1,
            LastModifiedDate: "2019-03-18T14:23:17.774Z",
            ARN:
              "arn:aws:ssm:ap-northeast-1:000000000000:parameter/dev/test-app/weather/API_TOKEN"
          },
          {
            Name: `${params.Path}/API_SECRET`,
            Type: "SecureString",
            Value: "DummyAPISecret0001",
            Version: 1,
            LastModifiedDate: "2019-03-18T14:23:17.774Z",
            ARN:
              "arn:aws:ssm:ap-northeast-1:000000000000:parameter/dev/test-app/weather/API_SECRET"
          }
        ]
      });
    };

    AWS.mock("SSM", "getParametersByPath", mockResponse);

    const client = new SSM();
    const storeParamsList = await fetchFromParameterStore(
      client,
      "/dev/test-app/dummy"
    );

    const expectedList = [
      {
        API_TOKEN: "DummyAPIToken0001"
      },
      {
        API_SECRET: "DummyAPISecret0001"
      }
    ];

    expect(storeParamsList).toEqual(expectedList);
  });

  it("should be AwsEnvCreatorError. Message is ParameterStore is undefined", async () => {
    const mockResponse = (
      // @ts-ignore
      params: { Path: string; WithDecryption: true },
      callback: any
    ) => {
      callback(null, {});
    };

    AWS.mock("SSM", "getParametersByPath", mockResponse);

    const client = new SSM();
    await fetchFromParameterStore(client, "/dev/test-app/dummy")
      .then(storeParamsList => {
        fail(storeParamsList);
      })
      .catch((error: AwsEnvCreatorError) => {
        expect(error.message).toStrictEqual("ParameterStore is undefined");
      });
  });

  it("should be AwsEnvCreatorError. Message is Parameter is not registered in ParameterStore", async () => {
    const mockResponse = (
      // @ts-ignore
      params: { Path: string; WithDecryption: true },
      callback: any
    ) => {
      callback(null, {
        Parameters: []
      });
    };

    AWS.mock("SSM", "getParametersByPath", mockResponse);

    const client = new SSM();
    await fetchFromParameterStore(client, "/dev/test-app/dummy")
      .then(storeParamsList => {
        fail(storeParamsList);
      })
      .catch((error: AwsEnvCreatorError) => {
        expect(error.message).toStrictEqual(
          "Parameter is not registered in ParameterStore"
        );
      });
  });
});
