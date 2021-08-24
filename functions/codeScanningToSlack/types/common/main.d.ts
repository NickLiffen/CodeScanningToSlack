declare namespace NodeJS {
  export interface ProcessEnv {
    SLACK_URL: string;
    GITHUB_WEBHOOKS_SECRET: string;
  }
}

type SLACK_URL = string;
