import { ssm } from "./ssm";
import { IncomingWebhook } from "@slack/webhook";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { secretVerifier } from "./verify";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    await ssm();

    const response = secretVerifier(event);

    if (!response)
      return {
        statusCode: 401,
        body: "webhook secret provided does not match",
      };

    const body = event.body || "";

    const { action, alert, repository, sender, organization, ref, commit_oid } =
      JSON.parse(body);

    console.log(action);
    console.log(alert);
    console.log(repository);
    console.log(sender);
    console.log(organization);
    console.log(ref);
    console.log(commit_oid);

    const url = process.env.SLACK_WEBHOOK_URL as string;

    const webhook = new IncomingWebhook(url);

    const text = { text: "Code Scanning Alert made!" };

    await webhook.send(text);

    return "hello";
  } catch (e: any) {
    const body = e.message || "";
    console.error(e);
    return { statusCode: 401, body };
  }
};
