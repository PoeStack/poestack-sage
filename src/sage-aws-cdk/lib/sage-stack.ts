import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { aws_ec2, aws_ecs, aws_elasticache } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { UpdatePolicy } from 'aws-cdk-lib/aws-autoscaling'

export class SageStack extends cdk.Stack {
  public vpc: aws_ec2.Vpc

  public runtimeConfigTable: cdk.aws_dynamodb.TableV2

  public ecsCluster: aws_ecs.Cluster

  public psStreamSecurityGroup: SecurityGroup

  public configBucket: Bucket

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)
    this.configBucket = new Bucket(this, 'sage-config', { bucketName: 'sage-config' })

    this.vpc = new aws_ec2.Vpc(this, 'VPC', {
      availabilityZones: ['us-east-1c', 'us-east-1d', 'us-east-1b'],
      subnetConfiguration: [{ cidrMask: 18, name: 'Public', subnetType: SubnetType.PUBLIC }]
    })

    this.runtimeConfigTable = new cdk.aws_dynamodb.TableV2(this, 'RuntimeTable', {
      tableName: 'RuntimeConfig',
      partitionKey: { name: 'key', type: cdk.aws_dynamodb.AttributeType.STRING }
    })

    this.ecsCluster = new aws_ecs.Cluster(this, 'InsightCluster', {
      clusterName: 'insights-cluster',
      vpc: this.vpc
    })
    this.ecsCluster.addCapacity('DefaultAutoScalingGroupCapacity', {
      allowAllOutbound: true,
      vpcSubnets: this.vpc.selectSubnets({ subnetType: SubnetType.PUBLIC }),
      instanceType: new ec2.InstanceType('t2.medium'),
      minCapacity: 0,
      desiredCapacity: 1,
      maxCapacity: 3,
      updatePolicy: UpdatePolicy.rollingUpdate()
    })
  }
}
