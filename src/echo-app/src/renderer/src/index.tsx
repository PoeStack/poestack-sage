import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { MainPage } from './pages/MainPage'
import './assets/app.css'
import { Subscribe } from '@react-rxjs/core'
import { AuthGuard } from './pages/AuthPage'
import { AppHeader } from './components/AppHeader'
import { AppFooter } from './components/AppFooter'
import { ThemeProvider } from './components/ThemeProvider'
import i18n from './config/i18n-config'
import { I18nextProvider } from 'react-i18next'

const App = () => {
  return (
    <Suspense>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <div className="h-screen w-screen max-w-full bg-background text-foreground">
            <AppHeader />
            <AuthGuard>
              <MainPage />
            </AuthGuard>
            <AppFooter />
          </div>
        </ThemeProvider>
      </I18nextProvider>
    </Suspense>
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
