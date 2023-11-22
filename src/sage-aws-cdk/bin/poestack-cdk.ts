#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { InsightsService } from '../lib/insights-service'
import { TacticsAPIStack } from '../lib/tactics-api-service'
import { SageStack } from '../lib/sage-stack'

const app = new cdk.App()

const sageStack = new SageStack(app, 'SageStack', {})

new InsightsService(sageStack, true)
new TacticsAPIStack(sageStack, true)
