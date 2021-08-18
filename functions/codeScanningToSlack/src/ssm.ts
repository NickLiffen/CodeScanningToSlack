import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";

export const ssm = async (): Promise<void> => {
  const region = process.env.REGION ? process.env.REGION : "us-east-1";
  const client = new SSMClient({ region });
  const command = new GetParametersByPathCommand({
    Path: "/codescanning",
    WithDecryption: true,
  });

  try {
    const { Parameters } = await client.send(command);

    if (Parameters) {
      Parameters.forEach((param) => {
        const name = param.Name
          ? param.Name.replace("/codescanning/", "")
          : "";
        const value = param.Value ? param.Value : "";
        process.env[name] = value;
      });
    }
  } catch (e) {
    console.error(e);
  }
};
