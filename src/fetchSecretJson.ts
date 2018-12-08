import { AWSError, SecretsManager } from "aws-sdk";

export const fetchSecretJson = async (
  secretsManager: SecretsManager,
  secretId: string
): Promise<{ [name: string]: any }> => {
  return secretsManager
    .getSecretValue({ SecretId: secretId })
    .promise()
    .then((data: SecretsManager.Types.GetSecretValueResponse) => {
      if (typeof data.SecretString === "string") {
        const resultJson = JSON.parse(data.SecretString);

        return Promise.resolve(resultJson);
      }

      return { key: "value" };
    })
    .catch((error: AWSError) => {
      return Promise.reject(error);
    });
};
