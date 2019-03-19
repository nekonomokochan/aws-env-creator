import { AWSError, SSM } from "aws-sdk";
import AwsEnvCreatorError from "./error/AwsEnvCreatorError";
import { GetParametersByPathResult } from "aws-sdk/clients/ssm";

export const fetchFromParameterStore = (
  parameterStore: SSM,
  parameterPath: string
): Promise<{ [name: string]: any }[]> => {
  return parameterStore
    .getParametersByPath({ Path: parameterPath, WithDecryption: true })
    .promise()
    .then((data: GetParametersByPathResult) => {
      if (data.Parameters === undefined) {
        return Promise.reject(
          new AwsEnvCreatorError("parameterStore Not Found")
        );
      }

      const storeParamsList = data.Parameters.map(value => {
        return {
          [String(value.Name).replace(`${parameterPath}/`, "")]: value.Value
        };
      });

      return Promise.resolve(storeParamsList);
    })
    .catch((error: AWSError) => {
      return Promise.reject(new AwsEnvCreatorError(error.code, error.stack));
    });
};
