import { ssm } from "./ssm";
import { IncomingWebhook, IncomingWebhookSendArguments } from "@slack/webhook";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { secretVerifier } from "./verify";
import { fixedMessage, createdMessage, closedByUserMessage } from "./messages";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    await ssm();

    const response = (await secretVerifier(event)) as boolean;

    if (!response)
      return {
        statusCode: 401,
        body: "webhook secret provided does not match. unauthorized.",
      };

    const body = event.body || "";

    const { action, alert, repository, organization, ref, commit_oid } =
      JSON.parse(body);

    let IncomingWebhookSendArguments: IncomingWebhookSendArguments = {};

    const refsToBeNotifiedAbout = [
      "refs/heads/main",
      "refs/heads/dev",
      "refs/heads/staging",
    ] as string[];

    if (action === "closed_by_user") {
      IncomingWebhookSendArguments = await closedByUserMessage(
        alert,
        repository,
        organization
      );
    }

    if (action === "created" && refsToBeNotifiedAbout.includes(ref)) {
      IncomingWebhookSendArguments = await createdMessage(
        alert,
        repository,
        organization,
        commit_oid
      );
    }

    if (action === "fixed" && refsToBeNotifiedAbout.includes(ref)) {
      IncomingWebhookSendArguments = await fixedMessage(
        alert,
        repository,
        organization,
        commit_oid
      );
    }

    const url = process.env.SLACK_WEBHOOK_URL as string;
    const webhook = new IncomingWebhook(url);
    await webhook.send(IncomingWebhookSendArguments);

    return { statusCode: 200, body: "Successfully Posted Message to Slack!" };
  } catch (e: any) {
    const body = e.message || "";
    console.error(e);
    return { statusCode: 401, body };
  }
};
