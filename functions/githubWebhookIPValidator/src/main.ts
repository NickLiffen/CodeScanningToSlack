import { APIGatewayProxyEventV2 } from "aws-lambda";
import { ssm } from "./ssm";

import { getGitHubIpRange } from "./getIPs";
import { githubAuth } from "./getGitHubAppJWT";
import { checkIPs } from "./checkIPs";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<SimpleResponse> => {
  console.log("event", event);

  const sourceIP = event.requestContext.http.sourceIp;

  console.log("sourceIP", sourceIP);

  try {
    await ssm();
    const token = (await githubAuth()) as string;
    const ips = (await getGitHubIpRange(token)) as hookIPAddress;
    const isAuthorized = (await checkIPs(ips, sourceIP)) as boolean;
    return {
      isAuthorized,
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
};
