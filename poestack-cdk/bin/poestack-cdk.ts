#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {ContainerRepoStack} from "../lib/container-repo-stack";
import {SageStack} from "../lib/sage-stack";
import {ApproachStack} from "../lib/approach-stack";
import {InsightsStack} from "../lib/insights-stack";

const app = new cdk.App();

const containerRepoStack = new ContainerRepoStack(app, "ContainerRepoStack", {})
const sageStack = new SageStack(app, 'SageStack', {}, containerRepoStack);
new ApproachStack(app, "ApproachStack", {}, containerRepoStack, sageStack)
new InsightsStack(app, "InsightsStack", {}, containerRepoStack, sageStack)