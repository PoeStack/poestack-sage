import * as cdk from 'aws-cdk-lib'
import { aws_ecr, aws_ecs } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { DeploymentControllerType, EnvironmentFile, LogDriver } from 'aws-cdk-lib/aws-ecs'
import { SageStack } from './sage-stack'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { SubnetType } from 'aws-cdk-lib/aws-ec2'
import { UpdatePolicy } from 'aws-cdk-lib/aws-autoscaling'

export class SageBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps, sageStack: SageStack) {
    super(scope, id, props)

    const ecsCluster = new aws_ecs.Cluster(this, 'SageBackendCluster', {
      clusterName: 'sage-backend-cluster',
      vpc: sageStack.vpc
    })
    ecsCluster.addCapacity('DefaultAutoScalingGroupCapacity', {
      allowAllOutbound: true,
      vpcSubnets: sageStack.vpc.selectSubnets({ subnetType: SubnetType.PUBLIC }),
      instanceType: new ec2.InstanceType('t2.small'),
      minCapacity: 0,
      desiredCapacity: 1,
      maxCapacity: 1,
      updatePolicy: UpdatePolicy.rollingUpdate()
    })

    const ecr = new aws_ecr.Repository(this, 'SageBackendRepoX', {
      repositoryName: 'poestack-sage-backendx'
    })

    const sageBackendTask = new aws_ecs.Ec2TaskDefinition(this, 'SageBackendTask')
    sageBackendTask.addContainer('SageBackend', {
      image: aws_ecs.ContainerImage.fromEcrRepository(ecr),
      memoryLimitMiB: 512,
      logging: LogDriver.awsLogs({
        streamPrefix: 'sage-backend-container',
        logRetention: RetentionDays.THREE_DAYS
      }),
      command: ['node', 'src/sage-backend/dist/index.js'],
      environmentFiles: [EnvironmentFile.fromBucket(sageStack.configBucket, 'sage-backend.env')]
    })
    sageStack.configBucket.grantRead(sageBackendTask.executionRole!!)
    new aws_ecs.Ec2Service(this, 'InsStreamConsumerSvc', {
      cluster: ecsCluster,
      taskDefinition: sageBackendTask,
      deploymentController: {
        type: DeploymentControllerType.ECS
      },
      circuitBreaker: undefined
    })
  }
}
