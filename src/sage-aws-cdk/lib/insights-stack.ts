import * as cdk from 'aws-cdk-lib'
import { aws_cloudfront, aws_ecr, aws_ecs, aws_ecs_patterns, aws_elasticache } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { DeploymentControllerType, EnvironmentFile, LogDriver } from 'aws-cdk-lib/aws-ecs'
import { SageStack } from './sage-stack'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Peer, Port, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2'
import { UpdatePolicy } from 'aws-cdk-lib/aws-autoscaling'
import { Schedule } from 'aws-cdk-lib/aws-events'

export class InsightsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps, sageStack: SageStack) {
    super(scope, id, props)

    const redisSecurityGroup = new SecurityGroup(this, 'InsRedisSG', {
      securityGroupName: 'ins-redis-security-group',
      vpc: sageStack.vpc,
      allowAllOutbound: true
    })
    redisSecurityGroup.connections.allowFrom(Peer.ipv4(sageStack.vpc.vpcCidrBlock), Port.allTcp())
    redisSecurityGroup.connections.allowTo(Peer.ipv4(sageStack.vpc.vpcCidrBlock), Port.allTcp())

    const subnetGroup = new aws_elasticache.CfnSubnetGroup(this, 'InsRedisSubG', {
      cacheSubnetGroupName: 'ins-redis-subnet',
      subnetIds: sageStack.vpc.selectSubnets().subnetIds,
      description: 'redis cluster private subgroup'
    })
    const redis = new aws_elasticache.CfnCacheCluster(this, `InsRedisCluster4`, {
      engine: 'redis',
      cacheNodeType: 'cache.t2.medium',
      numCacheNodes: 1,
      clusterName: 'ins-redis-cluster-5',
      vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
      cacheSubnetGroupName: subnetGroup.cacheSubnetGroupName
    })
    redis.addDependency(subnetGroup)

    const ecsCluster = new aws_ecs.Cluster(this, 'InsightCluster', {
      clusterName: 'insights-cluster',
      vpc: sageStack.vpc
    })
    ecsCluster.addCapacity('DefaultAutoScalingGroupCapacity', {
      allowAllOutbound: true,
      vpcSubnets: sageStack.vpc.selectSubnets({ subnetType: SubnetType.PUBLIC }),
      instanceType: new ec2.InstanceType('t2.medium'),
      minCapacity: 0,
      desiredCapacity: 1,
      maxCapacity: 3,
      updatePolicy: UpdatePolicy.rollingUpdate()
    })

    const cacheBucket = new Bucket(this, 'InsCacheBucket', {
      bucketName: 'sage-insights-cache'
    })

    const ecr = new aws_ecr.Repository(this, 'InsightsRepoX', {
      repositoryName: 'poestack-insightsx'
    })

    const streamConsumerTask = new aws_ecs.Ec2TaskDefinition(this, 'InsStreamConsumerTask')
    streamConsumerTask.addContainer('InsStreamConsumer', {
      image: aws_ecs.ContainerImage.fromEcrRepository(ecr),
      memoryLimitMiB: 512,
      logging: LogDriver.awsLogs({
        streamPrefix: 'insights-stream-consumer-container',
        logRetention: RetentionDays.THREE_DAYS
      }),
      command: ['node', 'src/insights/dist/consume-stream.js'],
      environment: {
        REDIS_URL: redis.attrRedisEndpointAddress
      },
      environmentFiles: [EnvironmentFile.fromBucket(sageStack.configBucket, 'insights.env')]
    })
    sageStack.configBucket.grantRead(streamConsumerTask.executionRole!!)
    new aws_ecs.Ec2Service(this, 'InsStreamConsumerSvc', {
      cluster: ecsCluster,
      taskDefinition: streamConsumerTask,
      deploymentController: {
        type: DeploymentControllerType.ECS
      },
      circuitBreaker: undefined
    })

    const cacheUpdaterTask = new aws_ecs.Ec2TaskDefinition(this, 'InsCacheUpdaterTask')
    cacheUpdaterTask.addContainer('InsCacheUpdater', {
      image: aws_ecs.ContainerImage.fromEcrRepository(ecr),
      memoryLimitMiB: 512,
      logging: LogDriver.awsLogs({
        streamPrefix: 'insights-cache-updater-container',
        logRetention: RetentionDays.THREE_DAYS
      }),
      command: ['node', 'src/insights/dist/cache-valuations.js'],
      environment: {
        REDIS_URL: redis.attrRedisEndpointAddress
      },
      environmentFiles: [EnvironmentFile.fromBucket(sageStack.configBucket, 'insights.env')]
    })
    sageStack.configBucket.grantRead(cacheUpdaterTask.executionRole!!)
    cacheBucket.grantReadWrite(cacheUpdaterTask.taskRole!!)
    new aws_ecs_patterns.ScheduledEc2Task(this, 'InsUpdateCacheSch', {
      scheduledEc2TaskDefinitionOptions: {
        taskDefinition: cacheUpdaterTask
      },
      cluster: ecsCluster,
      schedule: Schedule.expression('rate(20 minutes)'),
      enabled: true,
      ruleName: 'insights-update-cache-schedule'
    })

    const expireListingsTask = new aws_ecs.Ec2TaskDefinition(this, 'ExpireListingsTask')
    expireListingsTask.addContainer('InsExpireC', {
      image: aws_ecs.ContainerImage.fromEcrRepository(ecr),
      memoryLimitMiB: 512,
      logging: LogDriver.awsLogs({
        streamPrefix: 'insights-expire-listings-container',
        logRetention: RetentionDays.THREE_DAYS
      }),
      command: ['node', 'src/insights/dist/expire-listings.js'],
      environment: {
        REDIS_URL: redis.attrRedisEndpointAddress
      },
      environmentFiles: [EnvironmentFile.fromBucket(sageStack.configBucket, 'insights.env')]
    })
    sageStack.configBucket.grantRead(expireListingsTask.executionRole!!)
    new aws_ecs_patterns.ScheduledEc2Task(this, 'InsExpireListingSch', {
      scheduledEc2TaskDefinitionOptions: {
        taskDefinition: expireListingsTask
      },
      cluster: ecsCluster,
      schedule: Schedule.expression('rate(10 minutes)'),
      enabled: true,
      ruleName: 'insights-expire-listings-schedule'
    })

    new aws_cloudfront.Distribution(this, 'InsightsCache', {
      defaultBehavior: { origin: new S3Origin(cacheBucket) }
    })
  }
}
