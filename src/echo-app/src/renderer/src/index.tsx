import React, { Suspense, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { PluginPage } from './pages/plugin-page'
import './assets/app.css'
import { Subscribe } from '@react-rxjs/core'
import { AuthGuard } from './pages/auth-page'
import { PluginPageHeader } from './components/plugin-page-header'
import { PluginPageFooter } from './components/plugin-page-footer'
import i18n from './config/i18n-config'
import { I18nextProvider } from 'react-i18next'

const App = () => {
  const themes = ['root']
  const [selectedTheme] = useState(themes[0])

  return (
    <div
      className="h-screen w-screen bg-primary-surface text-primary-text"
      data-theme={selectedTheme}
    >
      <Suspense>
        <I18nextProvider i18n={i18n}>
          <PluginPageHeader />
          <AuthGuard>
            <PluginPage />
          </AuthGuard>
        </I18nextProvider>
        <PluginPageFooter />
      </Suspense>
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

if (import.meta.hot) {
  import.meta.hot.on('locales-update', () => {
    // This alone doesn't trigger the translations hot reload
    i18n.reloadResources().then(() => {
      i18n.changeLanguage(i18n.language)
    })
  })
}
