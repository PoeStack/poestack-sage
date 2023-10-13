import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {aws_ec2, aws_elasticache, aws_lambda, aws_memorydb, Duration} from "aws-cdk-lib";
import * as path from "path";
import {Peer, Port, SecurityGroup} from "aws-cdk-lib/aws-ec2";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PoestackCdkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const vpc = new aws_ec2.Vpc(this, "VPC", {
            availabilityZones: ['us-east-1c', 'us-east-1d', 'us-east-1b']
        })

        const redisSubnetGroup = new aws_memorydb.CfnSubnetGroup(this, "redisSubnetGroup", {
            subnetGroupName: "redis-subnet-group",
            subnetIds: vpc.selectSubnets().subnetIds
        })

        const securityGroup = new SecurityGroup(this, "redisSecurityGroup", {
            securityGroupName: "redis-security-group",
            vpc: vpc,
            allowAllOutbound: true
        })
        securityGroup.connections.allowFrom(Peer.ipv4(vpc.vpcCidrBlock), Port.allTcp())
        securityGroup.connections.allowTo(Peer.ipv4(vpc.vpcCidrBlock), Port.allTcp())


        const redis = new aws_memorydb.CfnCluster(this, "PsStreamCache", {
            aclName: "open-access",
            clusterName: "ps-stream-cache-2",
            nodeType: "db.t4g.medium",
            numShards: 1,
            numReplicasPerShard: 0,
            subnetGroupName: redisSubnetGroup.subnetGroupName,
            securityGroupIds: [securityGroup.securityGroupId],
            tlsEnabled:
                false,
        })

        const lambda = new aws_lambda.Function(this, "test", {
            runtime: aws_lambda.Runtime.JAVA_17,
            handler: 'com.poestack.approach.TestHandler',
            vpc: vpc,
            securityGroups: [securityGroup],
            timeout: Duration.seconds(15),
            code: aws_lambda.Code.fromAsset("../poestack-approach/build/libs/poestack-approach-1.0-SNAPSHOT-all.jar"),
        })

    }
}
