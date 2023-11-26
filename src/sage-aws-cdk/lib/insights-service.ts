import { aws_cloudfront, aws_ecr, aws_ecs, aws_ecs_patterns, aws_elasticache } from 'aws-cdk-lib'
import { DeploymentControllerType, EnvironmentFile, LogDriver } from 'aws-cdk-lib/aws-ecs'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { Peer, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2'
import { Schedule } from 'aws-cdk-lib/aws-events'
import { SageStack } from './sage-stack'

export class InsightsService {
  constructor(sageStack: SageStack, bootstrap: boolean) {
    const redisSecurityGroup = new SecurityGroup(sageStack, 'InsRedisSG', {
      securityGroupName: 'ins-redis-security-group',
      vpc: sageStack.vpc,
      allowAllOutbound: true
    })
    redisSecurityGroup.connections.allowFrom(Peer.ipv4(sageStack.vpc.vpcCidrBlock), Port.allTcp())
    redisSecurityGroup.connections.allowTo(Peer.ipv4(sageStack.vpc.vpcCidrBlock), Port.allTcp())

    const subnetGroup = new aws_elasticache.CfnSubnetGroup(sageStack, 'InsRedisSubG', {
      cacheSubnetGroupName: 'ins-redis-subnet',
      subnetIds: sageStack.vpc.selectSubnets().subnetIds,
      description: 'redis cluster private subgroup'
    })
    const redis = new aws_elasticache.CfnCacheCluster(sageStack, `InsRedisCluster4`, {
      engine: 'redis',
      cacheNodeType: 'cache.t2.medium',
      numCacheNodes: 1,
      clusterName: 'ins-redis-cluster-5',
      vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
      cacheSubnetGroupName: subnetGroup.cacheSubnetGroupName
    })
    redis.addDependency(subnetGroup)

    const cacheBucket = new Bucket(sageStack, 'InsCacheBucket', {
      bucketName: 'sage-insights-cache'
    })

    const ecr = new aws_ecr.Repository(sageStack, 'InsightsRepoX', {
      repositoryName: 'poestack-insightsx'
    })

    if (!bootstrap) {
      const streamConsumerTask = new aws_ecs.Ec2TaskDefinition(sageStack, 'InsStreamConsumerTask')
      streamConsumerTask.addContainer('InsStreamConsumer', {
        image: aws_ecs.ContainerImage.fromEcrRepository(ecr),
        memoryLimitMiB: 512,
        logging: LogDriver.awsLogs({
          streamPrefix: 'insights-stream-consumer-container',
          logRetention: RetentionDays.THREE_DAYS
        }),
        command: ['node', 'src/insights/dist/consume-stream-sqlite.js'],
        environment: {
          REDIS_URL: redis.attrRedisEndpointAddress
        },
        environmentFiles: [EnvironmentFile.fromBucket(sageStack.configBucket, 'insights.env')]
      })
      cacheBucket.grantReadWrite(streamConsumerTask.executionRole!!)
      sageStack.configBucket.grantRead(streamConsumerTask.executionRole!!)
      sageStack.runtimeConfigTable.grantFullAccess(streamConsumerTask.executionRole!!)
      new aws_ecs.Ec2Service(sageStack, 'InsStreamConsumerSvc', {
        cluster: sageStack.ecsCluster,
        taskDefinition: streamConsumerTask,
        deploymentController: {
          type: DeploymentControllerType.ECS
        },
        circuitBreaker: undefined
      })

      const cacheUpdaterTask = new aws_ecs.Ec2TaskDefinition(sageStack, 'InsCacheUpdaterTask')
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
      new aws_ecs_patterns.ScheduledEc2Task(sageStack, 'InsUpdateCacheSch', {
        scheduledEc2TaskDefinitionOptions: {
          taskDefinition: cacheUpdaterTask
        },
        cluster: sageStack.ecsCluster,
        schedule: Schedule.expression('rate(20 minutes)'),
        enabled: true,
        ruleName: 'insights-update-cache-schedule'
      })

      const expireListingsTask = new aws_ecs.Ec2TaskDefinition(sageStack, 'ExpireListingsTask')
      expireListingsTask.addContainer('InsExpireC', {
        image: aws_ecs.ContainerImage.fromEcrRepository(ecr),
        memoryLimitMiB: 1024,
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
      new aws_ecs_patterns.ScheduledEc2Task(sageStack, 'InsExpireListingSch', {
        scheduledEc2TaskDefinitionOptions: {
          taskDefinition: expireListingsTask
        },
        cluster: sageStack.ecsCluster,
        schedule: Schedule.expression('rate(45 minutes)'),
        enabled: true,
        ruleName: 'insights-expire-listings-schedule'
      })
    }

    new aws_cloudfront.Distribution(sageStack, 'InsightsCache', {
      defaultBehavior: { origin: new S3Origin(cacheBucket) }
    })
  }
}
