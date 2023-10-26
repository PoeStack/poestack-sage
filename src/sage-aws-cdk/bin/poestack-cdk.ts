#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {ContainerRepoStack} from "../lib/container-repo-stack";
import {SageStack} from "../lib/sage-stack";
import {InsightsApiStack} from "../lib/insights-api-stack";
import {InsightsStack} from "../lib/insights-stack";

const app = new cdk.App();

const containerRepoStack = new ContainerRepoStack(app, "ContainerRepoStack", {})
const sageStack = new SageStack(app, 'SageStack', {}, containerRepoStack);

new InsightsStack(app, "InsightsStack", {}, containerRepoStack, sageStack)
new InsightsApiStack(app, "InsightsApiStack", {}, containerRepoStack, sageStack)