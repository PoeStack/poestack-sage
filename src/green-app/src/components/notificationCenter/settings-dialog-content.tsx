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

const formSchema = z.object({
  maxActiveToasts: z.coerce.number().min(0),
  openTradeOverviewInNewWindow: z.boolean()
})

type SettingsDialogContentProps = {
  onClose: () => void
}

const SettingsDialogContent = ({ onClose }: SettingsDialogContentProps) => {
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
            <DialogTitle>Notification Settings</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <FormField
              control={form.control}
              name="maxActiveToasts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum displayed notifications:</FormLabel>
                  <FormControl>
                    <Input placeholder="Default 4" {...field} type="number" min={0} />
                  </FormControl>
                  <FormDescription>
                    Notifications are queued to appear when the maximum number is reached.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="openTradeOverviewInNewWindow"
              render={({ field: { value, onChange, ...props } }) => (
                <FormItem className="">
                  <FormLabel>Open trade requests in new window:</FormLabel>
                  <FormControl>
                    <Switch
                      className="ml-2"
                      checked={value}
                      onCheckedChange={onChange}
                      {...props}
                    />
                  </FormControl>
                  <FormDescription>
                    Trade requests notifications appear when someone clicks “Copy Whisper” for one
                    of your offers.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter className="fley flex-row justify-end gap-1">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                {form.formState.isDirty ? 'Discard' : 'Close'}
              </Button>
            </DialogClose>
            {/* <DialogClose asChild> */}
            <Button type="submit">Save</Button>
            {/* </DialogClose> */}
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}

export default SettingsDialogContent
