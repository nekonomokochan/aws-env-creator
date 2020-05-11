import { SecretsManager, SharedIniFileCredentials, SSM } from "aws-sdk";
import { AwsRegion } from "./AwsRegion";

export interface ICreateSecretsManagerClientParams {
  region: AwsRegion;
  profile?: string;
}

export interface ICreateParameterStoreClientParams {
  region: AwsRegion;
  profile?: string;
}

export const createSecretsManagerClient = (
  params: ICreateSecretsManagerClientParams
): SecretsManager => {
  if (typeof params.profile === "string") {
    const credentials = new SharedIniFileCredentials({
      profile: params.profile,
    });

    return new SecretsManager({ region: params.region, credentials });
  }

  return new SecretsManager({ region: params.region });
};

export const createParameterStoreClient = (
  params: ICreateParameterStoreClientParams
): SSM => {
  if (typeof params.profile === "string") {
    const credentials = new SharedIniFileCredentials({
      profile: params.profile,
    });

    return new SSM({ region: params.region, credentials });
  }

  return new SSM({ region: params.region });
};
