# PoeStack - Sage

## Intro: What is this?
This is my work in progress repo for building what is basically PoeStack v2.
I started building PoeStack a year ago and I've learned a lot of things and the v1 has over 100k users.
While the v1 has been really successful and accomplished pretty much everything I set out to solve it has also exposed further issues both in the poe tool space and within the project that the v1 was not designed to tackle.
I've experimented a lot with how these challenges could be overcome in the v1 and my work trying has further cemeted the idea that some high level changes are needed to take the project to its next stage.

## V1 Problems and Solutions for Sage:
Here I'll lay out the problems that the V1 has ran into and the solutions that I plan for Sage to offer going forward.

### - Server Costs
#### Problem:
This is by far the biggest issue with the V1 but it's probably not an issue the way most people would initially imagine.
At the time of writing this the v1 full cost to operate is about $650 per month this is totally fine as the v1 makes about $1k per month ($850 Patreon + $150 ads).
So what's the issue? Well this cost is pretty low for the size of the app with 100k users and about 20k DAU the project needs to stay highly optimized to keep costs this low.
The users are also very active and site is computationally heavy compared to an average site.
These optimizations are fine and they work but they make development complicated and each additional feature needs a lot of thought put into how it will work while conserving resources.
This makes it hard to add new features quickly at this point and in many ways limits the types of features that could be added.

#### Solution:
While the site is computationally heavy on the server this is because there are thousands of people using it most of the time.
The work required for any one user is actually pretty small and thanks to a large redesign of my pricing models I now believe it is possible for this work to happen on a desktop app.
By moving the v2 from a website to a Electron app most of the work could take place on a users computer instead of PoeStacks servers.
This would massively reduce the cost of operating PoeStack and would allow for a much wider array of features with much less concern for tiny CPU/memory/storage operations that only matter with thousands of users calculations need to occur server side.

### - Complexity for Community Developers
#### Problem:
Poe is blessed to have a community of people so ready to contribute their time to community tools. PoeStack was designed and built to be open source with the intention that people who aren't me could easily contribute features that they were passionate about.
Since so much of the v1's code was server side this added a lot of complexity on top of the issues described above made it very hard for for people who don't have access to PoeStack's dev/prod env to run the server and thus be able to develop a full feature slice (server/api/frontend).
While many people have shown interest and many have contributed code to the v1 I believe this limitation has hampered the ability for contributors to truly "own" a section or feature reducing their desire to get deeper into development.

#### Solution:
By moving to a desktop app for most of the features running the code without access to dev/prod will be MUCH easier.
I've already started designing the code in the repo to be runnable from either DBs/GGG-api or from local data files.
I've started setting up exports of the DBs that combined with Docker files should allow the now very small amount of server code needed to be spun up locally.
Finally inspired by Runelite I've started designing the desktop app to be plugin based.
This will allow a core set of plugins (stash-view, tft bulk tools, tft live listings, ect) to be built in this repo but developers and users will be free to develop/run/publish/install plugins without my assistance.
This model has worked great fro Runelite and I really believe it can work even better in our community given how amazing the tool developers here are.

//TODO there are more things to go over soon tm.

