
# Getting Started

This document will help you get started with Sage development. By the end of the document you will have a development enviroment setup and a test plugin running.

### Prerequisites
To effecitvely work on a Sage plugin or the common library it would be helpful if you had some experience with the following:
- Typescript/Javascript - All the plugins are written in Typescript/Javascript these are not hard languages to pick up but you might struggle a bit at the start.
- React - All the UI is built with React you don't need to be a React wizard but some understanding will go a long way.
- Tailwindcss - All of the CSS in the project is done with Tailwind again you don't need much experience but understanding what it is would help a lot.

As you get into more advanced features it might also be helpful to have experience with:
- RxJs - The common library uitilizes this heavily you will need a basic understanding to work inside the common library, while writing scripts you can use RxJs but most of it can also be abstracted with prebuilt bindings/promises.
- Node/Electron - For creating scripts you don't need to know much about these but as you get into more advanced features or working with the common library these will become useful.

### System Requirements
Before moving on make sure you have the following installed:
- NodeJS - `node -v` and `npm -v` should work
- Java - `java -version` should show a jdk higher than version 8 (technically to build plugins you do not need this but it will make it much more complicated)
- Git - `git -v` should work

### Project Setup
Follow these instructions to clone and setup the project:
- Clone the Sage project `git clone https://github.com/PoeStack/poestack-sage` You should now have a directory containing the code from this repo
- Inside the repo run the following command `./gradlew npmInstall` or `./gradlew.bat npmInstall` on Windows. This will install all the npm modules for all sub projects in the repo
- Next run `./gradlew npmBuild` or `./gradlew.bat npmBuild` on Windows. NOTE: on some systems this command stalls the first time it is ran if it has been running a bit kill it and run it again
- Next navigate to the `src/echo-app` directory `cd ./src/echo-app`
- Execute the following command `npm run start`
- A Electron window should open. Congratulations you have correctly installed Sage for local development

Debugging:
- Make sure you have the newest version of node installed
- Mac consideration [here](https://stackoverflow.com/questions/68896696/having-trouble-installing-npm-on-mac-m1)


### Creating Your First Plugin

This section will go over creating a simple plugin from scratch. We'll be creating a "hideout is lava" plugin that will show stopwatch whenever we enter our hideout to remind us to get back to mapping.
For this section some file management commands might not work on all systems if they don't just make the directory/copy files manually.


The first step is to create a new directory for our plugin in `/src/echo-plugins`. `mkdir src/echo-plugins/hideout-is-lava`

Lets `cd` into the new directory so our working directory is our new plugins home. `cd src/echo-plugins/hideout-is-lava

Now that we have a directory to work in we'll need some base files. Lets copy these from an example plugin to give us a starting point. `rsync -av --exclude=node_modules ../../echo-plugin-examples/poe-log-plugin/ .`
(Copy everything from the echo-plugin-examples/poe-log-plugin into the current directory except for node_modules)

We should now have a `package.json` with some deps, a `src` directory containing the example plugin, and some supporting files.

To start lets rename our plugin. Open `package.json` in your edtior and change `"name": "example-poe-log-plugin"` to `"name": "hideout-is-lava-plugin"`

Now run `npm install` to install the plugin's deps

Next lets make some changes to the plugins `src/entry.tsx` file. Open it in an editor and change
`plugin: 'example-log-plugin-stash'` to `plugin: 'hideout-is-lava-plugin'`

Lets also change the icon in the side bar
Change `DocumentTextIcon` to `FireIcon` and change the import to `import { FireIcon } from '@heroicons/react/24/outline'`

Now lets update the app change the contents of `src/App.tsx` to

```
const App = () => {
  return <>Hello from our new plugin</>
}

export default App
```

Now run `npm run build` to build our new plugin

Next open a termninal in `src/echo-app` run `npm run start` to launch the Electron app. In the side bar you should now see the fire icon. Click it and you should see our test message.

Leave the Electron app open and change our test message to `<>Wow our plugin is cool</>`. Run `npm run build` in the plugin directory and in the Electron app press `cmd + r` or F5 on Windows to refresh the page.
Go back to the fire icon and you should see the new next without having recompiled/restarted the Electron app.

Okay we've now got all the basics out of the way lets start building our actual plugin.



















