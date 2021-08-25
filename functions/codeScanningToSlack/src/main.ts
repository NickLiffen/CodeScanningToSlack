import { ssm } from "./ssm";
import { IncomingWebhook, IncomingWebhookSendArguments } from "@slack/webhook";
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

    if (action === "closed_by_user") {
      const text = {
        text: `Code Scanning Alert Closed in organisation: ${organization.login}, within the repository: ${repository.name} by ${alert.dismissed_by.login}`,
        attachments: [
          {
            color: "good",
            title: `${alert.rule.id}`,
            title_link: `${alert.html_url}`,
            fields: [
              {
                title: "Alert Description",
                value: `${alert.rule.full_description}`,
                short: true,
              },
              {
                title: "Dismissed Reason",
                value: `${alert.dismissed_reason}`,
                short: true,
              },
              {
                title: "Information Found here:",
                value: `${alert.html_url}`,
                short: true,
              },
            ],
          },
        ],
      } as IncomingWebhookSendArguments;

      const url = process.env.SLACK_WEBHOOK_URL as string;
      const webhook = new IncomingWebhook(url);
      await webhook.send(text);
    }

    console.log(action);
    console.log(alert);
    console.log(repository);
    console.log(sender);
    console.log(organization);
    console.log(ref);
    console.log(commit_oid);

    return "hello";
  } catch (e: any) {
    const body = e.message || "";
    console.error(e);
    return { statusCode: 401, body };
  }
};
