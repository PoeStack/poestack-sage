import { useState, useMemo, useEffect } from 'react'
import { useStore } from '../../hooks/useStore'
import { Button, Checkbox, Form, Input, Separator, Dialog } from 'echo-common/components-v1'
import { SettingsIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'

type SettingsPayload = {
  autoSnapshotting: boolean
  autoSnapshotInterval: number
  lowConfidencePricing: boolean
  priceThreshold: number
  totalPriceThreshold: number
}

const GlobalSettings = () => {
  const { t } = useTranslation()
  const { settingStore } = useStore()
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

  const schema = z.object({
    autoSnapshotting: z.boolean(),
    autoSnapshotInterval: z.optional(
      z.coerce
        .number()
        .min(5)
        .max(24 * 60)
    ),
    lowConfidencePricing: z.boolean(),
    priceThreshold: z.coerce.number().min(0),
    totalPriceThreshold: z.coerce.number().min(0)
  })

  const defaultFormValues = useMemo(
    () => ({
      autoSnapshotting: settingStore.autoSnapshotting ?? false,
      autoSnapshotInterval: settingStore.autoSnapshotInterval
        ? settingStore.autoSnapshotInterval / (60 * 1000)
        : 20,
      lowConfidencePricing: settingStore.lowConfidencePricing ?? false,
      priceThreshold: settingStore.priceThreshold ?? 0,
      totalPriceThreshold: settingStore.totalPriceThreshold ?? 0
    }),
    [
      settingStore.autoSnapshotInterval,
      settingStore.autoSnapshotting,
      settingStore.lowConfidencePricing,
      settingStore.priceThreshold,
      settingStore.totalPriceThreshold
    ]
  )

  const onSubmit = (data: SettingsPayload) => {
    settingStore.updateSettings({
      autoSnapshotInterval: data.autoSnapshotInterval * 60 * 1000,
      autoSnapshotting: data.autoSnapshotting,
      lowConfidencePricing: data.lowConfidencePricing,
      priceThreshold: data.priceThreshold,
      totalPriceThreshold: data.totalPriceThreshold
    })
    setSettingsDialogOpen(false)
  }

  const form = useForm<SettingsPayload>({
    defaultValues: defaultFormValues,
    reValidateMode: 'onChange',
    mode: 'all',
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    form.reset(defaultFormValues)
  }, [defaultFormValues, form, settingsDialogOpen])

  return (
    <Dialog
      open={settingsDialogOpen}
      onOpenChange={(open) => {
        setSettingsDialogOpen(open)
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{t('title.settings')}</Dialog.Title>
        </Dialog.Header>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <h3 className="text-md font-medium py-2">{t('title.snapshotSettings')}</h3>
            <Form.Field
              control={form.control}
              name="autoSnapshotting"
              render={({ field: { value, onChange } }) => {
                return (
                  <Form.Item className="space-y-0 flex flex-row items-center gap-2">
                    <Form.Label>{t('label.autoSnapshot')}</Form.Label>
                    <Form.Control>
                      <Checkbox
                        checked={value}
                        onCheckedChange={(checked) => {
                          onChange(checked)
                        }}
                      />
                    </Form.Control>
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              disabled={!form.getValues().autoSnapshotting}
              control={form.control}
              name="autoSnapshotInterval"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t('label.autoSnapshotInterval')}</Form.Label>
                    <Form.Control>
                      <Input type="number" {...field} />
                    </Form.Control>
                    <Form.Message className="text-destructive" />
                  </Form.Item>
                )
              }}
            />
            <Separator className="my-4" />
            <h3 className="text-md font-medium pb-2">{t('title.priceSettings')}</h3>
            <Form.Field
              control={form.control}
              name="lowConfidencePricing"
              render={({ field: { value, onChange } }) => {
                return (
                  <Form.Item className="space-y-0 flex flex-row items-center gap-2">
                    <Form.Label>{t('label.lowConfidencePricing')}</Form.Label>
                    <Form.Control>
                      <Checkbox
                        checked={value}
                        onCheckedChange={(checked) => {
                          onChange(checked)
                        }}
                      />
                    </Form.Control>
                    <Form.Message className="text-destructive" />
                  </Form.Item>
                )
              }}
            />
            <div className="flex py-2 flex-row gap-8 justify-center">
              <Form.Field
                control={form.control}
                name="priceThreshold"
                render={({ field }) => {
                  return (
                    <Form.Item className="flex flex-row items-center gap-2">
                      <Form.Label>{t('label.priceThreshold')}</Form.Label>
                      <Form.Control>
                        <Input type="number" {...field} />
                      </Form.Control>
                    </Form.Item>
                  )
                }}
              />
              <Form.Field
                control={form.control}
                name="totalPriceThreshold"
                render={({ field }) => {
                  return (
                    <Form.Item className="flex flex-row items-center gap-2">
                      <Form.Label>{t('label.totalPriceThreshold')}</Form.Label>
                      <Form.Control>
                        <Input type="number" {...field} />
                      </Form.Control>
                      <Form.Message className="text-destructive" />
                    </Form.Item>
                  )
                }}
              />
            </div>
            <Dialog.Footer>
              <Button
                onClick={() => {
                  setSettingsDialogOpen(false)
                }}
                variant="outline"
                type="button"
              >
                {t('action.cancel')}
              </Button>
              <Button disabled={!form.formState.isValid} type="submit">
                {t('action.save')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  )
}

export default observer(GlobalSettings)
