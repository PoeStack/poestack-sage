import { Resource, createInstance, i18n } from 'i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { Config } from 'next-i18n-router/dist/types'
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
dayjs.extend(updateLocale)

export const i18nConfig: Config = {
  locales: ['en', 'de', 'fr', 'ja', 'ko', 'pt', 'ru', 'zh', 'es'],
  defaultLocale: 'en'
}

export const namespaces = ['common', 'notification']
export const defaultNS = 'common'

export default async function initTranslations(
  locale: string,
  i18nInstance?: i18n,
  resources?: Resource
) {
  i18nInstance = i18nInstance || createInstance()

  i18nInstance.use(initReactI18next)

  if (!resources) {
    i18nInstance.use(
      resourcesToBackend(
        (language: string, namespace: string) => import(`@/locales/${language}/${namespace}.json`)
      )
    )
  }

  await i18nInstance.init({
    lng: locale,
    resources,
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    defaultNS: defaultNS,
    fallbackNS: defaultNS,
    ns: namespaces,
    preload: resources ? [] : i18nConfig.locales
  })

  const t = i18nInstance.t

  dayjs.updateLocale('en', {
    relativeTime: {
      future: t('relativeTime.future'),
      past: t('relativeTime.past'),
      s: t('relativeTime.s'),
      m: t('relativeTime.m'),
      mm: t('relativeTime.mm'),
      h: t('relativeTime.h'),
      hh: t('relativeTime.hh'),
      d: t('relativeTime.d'),
      dd: t('relativeTime.dd'),
      M: t('relativeTime.M'),
      MM: t('relativeTime.MM'),
      y: t('relativeTime.y'),
      yy: t('relativeTime.yy')
    }
  })

  return {
    i18n: i18nInstance,
    resources: i18nInstance.services.resourceStore.data,
    t
  }
}
