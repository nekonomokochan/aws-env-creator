import { SecretsManager, SharedIniFileCredentials } from "aws-sdk";
import { AwsRegion } from "./AwsRegion";

interface ICreateSecretsManagerClientParams {
  region: AwsRegion;
  profile: string;
}

export const createSecretsManagerClient = (
  params: ICreateSecretsManagerClientParams
): SecretsManager => {
  const credentials = new SharedIniFileCredentials({ profile: params.profile });

  return new SecretsManager({ region: params.region, credentials });
};
