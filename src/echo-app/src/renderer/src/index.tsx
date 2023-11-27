import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { PluginPage } from './pages/plugin-page'
import './assets/app.css'
import { Subscribe } from '@react-rxjs/core'
import { AuthGuard } from './pages/auth-page'
import { PluginPageHeader } from './components/plugin-page-header'
import { PluginPageFooter } from './components/plugin-page-footer'
import { ThemeProvider } from './components/theme-provider'
import i18n from './config/i18n-config'
import { I18nextProvider } from 'react-i18next'

const App = () => {
  return (
    <Suspense>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <div className="h-screen w-screen bg-background text-foreground">
            <PluginPageHeader />
            <AuthGuard>
              <PluginPage />
            </AuthGuard>
            <PluginPageFooter />
          </div>
        </ThemeProvider>
      </I18nextProvider>
    </Suspense>
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

if (import.meta.hot) {
  import.meta.hot.on('locales-update', () => {
    // This alone doesn't trigger the translations hot reload
    i18n.reloadResources().then(() => {
      i18n.changeLanguage(i18n.language)
    })
  })
}
