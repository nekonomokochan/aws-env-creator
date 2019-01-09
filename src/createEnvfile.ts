import {
  createSecretsManagerClient,
  ICreateSecretsManagerClientParams
} from "./factories";
import { fetchSecretJson } from "./fetchSecretJson";
import fs from "fs";
import { promisify } from "util";
import InvalidFileTypeError from "./error/InvalidFileTypeError";

export enum EnvFileType {
  dotenv = ".env",
  direnv = ".envrc",
  terraform = "terraform.tfvars"
}

export interface ICreateEnvFileParams
  extends ICreateSecretsManagerClientParams {
  type: EnvFileType | string;
  outputDir: string;
  secretIds: string[];
  outputWhitelist?: string[];
  keyMapping?: { [name: string]: string };
  addParams?: { [name: string]: string | number };
}

export const createEnvFile = async (
  params: ICreateEnvFileParams
): Promise<void> => {
  if (!isAllowedFileType(params.type)) {
    return Promise.reject(new InvalidFileTypeError());
  }

  const secretsManager = createSecretsManagerClient({
    region: params.region,
    profile: params.profile
  });

  const outputFile = `${params.outputDir}${params.type}`;

  const exists = await targetFileExists(outputFile);
  if (exists) {
    await removeFile(outputFile);
  }

  const secretJsons = await Promise.all(
    params.secretIds.map(async (secretId: string) => {
      return await fetchSecretJson(secretsManager, secretId);
    })
  );

  const outputSecret = createSecretJsonsIncludedInWhitelist(
    secretJsons,
    params.outputWhitelist
  );

  const outputParams =
    params.addParams === undefined
      ? outputSecret
      : outputSecret.concat([params.addParams]);

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

const createSecretJsonsIncludedInWhitelist = (
  secretJsons: { [name: string]: any }[],
  outputWhitelist?: string[]
): { [name: string]: any }[] => {
  if (outputWhitelist === undefined) {
    return secretJsons;
  }

  return secretJsons.map((secretJson: { [name: string]: any }) => {
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
