import { Module } from 'module'

const localModulesPath = path.resolve(__dirname, '..', '..', 'node_modules')
const orgResolvePath = Module['_resolveLookupPaths']
Module['_resolveLookupPaths'] = function (request, parent) {
  const res = [
    localModulesPath,
    '/Applications/echo-app.app/Contents/Resources/app.asar/node_modules',
    '/Applications/echo-app.app/Contents/Resources/node_modules'
  ]
  console.log('resolved lookup path', request, parent, res)
  return res
}

import React from 'react'
import { PluginPage } from './plugin-page'
import './app.css'
import { Subscribe } from '@react-rxjs/core'
import { AuthGuard } from './auth-page'
import { POE_LOG_SERVICE } from 'echo-common'
import { createRoot } from 'react-dom/client'
import * as path from 'path'
import fs from 'fs'

POE_LOG_SERVICE.logRaw$.subscribe((e) => console.log('GGG LOG', e))

const App: React.FC = () => {
  return (
    <>
      <Subscribe>
        <AuthGuard>
          <PluginPage />
        </AuthGuard>
      </Subscribe>
    </>
  )
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
