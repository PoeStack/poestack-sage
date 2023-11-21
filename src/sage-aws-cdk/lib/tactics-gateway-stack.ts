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

export class TacticsGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps, sageStack: SageStack) {
    super(scope, id, props)

    const domainName = 'poe.zone'
    const siteDomain = 'www' + '.' + domainName

    const hostedZone = aws_route53.HostedZone.fromLookup(this, 'TacticsGatewayZone', {
      domainName: domainName
    })

    new CfnOutput(this, 'Site', { value: 'https://' + siteDomain })
    const certificate = new aws_certificatemanager.Certificate(this, 'TacticsGatewayCertificate', {
      domainName: domainName,
      subjectAlternativeNames: ['*.' + domainName],
      validation: aws_certificatemanager.CertificateValidation.fromDns(hostedZone)
    })

    certificate.applyRemovalPolicy(RemovalPolicy.DESTROY)
    new CfnOutput(this, 'Certificate', { value: certificate.certificateArn })

    const ecsCluster = new aws_ecs.Cluster(this, 'TacticsGatewayCluster', {
      clusterName: 'tactics-gateway-cluster',
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

    const ecr = new aws_ecr.Repository(this, 'TacticsGatewayRepoX', {
      repositoryName: 'poestack-tactics-gatewayx'
    })

    const TacticsGatewayTask = new aws_ecs.Ec2TaskDefinition(this, 'TacticsGatewayTask')
    TacticsGatewayTask.addContainer('TacticsGateway', {
      image: aws_ecs.ContainerImage.fromEcrRepository(ecr),
      memoryLimitMiB: 512,
      logging: LogDriver.awsLogs({
        streamPrefix: 'tactics-gateway-container',
        logRetention: RetentionDays.THREE_DAYS
      }),
      command: ['node', 'src/tactics-gateway/dist/index.js'],
      environmentFiles: [EnvironmentFile.fromBucket(sageStack.configBucket, 'tactics-gateway.env')],
      portMappings: [
        {
          containerPort: 9000,
          protocol: aws_ecs.Protocol.TCP
        }
      ]
    })
    sageStack.configBucket.grantRead(TacticsGatewayTask.executionRole!!)
    const TacticsGatewayService = new aws_ecs.Ec2Service(this, 'TacticsGatewaySvc', {
      cluster: ecsCluster,
      taskDefinition: TacticsGatewayTask,
      deploymentController: {
        type: DeploymentControllerType.ECS
      },
      circuitBreaker: undefined
    })

    const TacticsGatewayAlb = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(
      this,
      'TacticsGatewayAlb',
      {
        vpc: sageStack.vpc,
        internetFacing: true
      }
    )

    const albListener = TacticsGatewayAlb.addListener('TacticsGatewayALBHttpsListener', {
      port: 443,
      certificates: [certificate]
    })

    albListener.addTargets('TacticsGatewayServiceTarget', {
      port: 443,
      targets: [
        TacticsGatewayService.loadBalancerTarget({
          containerName: 'TacticsGateway',
          containerPort: 9000
        })
      ]
    })

    new aws_route53.ARecord(this, 'WWWSiteAliasRecord', {
      zone: hostedZone,
      recordName: siteDomain,
      target: aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.LoadBalancerTarget(TacticsGatewayAlb)
      )
    })
  }
}
