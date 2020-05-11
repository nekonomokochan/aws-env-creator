import {
  createParameterStoreClient,
  createSecretsManagerClient,
} from "./factories";
import { fetchSecretJson } from "./fetchSecretJson";
import fs from "fs";
import { promisify } from "util";
import InvalidFileTypeError from "./error/InvalidFileTypeError";
import { AwsRegion } from "./AwsRegion";
import InvalidParamsError from "./error/InvalidParamsError";
import { fetchFromParameterStore } from "./fetchFromParameterStore";

export enum EnvFileType {
  dotenv = ".env",
  direnv = ".envrc",
  terraform = "terraform.tfvars",
}

export interface ICreateEnvFileParams {
  type: EnvFileType | string;
  outputDir: string;
  region: AwsRegion;
  secretIds?: string[];
  parameterPath?: string;
  profile?: string;
  outputWhitelist?: string[];
  keyMapping?: { [name: string]: string };
  addParams?: { [name: string]: string | number };
  outputFilename?: string;
}

export const createEnvFile = async (
  params: ICreateEnvFileParams
): Promise<void> => {
  if (!isAllowedFileType(params.type)) {
    return Promise.reject(new InvalidFileTypeError());
  }

  const outputFile = outputFilenameIncludedPath(params);
  const exists = await targetFileExists(outputFile);
  if (exists) {
    await removeFile(outputFile);
  }

  const awsDataStoreParamsList = await fetchFromAwsDataStore(params);

  const outputParams =
    params.addParams === undefined
      ? awsDataStoreParamsList
      : awsDataStoreParamsList.concat([params.addParams]);

  switch (params.type) {
    case EnvFileType.dotenv:
      return await createDotEnv(outputFile, outputParams, params.keyMapping);
    case EnvFileType.direnv:
      return await createEnvrc(outputFile, outputParams, params.keyMapping);
    case EnvFileType.terraform:
      return await createTfvars(outputFile, outputParams, params.keyMapping);
    default:
      return;
  }
};

const isAllowedFileType = (type: string): boolean => {
  switch (type) {
    case EnvFileType.dotenv:
      return true;
    case EnvFileType.direnv:
      return true;
    case EnvFileType.terraform:
      return true;
    default:
      return false;
  }
};

const outputFilenameIncludedPath = ({
  type,
  outputDir,
  outputFilename,
}: ICreateEnvFileParams): string => {
  return outputFilename === undefined
    ? `${outputDir}${type}`
    : `${outputDir}${outputFilename}`;
};

const targetFileExists = async (file: string): Promise<boolean> => {
  const stat = promisify(fs.stat);

  return await stat(file)
    .then(() => {
      return Promise.resolve(true);
    })
    .catch(() => {
      return Promise.resolve(false);
    });
};

const removeFile = async (file: string): Promise<void> => {
  const unlink = promisify(fs.unlink);

  await unlink(file);
};

const fetchFromAwsDataStore = async (
  params: ICreateEnvFileParams
): Promise<{ [name: string]: any }[]> => {
  if (params.secretIds === undefined && params.parameterPath === undefined) {
    return Promise.reject(new InvalidParamsError());
  }

  let secretJsons: { [name: string]: any }[] = [];
  if (params.secretIds !== undefined) {
    const secretsManager = createSecretsManagerClient({
      region: params.region,
      profile: params.profile,
    });
    secretJsons = await Promise.all(
      params.secretIds.map(async (secretId: string) => {
        return await fetchSecretJson(secretsManager, secretId);
      })
    );
  }

  let storeParamsList: { [name: string]: any }[] = [];
  if (params.parameterPath !== undefined) {
    const parameterStore = createParameterStoreClient(params);
    storeParamsList = await fetchFromParameterStore(
      parameterStore,
      params.parameterPath
    );
  }

  const awsDataStoreParamsList = secretJsons.concat(storeParamsList);

  return createParamsListIncludedInWhitelist(
    awsDataStoreParamsList,
    params.outputWhitelist
  );
};

const createParamsListIncludedInWhitelist = (
  awsDataStoreParamsList: { [name: string]: any }[],
  outputWhitelist?: string[]
): { [name: string]: any }[] => {
  if (outputWhitelist === undefined) {
    return awsDataStoreParamsList;
  }

  return awsDataStoreParamsList.map((secretJson: { [name: string]: any }) => {
    let whitelistJson = {};
    for (const key of Object.keys(secretJson)) {
      if (outputWhitelist.includes(key)) {
        whitelistJson = Object.assign(
          { [key]: secretJson[key] },
          whitelistJson
        );
      }
    }
    return whitelistJson;
  });
};

const createDotEnv = async (
  outputFile: string,
  outputParams: { [name: string]: any }[] | any,
  keyMapping?: { [name: string]: string }
): Promise<any> => {
  const appendFile = promisify(fs.appendFile);

  return await Promise.all(
    outputParams.map(async (outputParam: { [name: string]: any }) => {
      for (const [key, value] of Object.entries(outputParam)) {
        const keyName = keyMapping && keyMapping[key] ? keyMapping[key] : key;

        await appendFile(outputFile, `${keyName}=${value}\n`);
      }
    })
  );
};

const createEnvrc = async (
  outputFile: string,
  outputParams: { [name: string]: any }[] | any,
  keyMapping?: { [name: string]: string }
): Promise<any> => {
  const appendFile = promisify(fs.appendFile);

  return await Promise.all<any>(
    outputParams.map(async (outputParam: { [name: string]: any }) => {
      for (const [key, value] of Object.entries(outputParam)) {
        const keyName = keyMapping && keyMapping[key] ? keyMapping[key] : key;

        await appendFile(outputFile, `export ${keyName}=${value}\n`);
      }
    })
  );
};

const createTfvars = async (
  outputFile: string,
  outputParams: { [name: string]: any }[] | any,
  keyMapping?: { [name: string]: string }
): Promise<any> => {
  const appendFile = promisify(fs.appendFile);

  return await Promise.all<any>(
    outputParams.map(async (outputParam: { [name: string]: any }) => {
      for (const [key, value] of Object.entries(outputParam)) {
        const keyName = keyMapping && keyMapping[key] ? keyMapping[key] : key;

        await appendFile(outputFile, `${keyName} = "${value}"\n`);
      }
    })
  );
};
