# Design Overview
This document aims to give you a starting point for understanding what all the projects inside the Sage repo do and some of why some of the high level design descisions were made. 

## High level design choices

### Plugin Platform Based Application
The goal of Sage is mainly to allow people in the POE community to easily create features they are passionate about. POE is really lucky to have a community that makes tons of cool tools. That being said most people are not very passionate about setting up Auth flows, building basic UI, wrapping the GGG api, implementing caching layers, ect. To make it easier for people in the community to build cool tools Sage is a plugin first application. The Sage project accomplishes these goals in two parts. 

- Sage implements a common libarary and plugin interface that allows plugins to easily access any of the data neeed to create features. This layer handles the authentication, API rate limits, comes with logical defaults for caching, and provides easy ways to bind this data to React. Using this library it is easy to write plugins that have advanced functionality with a relativiely small amount of code. It also lowers the bar that is required to start building a feature while also exposing these features to a wider audiance than most developers would have when starting their first POE tool.
- Sage also implements an Electron UI that allows users to authenticate, and then install plugins. The UI handles plugin life cycles and displaying the plugins pages to the user. Sage also handles keeping the base library/plugins updated on user machines and collecting metrics/logs for debugging purposes.

Since plugin development is the goal of sage all core functionality that can be a plugin should be a plugin. 

### Monorepo

### Electron/React
