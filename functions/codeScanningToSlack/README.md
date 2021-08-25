# GitHub Code Scanning Webhook to Slack
### Purpose

The purpose of this lambda is to take a code scanning webhook, manipulate the webhook into a structured Slack webhook response, and send the body of that response to a Slack channel. 

The aim is to help make code scanning notifications more consumable. Although developers live within GitHub, they also communicate often in Slack. We would like to bring the data to as many different usable endpoints as possible. Slack being one.