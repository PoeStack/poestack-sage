import * as cdk from "aws-cdk-lib";
import {aws_ecr} from "aws-cdk-lib";
import {Construct} from "constructs";

export class ContainerRepoStack extends cdk.Stack {

    public insightsRepo: aws_ecr.Repository;
    public approachRepo: aws_ecr.Repository;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        this.insightsRepo = new aws_ecr.Repository(this, "InsightsRepo", {
            repositoryName: "poestack-insights"
        })
        this.approachRepo = new aws_ecr.Repository(this, "ApproachRepo", {
            repositoryName: "poestack-approach"
        })
    }
}