import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { PluginPage } from './pages/plugin-page'
import './assets/app.css'
import { Subscribe } from '@react-rxjs/core'
import { AuthGuard } from './pages/auth-page'
import { PluginPageHeader } from './components/plugin-page-header'
import { PluginPageFooter } from './components/plugin-page-footer'
import { ThemeProvider } from './components/theme-provider'

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="h-screen w-screen bg-background text-foreground">
        <PluginPageHeader />
        <AuthGuard>
          <PluginPage />
        </AuthGuard>
        <PluginPageFooter />
      </div>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Subscribe>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </Subscribe>
  </React.StrictMode>
)
