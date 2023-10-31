import * as cdk from 'aws-cdk-lib';
import {aws_cloudfront, aws_ecs, aws_ecs_patterns} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {ContainerRepoStack} from "./container-repo-stack";
import {EnvironmentFile, LogDriver} from "aws-cdk-lib/aws-ecs";
import {SageStack} from "./sage-stack";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {S3Origin} from "aws-cdk-lib/aws-cloudfront-origins";
import {SubnetType} from "aws-cdk-lib/aws-ec2";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import {UpdatePolicy} from "aws-cdk-lib/aws-autoscaling";

export class InsightsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps, containerRepoStack: ContainerRepoStack, sageStack: SageStack) {
        super(scope, id, props);

        const ecsCluster = new aws_ecs.Cluster(this, "InsightCluster", {
            clusterName: "insights-cluster",
            vpc: sageStack.vpc
        })
        ecsCluster.addCapacity("DefaultAutoScalingGroupCapacity", {
            allowAllOutbound: true,
            vpcSubnets: sageStack.vpc.selectSubnets({subnetType: SubnetType.PUBLIC}),
            instanceType: new ec2.InstanceType("t2.medium"),
            minCapacity: 0,
            desiredCapacity: 1,
            maxCapacity: 3,
            updatePolicy: UpdatePolicy.rollingUpdate()
        })

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
            cluster: ecsCluster,
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
        new aws_ecs.Ec2Service(this, 'InsCacheUpdaterSvc', {
            cluster: ecsCluster,
            taskDefinition: cacheUpdaterTask,
        });

        new aws_cloudfront.Distribution(this, 'InsightsCache', {
            defaultBehavior: {origin: new S3Origin(cacheBucket)},
        });
    }
}
