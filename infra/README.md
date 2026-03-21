# Welcome to your CDK TypeScript project

This application handles the AWS setup for task manager.
Please notice that setup allows SSH into the EC2 machine only from company computers as details in company-ipv4.ts, so if the company CIDR changes, this file needs to be updated, and cdk deploy needs to be run again

The deployed EC2 instance exposes ports 80 and 443. Nginx listens on both ports, redirects all HTTP traffic to HTTPS, and proxies HTTPS requests to the Node.js container on localhost:3000.

## Useful commands

* `cdk bootstrap --show-template`   see a full list of what this project is creating in AWS
* `cdk bootstrap` bootstrap all the required services in AWS for the task-manager project
* `cdk deploy` deploys task-manager as a dockerzed image to AWS, after running this, please update parameters in GitHub secrets, so CD continues to work
* `cdk destroy` destroys all AWS resources, and requires cdk deploy to recreate them

