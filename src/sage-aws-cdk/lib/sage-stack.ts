import * as cdk from 'aws-cdk-lib'
import { aws_ec2, aws_ecs, aws_elasticache } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Peer, Port, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2'
import { ContainerRepoStack } from './container-repo-stack'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { UpdatePolicy } from 'aws-cdk-lib/aws-autoscaling'

export class SageStack extends cdk.Stack {
  public vpc: aws_ec2.Vpc

  public psStreamSecurityGroup: SecurityGroup

  public configBucket: Bucket

  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps,
    containerRepoStack: ContainerRepoStack
  ) {
    super(scope, id, props)
    this.configBucket = new Bucket(this, 'sage-config', { bucketName: 'sage-config' })

    this.vpc = new aws_ec2.Vpc(this, 'VPC', {
      availabilityZones: ['us-east-1c', 'us-east-1d', 'us-east-1b'],
      subnetConfiguration: [{ cidrMask: 18, name: 'Public', subnetType: SubnetType.PUBLIC }]
    })
  }
}
