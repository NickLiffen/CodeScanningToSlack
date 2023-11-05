import { IncomingWebhookSendArguments } from "@slack/webhook";
export const fixedMessage = async (
  alert: any,
  repository: any,
  organization: any,
  commit_oid: string,
): Promise<IncomingWebhookSendArguments> => {
  return {
    text: `Yay! A Code Scanning alert found by ${alert.tool.name} has just been fixed . The repository where it has been fixed is ${repository.name} (within the ${organization.login} organisation). Information about the closed alert can be found below.`,
    attachments: [
      {
        color: "good",
        title: `${alert.rule.id}`,
        title_link: `${alert.html_url}`,
        fields: [
          {
            title: "Alert Description",
            value: `${alert.rule.description}`,
            short: true,
          },
          {
            title: "Commit Fixed In:",
            value: `${commit_oid}`,
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
