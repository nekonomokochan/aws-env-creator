import { SecretsManager, SharedIniFileCredentials } from "aws-sdk";
import { AwsRegion } from "./AwsRegion";

export interface ICreateSecretsManagerClientParams {
  region: AwsRegion;
  profile?: string;
}

export const createSecretsManagerClient = (
  params: ICreateSecretsManagerClientParams
): SecretsManager => {
  if (typeof params.profile === "string") {
    const credentials = new SharedIniFileCredentials({
      profile: params.profile
    });

    return new SecretsManager({ region: params.region, credentials });
  }

  return new SecretsManager({ region: params.region });
};
