import { graphql } from "@octokit/graphql";

  export const getGitHubIpRange = async (token: string): Promise<hookIPAddress> => {
    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });

    try {
      const { meta } = await graphqlWithAuth(
        `
        {
          meta {
            hookIpAddresses
          }
        }
        `
      ) as IP;
      console.log("Got IP Addresses from graphqlWithAuth", meta);
      return meta;
    } catch (err) {
      console.error("Error Calling Function (graphqlWithAuth)", err);
      throw err;
    }
  };
