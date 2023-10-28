## Sage AWS CDK
This is the "AWS infrastructure as code" repo that is used to deploy the backend code to AWS


### Deployment from scratch
- Setup the AWS CLI and auth it to the account you want to deploy the sage stack too
- Run `cd ./src/sage-aws-cdk`
- Run `npm install`
- Run `npm run build`
- Run `cdk list`
- You should now see a list of stacks you can deploy
- For each stack in the order they are listed run `cdk deploy STACK_NAME_HERE`