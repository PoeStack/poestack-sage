# High level design choices
This document aims to give you a starting point for understanding what all the projects inside the Sage repo do and some of why some of the high level design descisions were made. 

### Plugin Platform Based Application
The goal of Sage is mainly to allow people in the POE community to easily create features they are passionate about. POE is really lucky to have a community that makes tons of cool tools. That being said most people are not very passionate about setting up Auth flows, building basic UI, wrapping the GGG api, implementing caching layers, ect. To make it easier for people in the community to build cool tools Sage is a plugin first application. The Sage project accomplishes these goals in two parts. 

- Sage implements a common libarary and plugin interface that allows plugins to easily access any of the data needed to create features. This layer handles the authentication, API rate limits, comes with logical defaults for caching, and provides easy ways to bind this data to React. Using this library it is easy to write plugins that have advanced functionality with a relativiely small amount of code (my example stash viewer plugin is around 60 total lines of React). It also lowers the bar that is required to start building a feature while also exposing these features to a wider audiance than most developers would have when starting their first POE tool.
- Sage also implements an Electron UI that allows users to authenticate, and then install plugins. The UI handles plugin life cycles and displaying the plugins pages to the user. Sage also handles keeping the base library/plugins updated on user machines and collecting metrics/logs for debugging purposes.

Since plugin development is the goal of sage all core functionality that can be a plugin should be a plugin. 

### Monorepo
Sage is a monorepo that contains all projects that go into running the Sage application. This includes:
- Common libraries for building plugins
- The Electron application
- Example plugins
- The GGG api wrapper
- Backend code for:
  - Tracking POE pricing information
  - Handling user auth
  - TFT integrations
- All core and published plugins

Okay so what? What are the advantages of keeping all of these projects in one repo?
The main benifit is that at its core Sage is a shared library and a shared platform. Monorepos have a couple of properties that make building shared code easier. The first benifit is that having all of the code in one place makes sharing the code easier. In our case if all plugins are being developed within the main repo they will all have local access to the compiled common library, electron app, and GGG api right inside of the same directory they are doing plugin development in. 

This leads into the next benifit which is versioning. What if as they are making a change to their plugin they want to make a change to the common library to enable a new feature. Since this is a mono repo they can just make the change and submit one PR that contains the new feature in the common repo and the change to their plugin that uses the new feature. When this change is merged the SHA of the squashed commit is effecively both the plugin and library version in one this enables versioning quite easily since old versions of the Electron app that are running an older version of the shared library can still easily access the plugins code as it existed before the change was made while newer versions can access the newer version. This can be accomplished without a monorepo but even in this simple case the monorepo makes it easier. 

What if our change to the common repo wasn't just a new feature but a change to an existing feature that would require plugins to do some sort of migration? Well if we want to make that kind of change in the mono repo all of the published plugins exist inside the project so for the projects build to pass not just the common library must be buildable but all the plugins in the monorepo also need to build. So if we change the name of a function in the common library we must make sure all the plugins recieve the same change or the PR build will fail. In this manner once this PR is passing and is merge we know that at this time all plugins that live in the monorepo already build with whatever change we made. It isn't possible to make a change to the common library that would cause a published plugin to not compile because compiling the published plugins is a part of the build of the common library, and again we know that for the resulting git hash all published plugins were built with the matching version of the library and all hashes before that one were built with the previous version since it's all built together at once it always all matches up. Without using a monorepo this is much harder to accomplish and it is much easier to push changes to a common lib that will break downstream consumers. 

Finally the mono repo helps keep all pugins updated. If we made the breaking change described above and published a new library version plugin developers would need to update their dependancy and publish a new version of their plugin. When they did this we would need to make sure that people running the newest version of the Electron app pull in the newest version of the plugin while people running an older version of the Electron app need to pull in the older version of the plugin. The mono repo simplfies this all by making sure that when something is merge into the mono repo it must build and pass tests with the current version of the common libraries, and when the common libraries are updated that PR must also pass build and tests for all the consumers. In this way everyone stays in sync.

### Electron/React
