import * as cdk from "aws-cdk-lib";
import {aws_ecr} from "aws-cdk-lib";
import {Construct} from "constructs";

export class ContainerRepoStack extends cdk.Stack {

    public insightsRepo: aws_ecr.Repository;
    public insightsCacheUpdaterRepo: aws_ecr.Repository;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        this.insightsRepo = new aws_ecr.Repository(this, "InsightsRepo", {
            repositoryName: "poestack-insights"
        })
        this.insightsCacheUpdaterRepo = new aws_ecr.Repository(this, "InsightsRepo2", {
            repositoryName: "poestack-insights-cache-updater",
        })
    }
}