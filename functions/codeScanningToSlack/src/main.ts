import { ssm } from "./ssm";
import { IncomingWebhook, IncomingWebhookSendArguments } from "@slack/webhook";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { secretVerifier } from "./verify";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    await ssm();

    const refsToBeNotifiedAbout = [
      "refs/heads/main",
      "refs/heads/dev",
      "refs/heads/staging",
    ];

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
        text: `A Code Scanning alert has just manually been closed. It has been closed by ${alert.dismissed_by.login}. The repository where it has been closed is ${repository.name} (within the ${organization.login} organisation). Information about the closed alert can be found below.`,
        attachments: [
          {
            color: "warning",
            title: `${alert.rule.id}`,
            title_link: `${alert.html_url}`,
            fields: [
              {
                title: "Alert Description",
                value: `${alert.rule.description}`,
                short: true,
              },
              {
                title: "Dismissed Reason",
                value: `${alert.dismissed_reason}`,
                short: true,
              },
              {
                title: "Alert Severity:",
                value: `${alert.rule.severity}`,
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

    if (action === "created" && refsToBeNotifiedAbout.includes(ref)) {
      const text = {
        text: `A Code Scanning alert from ${alert.tool.name} has just been found and created. The repository where the alert has been found is ${repository.name} (within the ${organization.login} organisation). Information about the alert can be found below.`,
        attachments: [
          {
            color: "warning",
            title: `${alert.rule.id}`,
            title_link: `${alert.html_url}`,
            fields: [
              {
                title: "Rule ID",
                value: `${alert.rule.id}`,
                short: true,
              },
              {
                title: "Rule Description",
                value: `${alert.rule.description}`,
                short: true,
              },
              {
                title: "Alert Severity:",
                value: `${alert.rule.severity}`,
                short: true,
              },
              {
                title: "Commit Found In:",
                value: `${commit_oid}`,
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

    if (action === "fixed" && refsToBeNotifiedAbout.includes(ref)) {
      const text = {
        text: `A Code Scanning alert from ${alert.tool.name} has just been fixed! It was fixed by ${sender.login}. It was fixed in the repository ${repository.name} (within the ${organization.login} organisation). Information about the alert can be found below.`,
        attachments: [
          {
            color: "good",
            title: `${alert.rule.id}`,
            title_link: `${alert.html_url}`,
            fields: [
              {
                title: "Rule ID",
                value: `${alert.rule.id}`,
                short: true,
              },
              {
                title: "Rule Description",
                value: `${alert.rule.description}`,
                short: true,
              },
              {
                title: "Alert Severity:",
                value: `${alert.rule.severity}`,
                short: true,
              },
              {
                title: "Commit Fixed In:",
                value: `${commit_oid}`,
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

    return { statusCode: 200, body: "Successfully Posted Message to Slack!" };
  } catch (e: any) {
    const body = e.message || "";
    console.error(e);
    return { statusCode: 401, body };
  }
};
