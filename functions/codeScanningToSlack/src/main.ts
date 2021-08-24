import { ssm } from "./ssm";
// import { IncomingWebhook } from '@slack/webhook'
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { sign, verify } from "@octokit/webhooks-methods";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    await ssm();

    console.log(event);

    const { body, headers } = event;

    console.log(headers);

    const eventPayloadString = body ? body : "";

    console.log(eventPayloadString);

    const secret = process.env.GITHUB_WEBHOOKS_SECRET;
    console.log(secret);
    const algorithm = "sha256";

    const signature = await sign({ secret, algorithm }, eventPayloadString);
    console.log(signature);
    const authedAnswer = await verify(secret, eventPayloadString, signature);
    console.log(authedAnswer);
    const { action } = JSON.parse(eventPayloadString);

    console.log(action);

    return "hello";
  } catch (e) {
    console.error(e);
    throw e;
  }
};
