import * as cdk from 'aws-cdk-lib';
import {aws_lambda, Duration} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {ContainerRepoStack} from "./container-repo-stack";
import {SageStack} from "./sage-stack";
import {RetentionDays} from "aws-cdk-lib/aws-logs";

export class InsightsApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps, containerRepoStack: ContainerRepoStack, sageStack: SageStack) {
        super(scope, id, props);

        //Lambda is placed in public subnet, it will not have internet access.
        const lambda = new aws_lambda.Function(this, "InsightsApiTestHandler", {
            runtime: aws_lambda.Runtime.JAVA_17,
            handler: 'com.poestack.approach.TestHandler',
            vpc: sageStack.vpc,
            allowPublicSubnet: true,
            logRetention: RetentionDays.THREE_DAYS,
            securityGroups: [sageStack.psStreamSecurityGroup],
            timeout: Duration.seconds(15),
            code: aws_lambda.Code.fromAsset("../poestack-insights-api/build/libs/poestack-approach-1.0-SNAPSHOT-all.jar"),
        })

    }
}
