import { useState, useMemo, useEffect } from 'react'
import { useStore } from '../../hooks/useStore'
import { Button, Checkbox, Form, Input, Sheet } from 'echo-common/components-v1'
import { SettingsIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { observer } from 'mobx-react'

type SettingsPayload = {
  autoSnapshotting: boolean
  autoSnapshotInterval: number
  lowConfidencePricing: boolean
  priceThreshold: number
  totalPriceThreshold: number
}

const GlobalSettings = () => {
  const { settingStore } = useStore()
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false)

  const schema = z.object({
    autoSnapshotting: z.boolean(),
    autoSnapshotInterval: z.number().min(300000).max(86400000),
    lowConfidencePricing: z.boolean(),
    priceThreshold: z.number(),
    totalPriceThreshold: z.number()
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
          <Sheet.Title>Settings</Sheet.Title>
        </Sheet.Header>
        <Form {...form}>
          <h3 className="text-md font-medium py-2">Snapshot settings</h3>
          <div className="flex flex-row gap-8 justify-center">
            <Form.Field
              control={form.control}
              name="autoSnapshotting"
              render={({ field: { value, onChange } }) => {
                return (
                  <Form.Item className="flex flex-row items-center gap-2">
                    <Form.Label>Auto Snapshotting</Form.Label>
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
            <Form.Field
              disabled={!form.getValues().autoSnapshotting}
              control={form.control}
              name="autoSnapshotInterval"
              render={({ field: { onChange, value } }) => {
                return (
                  <Form.Item className="flex flex-row items-center gap-2">
                    <Form.Label>Auto Snapshot Interval (Minutes)</Form.Label>
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
          <h3 className="text-md font-medium py-2">Pricing settings</h3>
          <div className="flex flex-row gap-8 justify-center">
            <Form.Field
              control={form.control}
              name="lowConfidencePricing"
              render={({ field: { value, onChange } }) => {
                return (
                  <Form.Item className="flex flex-row items-center gap-2">
                    <Form.Label>Low confidence pricing</Form.Label>
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
            <Form.Field
              disabled={!form.getValues().lowConfidencePricing}
              control={form.control}
              name="priceThreshold"
              render={({ field: { onChange, value } }) => {
                return (
                  <Form.Item className="flex flex-row items-center gap-2">
                    <Form.Label>Price threshold</Form.Label>
                    <Form.Control>
                      <Input
                        disabled={!form.getValues().lowConfidencePricing}
                        onBlur={handleSubmit(onSubmit)}
                        onChange={(e) => {
                          if (e.target.value) {
                            onChange(parseInt(e.target.value))
                          } else {
                            onChange(e.target.value)
                          }
                        }}
                        value={value ? `${value} c` : value}
                        type="number"
                      />
                    </Form.Control>
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              disabled={!form.getValues().lowConfidencePricing}
              control={form.control}
              name="totalPriceThreshold"
              render={({ field: { onChange, value } }) => {
                return (
                  <Form.Item className="flex flex-row items-center gap-2">
                    <Form.Label>Total price threshold</Form.Label>
                    <Form.Control>
                      <Input
                        disabled={!form.getValues().lowConfidencePricing}
                        onBlur={handleSubmit(onSubmit)}
                        onChange={(e) => {
                          if (e.target.value) {
                            onChange(parseInt(e.target.value))
                          } else {
                            onChange(e.target.value)
                          }
                        }}
                        value={value ? `${value} c` : value}
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
