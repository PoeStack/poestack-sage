import * as cdk from 'aws-cdk-lib';
import {aws_ecs} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {ContainerRepoStack} from "./container-repo-stack";
import {EnvironmentFile, LogDriver} from "aws-cdk-lib/aws-ecs";
import {SageStack} from "./sage-stack";
import {RetentionDays} from "aws-cdk-lib/aws-logs";

export class InsightsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps, containerRepoStack: ContainerRepoStack, sageStack: SageStack) {
        super(scope, id, props);

        const taskDefinition = new aws_ecs.Ec2TaskDefinition(this, 'TaskDef');
        taskDefinition.addContainer('DefaultContainer', {
            image: aws_ecs.ContainerImage.fromEcrRepository(containerRepoStack.insightsRepo),
            memoryLimitMiB: 512,
            logging: LogDriver.awsLogs({streamPrefix: "insight-container", logRetention: RetentionDays.THREE_DAYS}),
            environmentFiles: [EnvironmentFile.fromBucket(sageStack.configBucket, "insights.env")]
        });
        sageStack.configBucket.grantRead(taskDefinition.executionRole!!)

        const ecsService = new aws_ecs.Ec2Service(this, 'InsightsService', {
            cluster: sageStack.ecsCluster,
            taskDefinition: taskDefinition,
        });
    }
}
