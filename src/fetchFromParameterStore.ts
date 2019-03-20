import { SSM } from "aws-sdk";
import AwsEnvCreatorError from "./error/AwsEnvCreatorError";

export const fetchFromParameterStore = async (
  parameterStore: SSM,
  parameterPath: string
): Promise<{ [name: string]: any }[]> => {
  try {
    const firstPageData = await parameterStore
      .getParametersByPath({ Path: parameterPath, WithDecryption: true })
      .promise();

    if (firstPageData.Parameters === undefined) {
      return Promise.reject(
        new AwsEnvCreatorError("ParameterStore is undefined")
      );
    }

    if (firstPageData.Parameters.length === 0) {
      return Promise.reject(
        new AwsEnvCreatorError("Parameter is not registered in ParameterStore")
      );
    }

    const storeParamsList = firstPageData.Parameters.map(value => {
      return {
        [String(value.Name).replace(`${parameterPath}/`, "")]: value.Value
      };
    });

    return Promise.resolve(storeParamsList);
  } catch (error) {
    const errorCode = error.code === undefined ? error.message : error.code;
    return Promise.reject(new AwsEnvCreatorError(errorCode, error.stack));
  }
};
