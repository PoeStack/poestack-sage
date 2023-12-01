import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import backend from 'i18next-fs-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

export const defaultNS = 'common'

i18next
  .use(backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath:
        process.env.NODE_ENV !== 'production'
          ? './resources/locales/{{lng}}/{{ns}}.json'
          : './src/renderer/src/locales/{{lng}}/{{ns}}.json'
    },
    debug: true,
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en'],
    ns: [defaultNS, 'notification'],
    defaultNS,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: true
    }
  })

export default i18next
