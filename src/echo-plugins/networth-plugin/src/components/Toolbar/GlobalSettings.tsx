import { useState, useMemo, useEffect } from 'react'
import { useStore } from '../../hooks/useStore'
import { Button, Checkbox, Form, Input, Separator, Sheet } from 'echo-common/components-v1'
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
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false)

  const schema = z.object({
    autoSnapshotting: z.boolean(),
    autoSnapshotInterval: z.number().min(300000).max(86400000),
    lowConfidencePricing: z.boolean(),
    priceThreshold: z.number().min(0),
    totalPriceThreshold: z.number().min(0)
  })

  const defaultFormValues = useMemo(
    () => ({
      autoSnapshotting: settingStore.autoSnapshotting ?? false,
      autoSnapshotInterval: settingStore.autoSnapshotInterval ?? 20,
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
      autoSnapshotInterval: data.autoSnapshotInterval,
      autoSnapshotting: data.autoSnapshotting,
      lowConfidencePricing: data.lowConfidencePricing,
      priceThreshold: data.priceThreshold,
      totalPriceThreshold: data.totalPriceThreshold
    })
  }

  const form = useForm<SettingsPayload>({
    defaultValues: defaultFormValues,
    reValidateMode: 'onChange',
    resolver: zodResolver(schema)
  })

  const { handleSubmit } = form

  useEffect(() => {
    form.reset(defaultFormValues)
  }, [defaultFormValues, form, settingsSheetOpen])

  return (
    <Sheet
      open={settingsSheetOpen}
      onOpenChange={(open) => {
        setSettingsSheetOpen(open)
      }}
    >
      <Sheet.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </Sheet.Trigger>
      <Sheet.Content className="mt-7 overflow-y-scroll w-3/5 sm:max-w-full">
        <Sheet.Header>
          <Sheet.Title>{t('title.settings')}</Sheet.Title>
        </Sheet.Header>
        <Form {...form}>
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
                        handleSubmit(onSubmit)
                      }}
                    />
                  </Form.Control>
                </Form.Item>
              )
            }}
          />
          <div className="flex py-2 flex-row gap-8 justify-center">
            <Form.Field
              disabled={!form.getValues().autoSnapshotting}
              control={form.control}
              name="autoSnapshotInterval"
              render={({ field: { onChange, value } }) => {
                return (
                  <Form.Item className="flex flex-row items-center gap-2">
                    <Form.Label>{t('label.autoSnapshotInterval')}</Form.Label>
                    <Form.Control>
                      <Input
                        disabled={!form.getValues().autoSnapshotting}
                        onBlur={handleSubmit(onSubmit)}
                        onChange={(e) => {
                          if (e.target.value) {
                            onChange(parseInt(e.target.value) * 60000)
                          } else {
                            onChange(e.target.value)
                          }
                        }}
                        value={value ? value / 60000 : value}
                        type="number"
                      />
                    </Form.Control>
                  </Form.Item>
                )
              }}
            />
          </div>
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
                        handleSubmit(onSubmit)
                      }}
                    />
                  </Form.Control>
                </Form.Item>
              )
            }}
          />
          <div className="flex py-2 flex-row gap-8 justify-center">
            <Form.Field
              control={form.control}
              name="priceThreshold"
              render={({ field: { onChange, value } }) => {
                return (
                  <Form.Item className="flex flex-row items-center gap-2">
                    <Form.Label>{t('label.priceThreshold')}</Form.Label>
                    <Form.Control>
                      <Input
                        onBlur={handleSubmit(onSubmit)}
                        onChange={(e) => {
                          if (e.target.value) {
                            onChange(parseInt(e.target.value))
                          } else {
                            onChange(e.target.value)
                          }
                        }}
                        value={value}
                        type="number"
                      />
                    </Form.Control>
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="totalPriceThreshold"
              render={({ field: { onChange, value } }) => {
                return (
                  <Form.Item className="flex flex-row items-center gap-2">
                    <Form.Label>{t('label.totalPriceThreshold')}</Form.Label>
                    <Form.Control>
                      <Input
                        onBlur={handleSubmit(onSubmit)}
                        onChange={(e) => {
                          if (e.target.value) {
                            onChange(parseInt(e.target.value))
                          } else {
                            onChange(e.target.value)
                          }
                        }}
                        value={value}
                        type="number"
                      />
                    </Form.Control>
                  </Form.Item>
                )
              }}
            />
          </div>
        </Form>
      </Sheet.Content>
    </Sheet>
  )
}

export default observer(GlobalSettings)
