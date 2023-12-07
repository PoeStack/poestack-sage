import { useCallback } from 'react'
import { useEffect, useState } from 'react'
import { bind } from '@react-rxjs/core'
import jwt from 'jsonwebtoken'
import { APP_CONTEXT, GGG_HTTP_UTIL } from '../echo-context-factory'
import { useTranslation } from 'react-i18next'
import { Button, Input, buttonVariants } from 'echo-common/components-v1'

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

  const handleSet = useCallback(
    (input: string) => {
      const decoded = jwt.decode(input)
      const oAuthCode = decoded?.['oAuthToken']
      if (oAuthCode) {
        dir.writeJson(['auth'], { jwt: input })
        setErrorMessage(null)
        GGG_HTTP_UTIL.tokenSubject$.next(oAuthCode)
      } else {
        setErrorMessage(t('error.description.jwtDecode', { ns: 'notification' }))
      }
    },
    [dir, t]
  )

  useEffect(() => {
    window.electron.ipcRenderer.on('AUTH_TOKEN_RECEIVED', (_, value) => {
      handleSet(value.TOKEN_RECEIVED)
    })
  }, [handleSet])

  useEffect(() => {
    if (dir.existsJson('auth')) {
      const loadedAuth = dir.loadJson('auth')
      handleSet(loadedAuth?.['jwt'])
    }
  }, [dir, handleSet])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col gap-2" draggable={false}>
        <h1 className="text-lg font-semibold">{t('title.appName')}</h1>
        <h2 className="text-sm font-semibold">{t('title.syncAuth')}</h2>
        <a className={buttonVariants()} href="https://poestack.com/poe-stack/sage-development">
          {t('action.syncAuth')}
        </a>
        <h2 className="text-sm font-semibold pt-2">{t('title.manualAuth')}</h2>
        <div className="text-sm">
          {t('label.enterToken')}
          <Button variant="link" asChild>
            <a href="https://poestack.com/poe-stack/development">{t('action.getToken')}</a>
          </Button>
        </div>
        {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}
        <Input
          type="password"
          placeholder={t('label.tokenPlaceholder')}
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue}
        />

        <Button onClick={() => handleSet(inputValue)}>{t('action.login')}</Button>
      </div>
    </div>
  )
}
