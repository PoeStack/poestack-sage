import { bind } from '@react-rxjs/core'
import { APP_CONTEXT } from '../echo-context-factory'
import { Button, Checkbox, Table } from 'echo-common/components-v1'
import { useTranslation } from 'react-i18next'

export const PoeStackSettingsPage = () => {
  const { t } = useTranslation()

  return (
    <div className="p-4 w-full h-full overflow-y-scroll">
      <div className="flex flex-row">
        <h1 className="font-semibold text-accent-foreground">{t('title.poeStackSettings')}</h1>
      </div>

      <div className="basis-1/4"></div>
    </div>
  )
}
