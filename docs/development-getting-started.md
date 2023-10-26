# Getting Started

This document will help you get started with Sage development. By the end of the document you will have a development enviroment setup and a test plugin running.

### Prerequisites
To effecitvely work on a sage plugin or the common library it would be helpful if you had some experience with the following:
- Typescript/Javascript - All the plugins are written in Typescript/Javascript these are not hard languages to pick up but you might struggle a bit at the start.
- React - All the UI is built with React/Electron you don't need to be a React wizard but some understanding will go a long way.
- Tailwindcss - All of the CSS in the project is done with Tailwind again you don't need much experience but understand what it is would help a lot.
- RxJs - The common library uitilizes this heavily you will need a basic understanding to work inside the common library, while writing scripts you can use RxJs but most of it can also be abstracted with prebuilt bindings/promises.
- Node/Electron - For creating scripts you don't need to know much about these but as you get into more advanced features or working with the common library these will become useful.

### System Requirements
Before moving on make sure you have the following installed:
- NodeJS - `node -v` and `npm -v` should work
- Java - `java -version` should show a jdk higher than version 8 (technically to build plugins you do not need this but it will make it much more complicated)
- Git - `git -v` should work

### Project Setup
Follow these instructions to clone and setup the project:
- Clone the Sage project `git clone https://github.com/PoeStack/poestack-sage`
- You should now have a directory containing the code from this repo
- Inside the repo run the following command `gradle npmInstall`. This will install all the npm modules for all sub projects in the repo
- Next run `gradle npmBuild` NOTE: on some systems this command stalls the first time it is ran if it has been running a bit kill it and run it again
- Next navigate to the `src/echo-app` directory `cd ./src/echo-app`
- Execute the following command `npm run start`
- A Electron window should open. Contratulations you have correctly installed Sage for local development

### Creating Your First Plugin
