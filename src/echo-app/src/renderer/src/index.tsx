import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { PluginPage } from './plugin-page'
import './app.css'
import { Subscribe } from '@react-rxjs/core'
import { AuthGuard } from './auth-page'
import { PluginPageHeader } from './plugin-page-header'
import { PluginPageFooter } from './plugin-page-footer'

const App = () => {
  const themes = ['root']
  const [selectedTheme, setSelectedTheme] = useState(themes[0])

  return (
    <div
      className="h-screen w-screen bg-primary-surface text-primary-text"
      data-theme={selectedTheme}
    >
      <PluginPageHeader />
      <AuthGuard>
        <PluginPage />
      </AuthGuard>
      <PluginPageFooter />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Subscribe>
      <App />
    </Subscribe>
  </React.StrictMode>
)
