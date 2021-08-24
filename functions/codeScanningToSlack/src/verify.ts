
import { verify } from "@octokit/webhooks-methods";
import { APIGatewayProxyEventV2 } from "aws-lambda";

export const secretVerifier = async (secret: string, event: APIGatewayProxyEventV2): Promise<boolean> => {
    const body = event.body as string;
    const signature = event.headers["x-hub-signature-256"] as string;
    const authedAnswer = await verify(secret, body, signature);
    return authedAnswer;
};
