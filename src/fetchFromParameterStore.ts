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
          new AwsEnvCreatorError("ParameterStore is undefined")
        );
      }

      if (data.Parameters.length === 0) {
        return Promise.reject(
          new AwsEnvCreatorError(
            "Parameter is not registered in ParameterStore"
          )
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
      const errorCode = error.code === undefined ? error.message : error.code;
      return Promise.reject(new AwsEnvCreatorError(errorCode, error.stack));
    });
};
