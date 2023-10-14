import * as cdk from 'aws-cdk-lib';
import {aws_lambda, Duration} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {ContainerRepoStack} from "./container-repo-stack";
import {SageStack} from "./sage-stack";
import {RetentionDays} from "aws-cdk-lib/aws-logs";

export class ApproachStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps, containerRepoStack: ContainerRepoStack, sageStack: SageStack) {
        super(scope, id, props);

        const lambda = new aws_lambda.Function(this, "test", {
            runtime: aws_lambda.Runtime.JAVA_17,
            handler: 'com.poestack.approach.TestHandler',
            vpc: sageStack.vpc,
            logRetention: RetentionDays.THREE_DAYS,
            securityGroups: [sageStack.psStreamSecurityGroup],
            timeout: Duration.seconds(15),
            code: aws_lambda.Code.fromAsset("../poestack-approach/build/libs/poestack-approach-1.0-SNAPSHOT-all.jar"),
        })

    }
}
