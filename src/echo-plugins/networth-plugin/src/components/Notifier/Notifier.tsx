import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from 'echo-common/components-v1'
import { useStore } from '../../hooks/useStore'

const Notifier = () => {
  const { notificationStore } = useStore()
  const { toast } = useToast()
  const { t } = useTranslation()

  const storeDisplayed = (uuid: string) => {
    notificationStore!.addDisplayed(uuid)
  }

  const alerts = notificationStore!.alertNotifications

  useMemo(() => {
    alerts.forEach((n) => {
      if (notificationStore!.displayed.find((d) => d === n.uuid) !== undefined) return

      toast({
        title: t(
          n.title as unknown as any,
          n.translateParam ? { param: n.translateParam } : undefined
        ),
        description: t(n.description as unknown as any)
      })
      //   toast(
      // () => (
      //   <Toast
      //     message={t(n.title, n.translateParam ? { param: n.translateParam } : undefined)}
      //     description={t(n.description)}
      //   />
      // ),
      // { type: n.type, className: classes.default }
      //   )
      storeDisplayed(n.uuid)
    })
  }, [alerts])

  return null
}

export default observer(Notifier)
