# Connecting GitHub Code Scanning Alerts to Slack

**TLDR**: Right now, `code_scanning_alerts` are not supported by GitHub Actions events. This means we cannot use GitHub Actions for this use case. Once `code_scanning_alerts` are supported, a GitHub Action will be created for teams who do not want to deploy a custom solution.
## Overview 

A solution that enables organizations to filter GitHub Code Scanning alerts into Slack channels. Specifically whenever an alert has been:

- Created
- Fixed
- Manually Closed by a User

The solution has been designed to be configurable to the end-users preferences when it comes to being notified. Code Scanning can be *noisy*, so the solution ensures you can configure when you get notified.

This solution is deployed to AWS.

## How this works

Whenever a new code scanning alert is: `created`, `fixed` or `closed_by_user`, a webhook from a GitHub App will be sent to an API Gateway within AWS. The API's first step is passing the context of the payload to a Lambda Authorizer, ensuring the Webhook has come from GitHub. If valid, the API will pass the event payload (from the webhook) to a Lambda for processing. The first step this Lambda does is validate the GitHub Secret is correct. If valid, the Lambda will destructure the payload, find the event type (`created`, `fixed` or `closed_by_user`) and, based on the event, send a specific message to a Slack App Incoming Webhook URL. The Slack App will then forward the message to the specific channels configured on the Slack App.

At any point, if the webhook IP or secret sent do not match or are not valid, an unauthorized response will be sent to the client. 

## Technologies Used

The following technologies are used throughout this solution:

- AWS
    - [Lambda](https://aws.amazon.com/lambda/) is used for compute power.
    - [Cloud Formation](https://aws.amazon.com/cloudformation/) is used as our IaC (Infrastructure as Code).
    - [HTTP API Gateway](https://aws.amazon.com/api-gateway/) is used for ingress into AWS.
    - [Cloud Watch](https://aws.amazon.com/cloudwatch/) is used for logging and monitoring.
    - [IAM](https://aws.amazon.com/iam/) is used to connect resources and allow deployments into AWS from GitHub Actions
    - [S3](https://aws.amazon.com/s3/) is used by AWS SAM to deploy the stack, and therefore deploy it into the AWS ecosystem using Cloud Formation.
    - [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) is used to store parameters.
- Slack
    - [Slack App](https://nickliffentes-6sx7712.slack.com/intl/en-gb/apps) is used as our ingress method into Slack.
- GitHub
    - [GitHub App](https://docs.github.com/en/developers/apps/building-github-apps) is used as our egress method out of GitHub.
    - [GitHub Actions](https://docs.github.com/en/developers/apps/building-github-apps) is used to deploy the solution into AWS.

[AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) is used for the Lambda &amp; HTTP API Gateway resources. 

**Note**: Even though this solution is deployed to AWS, the code can be changed to work with the likes of Azure and GCP (Azure Function, Google Functions, etc.).

## Architecture

![GitHub Code Scanning to Slack Architecure](https://lucid.app/documents/embeddedchart/f2750aee-1721-4931-8db6-8f9d3ff6f021)

## Pre-Req's

1. Access to an AWS environment.
2. Access to a Slack environment.
3. Access to a GitHub environment. 
4. A repository where the code for this solution is going to live.

## Getting Started


The below steps show the *path of least resistance* way of deploying this solution into AWS. There are many ways to do this. Every organization likely has different processes (especially with deploying into AWS), meaning you may have to pivot during these steps to accommodate organization-specific processes. This is okay. Please treat these instructions as an example and reference; if they work end-to-end, great; if not, please adjust to your company policies. 

If you get an error you cannot get around, please log an issue on this repository.

### Step One: Create IAM User

Create an [IAM User](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html). The IAM User will need to have the capability to do the following:

- CRUD access over S3 Resources. 
- CRUD access over IAM Resources. 
- CRUD access over API Gateway Resources.
- CRUD acess over Lambda Resources.
- CRUD access over CloudWatch Resources.

From that user, create an AWS Access key and secret. Once you have both, create a [GitHub Enviroment](https://docs.github.com/en/actions/reference/environments#creating-an-environment) called **main** and within that environment create two secrets `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` with the relevant information from AWS in. Set the environment to only deploy from the `main` branch. (This can be changed later at any time).

**NOTE**: If your organization doesn't allow the use of IAM Users, this isn't a problem. We use the official [configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials) GitHub action. Meaning you can head to the `.github/workflows/deploy.yaml` file and swap out the AWS User method to assuming an AWS Role. Or, if you have a custom GitHub Action which authenticates into AWS, remove the `configure-AWS-credentials` action and swap it out for your custom one. 

### Step Two: Create and Configure Slack App

Create a [Slack Application](https://api.slack.com/apps). You will need to be an administrator of your Slack organization to do this. When you create the Slack application, add the channel(s) you would like the Code Scanning results to be posted to. 

Instructions on doing this can be found here: [Webhooks: Getting Started](https://api.slack.com/messaging/webhooks#getting_started__1.-create-a-slack-app-if-you-dont-have-one-already).

You should end up with a URL that looks like this: `https://hooks.slack.com/services/******/******/******` (I have redacted the values for `***`). 

**NOTE**: Don't share this URL with anyone; keep it private.

### Step Three: Create and Configure GitHub App

Create a [GitHub Application](https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app). You will need to be an administrator of your GitHub organization to do this. During the creation of the application, you only need to enter:

1. GitHub App Name: GitHub Code Scanning Alerts to Slack
2. Homepage URL: https://donotknowthisurlyet.com
3. Webhook URL: https://donotknowthisurlyet.com
4. Webhook Secret: *enter secret of your choice - keep this value secret but note it down for later*
5. Permissions: 
    - Security event
6. Subscribe to events:
    - Code scanning alert
7. Where can this integration be installed: Only on this account

The rest of the fields you do not need to enter. Right now, you don't know what the URL's are going to be, so put any value in there. 

Once the application is created, you need to install the GitHub App on your organization and then add the repositories you want Code Scanning events to be sent to Slack. Follow the instructions here: [Installing your private GitHub App on your repository](https://docs.github.com/en/developers/apps/managing-github-apps/installing-github-apps#installing-your-private-github-app-on-your-repository). 

**NOTE**: When you install the GitHub App on your GitHub Organisation, I would advise you do not have it connected to every repository. It will get **very** noisy. Only install it on the repositories you are interested in. 

Once it's installed, we need to collect some information:

1. GitHub App Private Key. Follow the instructions here: [Generating a private key](https://docs.github.com/en/developers/apps/building-github-apps/authenticating-with-github-apps#generating-a-private-key) to do that. 
2. Client Secret: Just above where you generated the private key, there will be an option for you to generate a client secret. Click the *Generate a new Client Secret* button and note down the secret. 
3. Client ID: Just above where you generated the client secret, you will see the Client ID; take a note of the id. 
4. App ID: Just above where you generated the client secret, you will see the App ID; take a note of the id. 
5. Installation ID: The Installation ID is in a different location; head to your Organizations GitHub App's page (https://github.com/organizations/${orgName}/settings/installations). Click *Configure* next to the GitHub App you created. If you look at the URL, at the end of the URL, you will see a number. It should be after the `installations/` part of the URL. Copy down that number.

### Step Four: Create Parameters within AWS Systems Manager (Parameter Store)

Log into AWS, head to AWS Systems Manager, then AWS Parameter Store. In total, you will need to create seven parameters. 

1. `/code scanning/APP_CLIENT_ID`: The GitHub App Client ID you got from Step Three.
2. `/code scanning/APP_CLIENT_SECRET`: The GitHub App Client Secret you got from Step Three.
3. `/code scanning/APP_ID`: The GitHub App ID you got from Step Three.
4. `/code scanning/APP_INSTALLATION_ID`: The GitHub App Installation ID you got from Step Three.
5. `/code scanning/APP_PRIVATE_KEY`: The GitHub App Private Key you got from Step Three.
6. `/code scanning/GITHUB_WEBHOOKS_SECRET`: The GitHub App Private Key you got from Step Three. (The first part when you created the GitHub App)
7. `/code scanning/SLACK_WEBHOOK_URL`: The Slack Webhook URL you got at the end of Step Two. 

**NOTE**: It is recommended you make the: `/codescanning/APP_CLIENT_SECRET`, `/codescanning/APP_PRIVATE_KEY`, `/codescanning/GITHUB_WEBHOOKS_SECRET` and `/codescanning/SLACK_WEBHOOK_URL` values `SecureString` within Parameter Store. The rest can be simply `String` types. 

### Step five: Deployment into AWS

Second to last step! Before we do this, let's check a few things:

- An environment is created with two GitHub Secrets in which can deploy to AWS. 
A slack app is created with an incoming webhook URL that can drop messages into the channels of your choice. 
- A GitHub app is created, connected to the repositories where you would like to receive code scanning alerts from. 
- AWS Parameters have been created. 

If the above is complete, pull the contents of this codebase and push it into the repository where you configured the GitHub Environment and Secrets. Make sure you push to the main branch (or the branch you configured in the environment to deploy from). 

GitHub Actions should now trigger! You can watch the workflow within the Actions tab of your repository, but what it is doing is:

- Linting
- Building (Typescript -> Javascript)
- Building (SAM)
- Deploying (SAM)

The first time you deploy, it should take about 5-6 minutes. As long as the role you created in Step One has the correct permissions mentioned above, your deployment should succeed. Log into AWS, head to Cloud Formation, look for the `codeScanning` stack, head to outputs, and you should see an output called: `HttpApiUrl`. Note down this URL. 

### Step Six: Update GitHub App to send webhooks to the URL output from Step Five

Head back to the GitHub App you created in Step Four. Head down to the Webhook URL, enter the URL from Step Five and add `/codescanning` onto the end of the URI. The URL you got from the output is the domain, but not the full URI where webhooks should be sent. So make sure to put the `/codescanning` endpoint onto that URL. 

Click *Save* 

Done! From now on, whenever a Code Scanning Alert gets: `created`, `fixed` and `closed_by_user`, a notification will get dropped into Slack. 


## FAQ's

### I don't use AWS!? How can I use this solution?

Not a problem. The reason why AWS was chosen is due to the market popularity. However, we understand that not every company has AWS. The codebase will require some reconfiguration to meet whatever requirements your cloud/hosting provider has. The codebase structure can stay the same; you will likely have to change the `template.yml`, for example. 

I would advise if you don't use AWS. Use this codebase as a reference. It is a great template to *copy and paste* snippets from and put into your solution. 

### I don't use GitHub Actions!? How can I use this solution?

Again, not a problem. Take a look at the `.github/workflow/deploy.yaml` and translate that to whatever CI engine you are using. You shouldn't need to make any changes to the actual codebase, just the workflow file. 

### I have the solution working, but I would like to change the format of the messages. How can I do this?

Great question! This solution has been designed to be configurable. Head to the following directory: `functions/codeScanningToSlack/src/messages`. Here you will see the pre-created messages. These are just templates. We **welcome** you to go in and change the structure of the message to suit your needs. 

If you would like to add more messages, outside of the three pre-set: (`created`, `fixed` or `closed_by_user`) ones. Create a new file within the `messages` directory. The format should be similar to the other messages, but with the text you need, then head back to the `functions/codeScanningToSlack/src/main.ts` file and add the file with the message, connected to whatever action you would like the message to be sent from. E.G `opened_by_user`. 

The different events can be found under the `action` key here: [code_scanning_alert](https://docs.github.com/en/enterprise-server@2.22/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#code_scanning_alert).

### I have a question or an issue that isn't answered in this README. Where can I ask it?

Open an [issue](https://github.com/NickLiffen/CodeScanningToSlack/issues/new) within this repository. 

## Contributions 

This repository 100% welcomes contributions! Would you mind logging an issue to discuss what you would like to implement first, then raise a pull request when it's ready for review? 