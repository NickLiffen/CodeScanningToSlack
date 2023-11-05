import { IncomingWebhookSendArguments } from "@slack/webhook";
export const createdMessage = async (
  alert: any,
  repository: any,
  organization: any,
  commit_oid: string,
): Promise<IncomingWebhookSendArguments> => {
  return {
    text: `A Code Scanning alert from ${alert.tool.name} has just been found and created. The repository where the alert has been found is ${repository.name} (within the ${organization.login} organisation). Information about the alert can be found below.`,
    attachments: [
      {
        color: "danger",
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
};
