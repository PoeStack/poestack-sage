import * as cdk from 'aws-cdk-lib';
import {aws_ecs, aws_ecs_patterns} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {ContainerRepoStack} from "./container-repo-stack";
import {EnvironmentFile, LogDriver} from "aws-cdk-lib/aws-ecs";
import {SageStack} from "./sage-stack";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {Schedule} from 'aws-cdk-lib/aws-applicationautoscaling';
import {Bucket} from "aws-cdk-lib/aws-s3";

export class InsightsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps, containerRepoStack: ContainerRepoStack, sageStack: SageStack) {
        super(scope, id, props);

        const cacheBucket = new Bucket(this, "InsCacheBucket", {
            bucketName: 'sage-insights-cache'
        })

        const streamConsumerTask = new aws_ecs.Ec2TaskDefinition(this, 'InsStreamConsumerTask');
        streamConsumerTask.addContainer('InsStreamConsumer', {
            image: aws_ecs.ContainerImage.fromEcrRepository(containerRepoStack.insightsRepo),
            memoryLimitMiB: 512,
            logging: LogDriver.awsLogs({
                streamPrefix: "insights-stream-consumer-container",
                logRetention: RetentionDays.THREE_DAYS
            }),
            environmentFiles: [EnvironmentFile.fromBucket(sageStack.configBucket, "insights.env")]
        });
        sageStack.configBucket.grantRead(streamConsumerTask.executionRole!!)
        new aws_ecs.Ec2Service(this, 'InsStreamConsumerSvc', {
            cluster: sageStack.ecsCluster,
            taskDefinition: streamConsumerTask,
        });

        const cacheUpdaterTask = new aws_ecs.Ec2TaskDefinition(this, 'InsCacheUpdaterTask');
        cacheUpdaterTask.addContainer('InsCacheUpdater', {
            image: aws_ecs.ContainerImage.fromEcrRepository(containerRepoStack.insightsCacheUpdaterRepo),
            memoryLimitMiB: 512,
            logging: LogDriver.awsLogs({
                streamPrefix: "insights-cache-updater-container",
                logRetention: RetentionDays.THREE_DAYS
            }),
            environmentFiles: [EnvironmentFile.fromBucket(sageStack.configBucket, "insights.env")]
        });
        sageStack.configBucket.grantRead(cacheUpdaterTask.executionRole!!)
        cacheBucket.grantReadWrite(cacheUpdaterTask.taskRole!!)
        new aws_ecs_patterns.ScheduledEc2Task(this, "InsCacheUpdaterSch", {
            scheduledEc2TaskDefinitionOptions: {
                taskDefinition: cacheUpdaterTask
            },
            cluster: sageStack.ecsCluster,
            schedule: Schedule.expression('rate(1 minute)'),
            enabled: true,
            ruleName: 'insights-cache-updater-schedule',
        })


    }
}
