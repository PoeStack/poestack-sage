import { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { bind } from '@react-rxjs/core'
import jwt from 'jsonwebtoken'
import { APP_CONTEXT, GGG_HTTP_UTIL } from '../echo-context-factory'
import { useTranslation } from 'react-i18next'

const [useJwt] = bind(GGG_HTTP_UTIL.tokenSubject$, null)

export function AuthGuard({ children }) {
  const jwt = useJwt()

  if (!jwt) {
    return <LoginPage />
  }

  return <>{children}</>
}

export function LoginPage() {
  const { t } = useTranslation()
  const { dir } = APP_CONTEXT
  const [inputValue, setInputValue] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function handleSet(input: string) {
    const decoded = jwt.decode(input)
    const oAuthCode = decoded?.['oAuthToken']
    if (oAuthCode) {
      dir.writeJson(['auth'], { jwt: input })
      setErrorMessage(null)
      GGG_HTTP_UTIL.tokenSubject$.next(oAuthCode)
    } else {
      setErrorMessage(t('error.description.jwtDecode', { ns: 'notification' }))
    }
  }

  useEffect(() => {
    window.electron.ipcRenderer.on('AUTH_TOKEN_RECEIVED', (_, value) => {
      handleSet(value.TOKEN_RECEIVED)
    })
  }, [])

  useEffect(() => {
    if (dir.existsJson('auth')) {
      const loadedAuth = dir.loadJson('auth')
      handleSet(loadedAuth?.['jwt'])
    }
  }, [])

  return (
    <div
      style={{ WebkitAppRegion: 'drag' } as CSSProperties}
      className="min-h-screen flex items-center justify-center text-primary-text"
    >
      <div
        style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
        className="flex flex-col gap-2"
        draggable={false}
      >
        <h1 className="text-lg font-semibold">{t('title.appName')}</h1>
        <h2 className="text-sm font-semibold">{t('title.syncAuth')}</h2>
        <a
          className="text-center no-underline rounded-lg bg-primary-accent px-1 py-0.5"
          href="https://poestack.com/poe-stack/sage-development"
        >
          {t('action.syncAuth')}
        </a>
        <h2 className="text-sm font-semibold pt-2">{t('title.manualAuth')}</h2>
        <div className="text-sm">
          {t('label.enterToken')}
          <a
            className="text-primary-accent text-sm"
            href="https://poestack.com/poe-stack/development"
          >
            {t('action.getToken')}
          </a>
        </div>
        {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}
        <input
          type="password"
          placeholder={t('label.tokenPlaceholder')}
          className="px-2 py-0.5 bg-input-surface rounded-lg shadow-md border-0 focus:outline-none focus:ring focus:border-primary-accent"
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue}
        />

        <button
          className="bg-primary-accent px-1 py-0.5 rounded-lg"
          onClick={() => handleSet(inputValue)}
        >
          {t('action.login')}
        </button>
      </div>
    </div>
  )
}
