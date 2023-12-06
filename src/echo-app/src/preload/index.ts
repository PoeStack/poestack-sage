import path from 'path'
import { Module } from 'module'

const echoAppNodeModules: string = path.resolve(__dirname, '..', '..', 'node_modules')
const echoCommonNodeModules: string = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'echo-common',
  'node_modules'
)
console.log('echo-app-node-modules', echoAppNodeModules)
console.log('echo-common-node-modules', echoCommonNodeModules)

const orgResolvePath = Module['_resolveLookupPaths']
Module['_resolveLookupPaths'] = function (request, parent) {
  const orgResults: string[] = []
  try {
    orgResults.push(...orgResolvePath(request, parent))
  } catch (error) {
    /* empty */
  }

  const mappedResults = orgResults
    .map((e) => e.split('node_modules'))
    .filter((e) => e.length == 2)
    .flatMap((e) => [`${echoAppNodeModules}${e[1]}`, `${echoCommonNodeModules}${e[1]}`])

  const results: string[] = []
  results.push(...mappedResults)
  results.push(...orgResults)
  results.push(...[echoAppNodeModules, echoCommonNodeModules])

  //console.log("req", request, parent, results)
  return results
}

import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import * as libsqlClient from '@libsql/client'
import * as drizzleMigrator from 'drizzle-orm/libsql/migrator'

// Custom APIs for renderer
const api = {
  '@libsql/client': libsqlClient,
  'drizzle-orm/libsql/migrator': drizzleMigrator
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
