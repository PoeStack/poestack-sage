## Overview
This package holds a few untilites to make it easier to test POE related code. Currently the main utility is a small server the mimics GGG's API by servering saved data from [here](https://github.com/PoeStack/poestack-sage/tree/main/poe-test-env/poe-api-data/). For example [here](https://github.com/PoeStack/poestack-sage/blob/main/poe-test-env/poe-api-data/stash/Ancestor/stashes.json) is a request I saved that contains all my stash data. The API is modeled after GGG's api documented [here](https://www.pathofexile.com/developer/docs/reference).

## Setup
Install libs: `npm install`
Start the server: `npm run start-api`
Test the server: Navigate to http://localhost:3000/stash/Ancestor/stashes


## Commands
`npm run start-api` - Starts the test api server
