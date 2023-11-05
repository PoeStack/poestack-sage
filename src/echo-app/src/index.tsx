import { Module } from 'module'

const localModulesPath = path.resolve(__dirname, '..', 'node_modules')
//const orgResolvePath = Module['_resolveLookupPaths']
// @ts-ignore
Module['_resolveLookupPaths'] = function (request, parent) {
  const res = [
    localModulesPath,
    '/Applications/echo-app.app/Contents/Resources/app.asar/node_modules',
    '/Applications/echo-app.app/Contents/Resources/node_modules'
  ]
  return res
}

import React from 'react'
import { PluginPage } from './plugin-page'
import './app.css'
import { Subscribe } from '@react-rxjs/core'
import { AuthGuard } from './auth-page'
// import { POE_LOG_SERVICE } from 'echo-common'
import { createRoot } from 'react-dom/client'
import * as path from 'path'

// POE_LOG_SERVICE.logRaw$.subscribe((e) => console.log('GGG LOG', e))

const App: React.FC = () => {
  return (
    <div className="min-h-full h-full bg-primary-surface">
      <Subscribe>
        <AuthGuard>
          <PluginPage />
        </AuthGuard>
      </Subscribe>
    </div>
  )
}

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(<App />)
