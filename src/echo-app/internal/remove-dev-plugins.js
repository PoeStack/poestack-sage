'use strict'
const fs = require('fs')
const path = require('path')

fs.writeFileSync(
  path.resolve('src', 'renderer', 'src', 'dev-plugins.ts'),
  `/**
  * **************************************************************
  * **********************AUTOGENERATED FILE**********************
  * **************************************************************
  * 
  * This plugins are used in dev mode - via 'npm run dev'
  * All of these plugins have HMR enabled, regardless of whether you only have the plugins folder open
  */
export const DEV_PLUGINS = [

]`
)