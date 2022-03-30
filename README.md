# quincymitchell.com

This is a project for TypeScript development with CDK.
The `cdk.json` file tells the CDK Toolkit how to execute the app.

This is the infra that mostly powers my personal website. I setup the ACM cert & route53 hosted zone manually, but the S3 & Cloudfront is defined here. I then manually upload files to S3 and manually invalidate cloudfront for the changes to go live. It also supports CORS.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to the default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
