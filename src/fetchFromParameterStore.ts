import { SSM } from "aws-sdk";
import AwsEnvCreatorError from "./error/AwsEnvCreatorError";
import { GetParametersByPathResult } from "aws-sdk/clients/ssm";

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

    if (firstPageData.NextToken === undefined) {
      const storeParamsList = firstPageData.Parameters.map(value => {
        return {
          [String(value.Name).replace(`${parameterPath}/`, "")]: value.Value
        };
      });

      return Promise.resolve(storeParamsList);
    }

    let mergedPageData: GetParametersByPathResult[] = [firstPageData];
    let nextPageData = await fetchFromWithNextToken(
      parameterStore,
      parameterPath,
      firstPageData.NextToken
    );
    mergedPageData.push(nextPageData);
    while (nextPageData.NextToken) {
      let tmpPageData = await fetchFromWithNextToken(
        parameterStore,
        parameterPath,
        nextPageData.NextToken
      );
      mergedPageData.push(tmpPageData);
      nextPageData = tmpPageData;
    }

    const storeParamsList: { [name: string]: any }[] = [];
    mergedPageData.forEach((parametersResult: GetParametersByPathResult) => {
      const parameters =
        parametersResult.Parameters !== undefined
          ? parametersResult.Parameters
          : [];
      parameters.forEach(value => {
        storeParamsList.push({
          [String(value.Name).replace(`${parameterPath}/`, "")]: value.Value
        });
      });
    });

    return Promise.resolve(storeParamsList);
  } catch (error) {
    const errorCode = error.code === undefined ? error.message : error.code;
    return Promise.reject(new AwsEnvCreatorError(errorCode, error.stack));
  }
};

const fetchFromWithNextToken = async (
  parameterStore: SSM,
  parameterPath: string,
  nextToken: string
): Promise<GetParametersByPathResult> => {
  try {
    const fetchData = await parameterStore
      .getParametersByPath({
        Path: parameterPath,
        WithDecryption: true,
        NextToken: nextToken
      })
      .promise();

    if (fetchData.Parameters === undefined) {
      return Promise.reject(
        new AwsEnvCreatorError("ParameterStore is undefined")
      );
    }

    if (fetchData.Parameters.length === 0) {
      return Promise.reject(
        new AwsEnvCreatorError("Parameter is not registered in ParameterStore")
      );
    }

    return Promise.resolve(fetchData);
  } catch (error) {
    const errorCode = error.code === undefined ? error.message : error.code;
    return Promise.reject(new AwsEnvCreatorError(errorCode, error.stack));
  }
};
