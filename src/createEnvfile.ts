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
  direnv = ".envrc"
}

export interface ICreateEnvFileParams
  extends ICreateSecretsManagerClientParams {
  type: EnvFileType | string;
  outputDir: string;
  secretId: string;
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

  const secretJson = await fetchSecretJson(secretsManager, params.secretId);

  switch (params.type) {
    case EnvFileType.dotenv:
      return await createDotEnv(outputFile, secretJson);
    case EnvFileType.direnv:
      return await createEnvrc(outputFile, secretJson);
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

const createDotEnv = async (
  outputFile: string,
  secretJson: { [name: string]: any }
): Promise<void> => {
  const appendFile = promisify(fs.appendFile);

  for (const [key, value] of Object.entries(secretJson)) {
    await appendFile(outputFile, `${key}=${value}\n`);
  }
};

const createEnvrc = async (
  outputFile: string,
  secretJson: { [name: string]: any }
): Promise<void> => {
  const appendFile = promisify(fs.appendFile);

  for (const [key, value] of Object.entries(secretJson)) {
    await appendFile(outputFile, `export ${key}=${value}\n`);
  }
};
