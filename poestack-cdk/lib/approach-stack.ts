import * as cdk from 'aws-cdk-lib';
import {aws_ec2, aws_ecr, aws_ecs, aws_lambda, aws_memorydb, Duration, RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import {Peer, Port, SecurityGroup} from "aws-cdk-lib/aws-ec2";
import {ContainerRepoStack} from "./container-repo-stack";
import {LogDriver} from "aws-cdk-lib/aws-ecs";
import {SageStack} from "./sage-stack";

export class ApproachStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps, containerRepoStack: ContainerRepoStack, sageStack: SageStack) {
        super(scope, id, props);

        const lambda = new aws_lambda.Function(this, "test", {
            runtime: aws_lambda.Runtime.JAVA_17,
            handler: 'com.poestack.approach.TestHandler',
            vpc: sageStack.vpc,
            securityGroups: [sageStack.psStreamSecurityGroup],
            timeout: Duration.seconds(15),
            code: aws_lambda.Code.fromAsset("../poestack-approach/build/libs/poestack-approach-1.0-SNAPSHOT-all.jar"),
        })
    }
}
