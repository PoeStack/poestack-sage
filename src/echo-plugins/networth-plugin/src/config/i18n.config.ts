import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import ChainedBackend from 'i18next-chained-backend'
import resourcesToBackend from 'i18next-resources-to-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import path from 'path'
import fs from 'fs'

export const defaultNS = 'common'

const newInstance = i18next.createInstance()
newInstance
  .use(ChainedBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      backends: [
        resourcesToBackend((lng: string, ns: string) => {
          // This works in prod and dev but its cached and does not work good with HMR. We need to use fs for this
          let data = import(`../locales/${lng}/${ns}.json`)

          // All vite backends pointing to the base directory of echo-app. We have to read it manually via fs
          if (import.meta.hot) {
            const configPath = new URL('.', import.meta.url).pathname.replace('/@fs/', '')
            const localesPath = path.join('/', configPath, '..', 'locales', lng, `${ns}.json`)
            data = JSON.parse(fs.readFileSync(localesPath, 'utf-8'))
          }
          return data
        })
      ]
    },
    debug: true,
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en'],
    ns: [defaultNS, 'notification', 'status'],
    defaultNS,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: true
    }
  })

i18next.on('languageChanged', (language) => {
  // When the mainapp changes the lang, then change the lang here too
  newInstance.changeLanguage(language)
})

if (import.meta.hot) {
  import.meta.hot.on('locales-update', () => {
    // This alone doesn't trigger the translations hot reload
    newInstance.reloadResources().then(() => {
      newInstance.changeLanguage(newInstance.language)
    })
  })
}

export default newInstance
