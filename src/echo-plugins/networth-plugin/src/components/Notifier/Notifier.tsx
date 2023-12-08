import { observer } from 'mobx-react'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from 'echo-common/components-v1'
import { useStore } from '../../hooks/useStore'

const Notifier = () => {
  const { notificationStore } = useStore()
  const { toast } = useToast()
  const { t } = useTranslation()

  const storeDisplayed = useCallback(
    (uuid: string) => {
      notificationStore!.addDisplayed(uuid)
    },
    [notificationStore]
  )

  const alerts = notificationStore!.alertNotifications

  useMemo(() => {
    alerts.forEach((n) => {
      if (notificationStore!.displayed.find((d) => d === n.uuid) !== undefined) return

      toast({
        title: t(
          n.title as unknown as any,
          n.translateParam ? { param: n.translateParam } : undefined
        ),
        description: t(n.description as unknown as any),
        variant: n.type === 'error' ? 'destructive' : undefined
      })
      storeDisplayed(n.uuid)
    })
  }, [alerts, notificationStore, storeDisplayed, t, toast])

  return null
}

export default observer(Notifier)
