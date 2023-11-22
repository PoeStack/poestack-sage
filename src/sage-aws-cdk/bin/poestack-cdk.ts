#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { SageStack } from '../lib/sage-stack'
import { InsightsStack } from '../lib/insights-stack'
import { TacticsAPIStack } from '../lib/tactics-api-stack'

const app = new cdk.App()

const sageStack = new SageStack(app, 'SageStack', {})

new InsightsStack(app, 'InsightsStack', {}, sageStack)
new TacticsAPIStack(app, 'TacticsAPIStack', {}, sageStack)
