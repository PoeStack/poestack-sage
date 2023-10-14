import * as cdk from 'aws-cdk-lib';
import {aws_ec2, aws_ecr, aws_ecs, aws_lambda, aws_memorydb, Duration, RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import {Peer, Port, SecurityGroup} from "aws-cdk-lib/aws-ec2";
import {ContainerRepoStack} from "./container-repo-stack";
import {LogDriver} from "aws-cdk-lib/aws-ecs";
import {SageStack} from "./sage-stack";
export class InsightsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps, containerRepoStack: ContainerRepoStack, sageStack: SageStack) {
        super(scope, id, props);


        const taskDefinition = new aws_ecs.Ec2TaskDefinition(this, 'TaskDef');
        taskDefinition.addContainer('DefaultContainer', {
            image: aws_ecs.ContainerImage.fromEcrRepository(containerRepoStack.insightsRepo),
            memoryLimitMiB: 512,
            logging: LogDriver.awsLogs({streamPrefix: "insight-container"}),
            environment: {
                REDIS_URL: "redis://ps-stream-cache-2.lgibek.clustercfg.memorydb.us-east-1.amazonaws.com:6379",
                GGG_ACCOUNT_AUTH_TOKEN: "",
                GGG_SERVICE_AUTH_TOKEN: ""
            }
        });

        const ecsService = new aws_ecs.Ec2Service(this, 'InsightsService', {
            cluster: sageStack.ecsCluster,
            taskDefinition: taskDefinition,
        });
    }
}
