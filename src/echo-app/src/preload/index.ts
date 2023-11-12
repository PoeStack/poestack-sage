import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import path from 'path'
import os from 'os'

import { Module } from 'module'

let sourceDir = path.resolve(os.homedir(), 'poestack-sage', 'plugins')
if (import.meta.env.PRELOAD_VITE_PLUGIN_PATH) {
  sourceDir = path.resolve('..', '..', import.meta.env.PRELOAD_VITE_PLUGIN_PATH)
}

const replaceResolvePath = (distPath: string) => {
  if (distPath.endsWith('node_modules')) {
    return distPath.replace(sourceDir, path.join(__dirname, '..', '..'))
  }
  return distPath.replace(sourceDir, path.join(__dirname, '..', '..', 'out', 'renderer'))
}
const orgResolvePath = Module['_resolveLookupPaths']
Module['_resolveLookupPaths'] = function (request, parent) {
  if (parent.filename?.startsWith(sourceDir)) {
    // console.log('resolved lookup path', request, parent)
    parent.filename = replaceResolvePath(parent.filename)
    if (parent?.paths) {
      parent.paths = parent.paths.map((p) => replaceResolvePath(p))
    }
    const res = orgResolvePath(request, parent)
    // console.log('resolved lookup path', request, parent, res)
    return res
  } else {
    const res = orgResolvePath(request, parent)
    // console.log('resolved lookup path', request, parent, res)
    return res
  }
}

// Custom APIs for renderer
const api = {}

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
