import {
  createSecretsManagerClient,
  ICreateSecretsManagerClientParams
} from "./factories";
import { fetchSecretJson } from "./fetchSecretJson";
import fs from "fs";
import { promisify } from "util";

export enum EnvFileType {
  dotenv = ".env"
}

export interface ICreateEnvFileParams
  extends ICreateSecretsManagerClientParams {
  type: string;
  outputDir: string;
  secretId: string;
}

export const createEnvFile = async (
  params: ICreateEnvFileParams
): Promise<void> => {
  const secretsManager = createSecretsManagerClient({
    region: params.region,
    profile: params.profile
  });

  const outputFile = `${params.outputDir}${params.type}`;

  const exists = await targetFileExists(outputFile);
  if (exists) {
    await removeFile(outputFile);
  }

  const appendFile = promisify(fs.appendFile);

  const secretJson = await fetchSecretJson(secretsManager, params.secretId);

  for (const [key, value] of Object.entries(secretJson)) {
    await appendFile(outputFile, `${key}=${value}\n`);
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
