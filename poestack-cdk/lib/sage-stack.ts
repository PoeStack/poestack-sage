import * as cdk from 'aws-cdk-lib';
import {aws_ec2, aws_ecs, aws_memorydb} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import {Peer, Port, SecurityGroup, SubnetType} from "aws-cdk-lib/aws-ec2";
import {ContainerRepoStack} from "./container-repo-stack";
import {Bucket} from "aws-cdk-lib/aws-s3";

export class SageStack extends cdk.Stack {

    public vpc: aws_ec2.Vpc;

    public ecsCluster: aws_ecs.Cluster;

    public psStream: aws_memorydb.CfnCluster;
    public psStreamSecurityGroup: SecurityGroup;

    public configBucket: Bucket;

    constructor(scope: Construct, id: string, props: cdk.StackProps, containerRepoStack: ContainerRepoStack) {
        super(scope, id, props);
        this.configBucket = new Bucket(this, "sage-config", {bucketName: "sage-config"})

        this.vpc = new aws_ec2.Vpc(this, "VPC", {
            availabilityZones: ['us-east-1c', 'us-east-1d', 'us-east-1b'],
            subnetConfiguration: [
                {cidrMask: 18, name: 'Public', subnetType: SubnetType.PUBLIC},
            ]
        })

        const redisSubnetGroup = new aws_memorydb.CfnSubnetGroup(this, "redisSubnetGroup", {
            subnetGroupName: "redis-subnet-group",
            subnetIds: this.vpc.selectSubnets().subnetIds
        })
        this.psStreamSecurityGroup = new SecurityGroup(this, "redisSecurityGroup", {
            securityGroupName: "redis-security-group",
            vpc: this.vpc,
            allowAllOutbound: true
        })
        this.psStreamSecurityGroup.connections.allowFrom(Peer.ipv4(this.vpc.vpcCidrBlock), Port.allTcp())
        this.psStreamSecurityGroup.connections.allowTo(Peer.ipv4(this.vpc.vpcCidrBlock), Port.allTcp())

        this.psStream = new aws_memorydb.CfnCluster(this, "PsStreamCache", {
            aclName: "open-access",
            clusterName: "ps-stream-cache-2",
            nodeType: "db.t4g.medium",
            numShards: 1,
            numReplicasPerShard: 0,
            subnetGroupName: redisSubnetGroup.subnetGroupName,
            securityGroupIds: [this.psStreamSecurityGroup.securityGroupId],
            tlsEnabled:
                false,
        })

        this.ecsCluster = new aws_ecs.Cluster(this, "EscCluster", {
            clusterName: "poestack-sage-cluster",
            vpc: this.vpc
        })

        this.ecsCluster.addCapacity("DefaultAutoScalingGroupCapacity", {
            allowAllOutbound: true,
            vpcSubnets: this.vpc.selectSubnets({subnetType: SubnetType.PUBLIC}),
            instanceType: new ec2.InstanceType("t2.medium"),
            minCapacity: 0,
            desiredCapacity: 1,
            maxCapacity: 1,
        })
    }
}
