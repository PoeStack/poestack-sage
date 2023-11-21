import * as cdk from 'aws-cdk-lib'
import {
  CfnOutput,
  aws_ecr,
  aws_ecs,
  aws_route53,
  aws_certificatemanager,
  RemovalPolicy
} from 'aws-cdk-lib'
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

    const domainName = 'poe.zone'
    const siteDomain = 'www' + '.' + domainName

    const hostedZone = aws_route53.HostedZone.fromLookup(this, 'SageBackendZone', {
      domainName: domainName
    })

    new CfnOutput(this, 'Site', { value: 'https://' + siteDomain })
    const certificate = new aws_certificatemanager.Certificate(this, 'SageBackendCertificate', {
      domainName: domainName,
      subjectAlternativeNames: ['*.' + domainName],
      validation: aws_certificatemanager.CertificateValidation.fromDns(hostedZone)
    })

    certificate.applyRemovalPolicy(RemovalPolicy.DESTROY)
    new CfnOutput(this, 'Certificate', { value: certificate.certificateArn })

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
      environmentFiles: [EnvironmentFile.fromBucket(sageStack.configBucket, 'sage-backend.env')],
      portMappings: [
        {
          containerPort: 9000,
          protocol: aws_ecs.Protocol.TCP
        }
      ]
    })
    sageStack.configBucket.grantRead(sageBackendTask.executionRole!!)
    const sageBackendService = new aws_ecs.Ec2Service(this, 'SageBackendSvc', {
      cluster: ecsCluster,
      taskDefinition: sageBackendTask,
      deploymentController: {
        type: DeploymentControllerType.ECS
      },
      circuitBreaker: undefined
    })

    const sageBackendAlb = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(
      this,
      'SageBackendAlb',
      {
        vpc: sageStack.vpc,
        internetFacing: true
      }
    )

    const albListener = sageBackendAlb.addListener('SageBackendALBHttpsListener', {
      port: 443,
      certificates: [certificate]
    })

    albListener.addTargets('SageBackendServiceTarget', {
      port: 443,
      targets: [
        sageBackendService.loadBalancerTarget({
          containerName: 'SageBackend',
          containerPort: 9000
        })
      ]
    })

    new aws_route53.ARecord(this, 'WWWSiteAliasRecord', {
      zone: hostedZone,
      recordName: siteDomain,
      target: aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.LoadBalancerTarget(sageBackendAlb)
      )
    })
  }
}
