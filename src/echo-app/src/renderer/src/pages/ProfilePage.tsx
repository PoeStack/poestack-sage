import { useTranslation } from 'react-i18next'
import { APP_CONTEXT, GGG_HTTP_UTIL } from '../echo-context-factory'
import { Button } from 'echo-common/components-v1'

export function ProfilePage() {
  const { t } = useTranslation()
  const { value: profile } = APP_CONTEXT.poeAccounts.useProfile()

  return (
    <>
      <div className="w-full h-full overflow-y-scroll flex flex-row">
        <div className="basis-1/4"></div>
        <div className="flex flex-col">
          <div>{t('title.welcomeUser', { 0: profile?.name })}</div>
          <Button
            onClick={() => {
              APP_CONTEXT.dir.deleteJson('auth')
              GGG_HTTP_UTIL.tokenSubject$.next(undefined)
            }}
          >
            {t('action.logout')}
          </Button>
        </div>
        <div className="basis-1/4"></div>
      </div>
    </>
  )
}
