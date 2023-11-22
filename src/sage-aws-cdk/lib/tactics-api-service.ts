import * as cdk from 'aws-cdk-lib'
import {
  CfnOutput,
  aws_ecr,
  aws_ecs,
  aws_route53,
  aws_certificatemanager,
  RemovalPolicy
} from 'aws-cdk-lib'
import { DeploymentControllerType, EnvironmentFile, LogDriver } from 'aws-cdk-lib/aws-ecs'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { SageStack } from './sage-stack'

export class TacticsAPIStack {
  constructor(sageStack: SageStack, bootstrap: boolean) {
    const domainName = 'poe.zone'
    const siteDomain = 'www' + '.' + domainName

    const hostedZone = aws_route53.HostedZone.fromLookup(sageStack, 'TacticsAPIZone', {
      domainName: domainName
    })

    new CfnOutput(sageStack, 'Site', { value: 'https://' + siteDomain })
    const certificate = new aws_certificatemanager.Certificate(sageStack, 'TacticsAPICertificate', {
      domainName: domainName,
      subjectAlternativeNames: ['*.' + domainName],
      validation: aws_certificatemanager.CertificateValidation.fromDns(hostedZone)
    })

    certificate.applyRemovalPolicy(RemovalPolicy.DESTROY)
    new CfnOutput(sageStack, 'Certificate', { value: certificate.certificateArn })


    const ecr = new aws_ecr.Repository(sageStack, 'TacticsAPIRepoX', {
      repositoryName: 'poestack-tactics-apix'
    })


    if (bootstrap) {
      const apiTask = new aws_ecs.Ec2TaskDefinition(sageStack, 'TacticsAPITask')
      apiTask.addContainer('TacticsAPI', {
        image: aws_ecs.ContainerImage.fromEcrRepository(ecr),
        memoryLimitMiB: 512,
        logging: LogDriver.awsLogs({
          streamPrefix: 'tactics-api-container',
          logRetention: RetentionDays.THREE_DAYS
        }),
        command: ['node', 'src/tactics-api/dist/index.js'],
        environmentFiles: [EnvironmentFile.fromBucket(sageStack.configBucket, 'tactics-api.env')],
        portMappings: [
          {
            containerPort: 9000,
            protocol: aws_ecs.Protocol.TCP
          }
        ]
      })
      sageStack.configBucket.grantRead(apiTask.executionRole!!)
      const apiService = new aws_ecs.Ec2Service(sageStack, 'TacticsAPISvc', {
        cluster: sageStack.ecsCluster,
        taskDefinition: apiTask,
        deploymentController: {
          type: DeploymentControllerType.ECS
        },
        circuitBreaker: undefined
      })

      const apiAlb = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(
        sageStack,
        'TacticsAPIAlb',
        {
          vpc: sageStack.vpc,
          internetFacing: true
        }
      )

      const albListener = apiAlb.addListener('TacticsAPIALBHttpsListener', {
        port: 443,
        certificates: [certificate]
      })

      albListener.addTargets('TacticsAPIServiceTarget', {
        port: 443,
        targets: [
          apiService.loadBalancerTarget({
            containerName: 'TacticsAPI',
            containerPort: 9000
          })
        ]
      })
      new aws_route53.ARecord(sageStack, 'WWWSiteAliasRecord', {
        zone: hostedZone,
        recordName: siteDomain,
        target: aws_route53.RecordTarget.fromAlias(
          new cdk.aws_route53_targets.LoadBalancerTarget(apiAlb)
        )
      })
    }
  }
}
