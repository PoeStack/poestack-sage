'use client'

import { useNotificationStore } from '@/store/notificationStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '../ui/button'
import { DialogClose, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  maxActiveToasts: z.coerce.number().min(0),
  openTradeOverviewInNewWindow: z.boolean()
})

type SettingsDialogContentProps = {
  onClose: () => void
}

const SettingsDialogContent = ({ onClose }: SettingsDialogContentProps) => {
  const { t } = useTranslation()
  const {
    maxActiveToasts,
    setMaxActiveToasts,
    openTradeOverviewInNewWindow,
    setOpenTradeOverviewInNewWindow
  } = useNotificationStore(
    useShallow((state) => ({
      maxActiveToasts: state.maxActiveToasts,
      setMaxActiveToasts: state.setMaxActiveToasts,
      openTradeOverviewInNewWindow: state.openTradeOverviewInNewWindow,
      setOpenTradeOverviewInNewWindow: state.setOpenTradeOverviewInNewWindow
    }))
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    reValidateMode: 'onChange',
    mode: 'all',
    delayError: 500, // Do not show error when canceled
    defaultValues: {
      maxActiveToasts,
      openTradeOverviewInNewWindow
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // ✅ This will be type-safe and validated.
    setMaxActiveToasts(values.maxActiveToasts)
    setOpenTradeOverviewInNewWindow(values.openTradeOverviewInNewWindow)
    onClose()
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t('title.notificationSettings')}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <FormField
              control={form.control}
              name="maxActiveToasts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('label.maxNotification')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Default 4" {...field} type="number" min={0} />
                  </FormControl>
                  <FormDescription>{t('body.maxNotification')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="openTradeOverviewInNewWindow"
              render={({ field: { value, onChange, ...props } }) => (
                <FormItem className="">
                  <FormLabel>{t('label.tradeInNewWindow')}</FormLabel>
                  <FormControl>
                    <Switch
                      className="ml-2"
                      checked={value}
                      onCheckedChange={onChange}
                      {...props}
                    />
                  </FormControl>
                  <FormDescription>{t('body.tradeInNewWindow')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter className="fley flex-row justify-end gap-1">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                {form.formState.isDirty ? t('action.discard') : t('action.close')}
              </Button>
            </DialogClose>
            <Button type="submit">{t('action.save')}</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}

export default SettingsDialogContent
