import { IncomingWebhookSendArguments } from "@slack/webhook";
export const closedByUserMessage = async (
  alert: any,
  repository: any,
  organization: any
): Promise<IncomingWebhookSendArguments> => {
  return {
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
};
