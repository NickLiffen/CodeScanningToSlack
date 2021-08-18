
import { ssm } from "./ssm";
import { IncomingWebhook } from '@slack/webhook'

export const handler = async (event: unknown): Promise<void> => {

  console.log(event);
  try {
    await ssm();
    const webhook = new IncomingWebhook(process.env.SLACK_URL);
    await webhook.send({
      text: 'I\'ve got news for you...',
    });
    
  } catch (e) {
    console.error(e);
    throw e;
  }
};
