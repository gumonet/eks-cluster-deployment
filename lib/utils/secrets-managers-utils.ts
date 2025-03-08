import { SecretsManager } from "@aws-sdk/client-secrets-manager";

/**
 * Gets secret value from AWS Secret Manager. Requires access rights to the secret, specified by the secretName parameter.
 * @param secretName name of the secret to retrieve
 * @param region
 * @returns
 */
export const getSecretValue = async (
  secretName: string,
  region: string
): Promise<string> => {
  const secretManager = new SecretsManager({ region: region });
  let secretsString = "";
  try {
    let response = await secretManager.getSecretValue({ SecretId: secretName });
    if (response) {
      if (response.SecretString) {
        secretsString = response.SecretString;
      } else if (response.SecretBinary) {
        throw new Error(
          `Invalid secret format for ${secretName}. Expected string value, received binary.`
        );
      }
    }
    console.log("Secret Value: ", secretsString);
    return secretsString;
  } catch (error) {
    console.log(`error getting secret ${secretName}: ` + error);
    throw error;
  }
};
