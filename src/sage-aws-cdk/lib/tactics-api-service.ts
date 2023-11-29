import * as cdk from 'aws-cdk-lib'
import {
  CfnOutput,
  aws_ecr,
  aws_ecs,
  aws_route53,
  aws_certificatemanager,
  RemovalPolicy,
  aws_lambda,
  aws_lambda_nodejs
} from 'aws-cdk-lib'
import { DeploymentControllerType, EnvironmentFile, LogDriver } from 'aws-cdk-lib/aws-ecs'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { SageStack } from './sage-stack'
import path = require('path')

export class TacticsApiService {
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

    if (!bootstrap) {
      new aws_lambda_nodejs.NodejsFunction(sageStack, 'test2', {
        entry: '/dist/lambda/send-dm.js',
        handler: 'handler'
      })

      new aws_lambda.DockerImageFunction(sageStack, 'MyFunction', {
        code: aws_lambda.DockerImageCode.fromEcr(ecr, {})
      })

      const apiTask = new aws_ecs.Ec2TaskDefinition(sageStack, 'TacticsApiTask')
      apiTask.addContainer('TacticsApiC', {
        image: aws_ecs.ContainerImage.fromEcrRepository(ecr),
        memoryLimitMiB: 512,
        logging: LogDriver.awsLogs({
          streamPrefix: 'tactics-api',
          logRetention: RetentionDays.THREE_DAYS
        }),
        command: ['node', 'src/tactics-api/dist/index.js'],
        environmentFiles: [EnvironmentFile.fromBucket(sageStack.configBucket, 'tactics-api.env')]
      })
      sageStack.configBucket.grantRead(apiTask.executionRole!!)
      new aws_ecs.Ec2Service(sageStack, 'TacticsApiSvc', {
        cluster: sageStack.ecsCluster,
        taskDefinition: apiTask,
        deploymentController: {
          type: DeploymentControllerType.ECS
        },
        circuitBreaker: undefined
      })
    }
  }
}
