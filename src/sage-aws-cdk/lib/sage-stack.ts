import * as cdk from 'aws-cdk-lib';
import {aws_ec2, aws_ecs, aws_elasticache, aws_memorydb} from 'aws-cdk-lib';
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

        this.psStreamSecurityGroup = new SecurityGroup(this, "redisSecurityGroup", {
            securityGroupName: "redis-security-group",
            vpc: this.vpc,
            allowAllOutbound: true
        })
        this.psStreamSecurityGroup.connections.allowFrom(Peer.ipv4(this.vpc.vpcCidrBlock), Port.allTcp())
        this.psStreamSecurityGroup.connections.allowTo(Peer.ipv4(this.vpc.vpcCidrBlock), Port.allTcp())

        const subnetGroup = new aws_elasticache. CfnSubnetGroup(
            this,
            "RedisClusterPrivateSubnetGroup",
            {
                cacheSubnetGroupName: "privata",
                subnetIds: this.vpc.selectSubnets().subnetIds,
                description: "subnet di sviluppo privata"
            }
        );
        const redis = new aws_elasticache.CfnCacheCluster(this, `RedisCluster`, {
            engine: "redis",
            cacheNodeType: "cache.t2.small",
            numCacheNodes: 1,
            clusterName: "redis-sviluppo",
            vpcSecurityGroupIds: [this.psStreamSecurityGroup.securityGroupId],
            cacheSubnetGroupName: subnetGroup.cacheSubnetGroupName
        });
        redis.addDependency(subnetGroup);

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
