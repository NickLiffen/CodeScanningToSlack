import { APIGatewayProxyEventV2 } from "aws-lambda";
import { ssm } from "./ssm";

import { getGitHubIpRange } from "./getIPs";
import { githubAuth } from "./getGitHubAppJWT";
import { checkIPs } from "./checkIPs";

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<SimpleResponse> => {
  console.log("Event:", event);
  console.log("Event Body: ", event.body);

  const sourceIP = event.requestContext.http.sourceIp;

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
    return {
      isAuthorized: false,
    };
  }
};
