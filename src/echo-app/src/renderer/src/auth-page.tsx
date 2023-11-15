import React, { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { bind } from '@react-rxjs/core'
import jwt from 'jsonwebtoken'
import { GGG_API_UTIL } from 'ggg-api'
import { ECHO_DIR } from 'echo-common'

const [useJwt] = bind(GGG_API_UTIL.tokenSubject$, null)

export function AuthGuard({ children }) {
  const jwt = useJwt()

  if (!jwt) {
    return <LoginPage />
  }

  return <>{children}</>
}

export function LoginPage() {
  const [inputValue, setInputValue] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function handleSet(input: string) {
    const decoded = jwt.decode(input)
    const oAuthCode = decoded?.['oAuthToken']
    if (oAuthCode) {
      ECHO_DIR.writeJson(['auth'], { jwt: input })
      setErrorMessage(null)
      GGG_API_UTIL.tokenSubject$.next(oAuthCode)
    } else {
      setErrorMessage('Failed to decode jwt.')
    }
  }

  useEffect(() => {
    window.electron.ipcRenderer.on('AUTH_TOKEN_RECEIVED', (_, value) => {
      handleSet(value.TOKEN_RECEIVED)
    })
  }, [])

  useEffect(() => {
    if (ECHO_DIR.existsJson('auth')) {
      const loadedAuth = ECHO_DIR.loadJson('auth')
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
        <h1 className="text-lg font-semibold">PoeStack - Sage</h1>
        <h2 className="text-sm font-semibold">Sync auth with PoEStack</h2>
        <a
          className="text-center no-underline rounded-lg bg-primary-accent px-1 py-0.5"
          href="https://poestack.com/poe-stack/sage-development"
        >
          Sync Auth
        </a>
        <h2 className="text-sm font-semibold pt-2">Manual auth with PoEStack</h2>
        <div className="text-sm">
          Enter your PoeStack token.{' '}
          <a
            className="text-primary-accent text-sm"
            href="https://poestack.com/poe-stack/development"
          >
            Get Token
          </a>
        </div>
        {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}
        <input
          type="password"
          placeholder="Token"
          className="px-2 py-0.5 bg-input-surface rounded-lg shadow-md border-0 focus:outline-none focus:ring focus:border-primary-accent"
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue}
        />
        <button
          className="bg-primary-accent px-1 py-0.5 rounded-lg"
          onClick={() => handleSet(inputValue)}
        >
          Login
        </button>
      </div>
    </div>
  )
}
