'use client'

import { BellIcon, CheckIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { useNotificationCenter } from 'react-toastify/addons/use-notification-center'
import { Badge } from '../ui/badge'
import { ReactNode, useState } from 'react'
import { TypeOptions, toast, collapseToast } from 'react-toastify'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { useSetAtom } from 'jotai'
import { toastPositionAtom } from '../providers'

const types = ['success', 'info', 'warning', 'error']

type NotificationCenterProps = {}

const NotificationCenter = () => {
  const { notifications, clear, markAllAsRead, markAsRead, unreadCount } = useNotificationCenter()
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [open, setOpen] = useState(false)

  const setToastPosition = useSetAtom(toastPositionAtom)

  const addNotification = () => {
    // use a random type of notification
    toast('Lorem ipsum dolor sit amet, consectetur adipiscing elit', {
      type: types[Math.floor(Math.random() * types.length)] as TypeOptions
    })
  }

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setToastPosition(open ? 'bottom-right' : 'top-right')
        setOpen(open)
      }}
    >
      <Button onClick={(e) => addNotification()}>Add notification</Button>
      <PopoverTrigger asChild>
        <Button
          className="relative select-none"
          variant="ghost"
          size="icon"
          onClick={() => {
            notifications.forEach((n) => toast.dismiss(n.id))
          }}
        >
          <Badge className="rounded-full absolute right-0 top-0 h-4 w-4 px-0 items-center justify-center select-none cursor-pointer">
            {unreadCount}
          </Badge>
          <BellIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit">
        <div className="flex flex-col gap-y-1.5 text-center sm:text-left">
          <div className="flex flex-row p-2 justify-between items-center">
            <h2 className="text-lg font-semibold leading-none tracking-tight">Notifications</h2>
            <div className="flex flex-row gap-2 items-center">
              <Switch
                onCheckedChange={() => setShowUnreadOnly(!showUnreadOnly)}
                checked={showUnreadOnly}
              />
              <Label>Show unread only</Label>
            </div>
          </div>
          <div className="flex flex-col gap-2 h-[400px] w-[300px] lg:w-[400px] overflow-y-auto">
            {(!notifications.length || (unreadCount === 0 && showUnreadOnly)) && (
              <h4>
                Your queue is empty! you are all set{' '}
                <span role="img" aria-label="dunno what to put">
                  🎉
                </span>
              </h4>
            )}
            {(showUnreadOnly ? notifications.filter((v) => !v.read) : notifications).map(
              (notification) => {
                if (typeof notification.content === 'string') {
                  return (
                    <Alert key={notification.id}>
                      <AlertTitle>Heads up!</AlertTitle>
                      <AlertDescription>{notification.content || ''}</AlertDescription>
                    </Alert>
                  )
                } else {
                  return <div key={notification.id}>{notification.content as ReactNode}</div>
                }

                // <Alert
                //   key={notification.id}
                //   severity={(notification.type as AlertColor) || 'info'}
                //   action={
                //     notification.read ? (
                //       <CheckIcon />
                //     ) : (
                //       <IconButton
                //         color="primary"
                //         aria-label="upload picture"
                //         component="span"
                //         onClick={() => markAsRead(notification.id)}
                //       >
                //         <MarkChatReadIcon />
                //       </IconButton>
                //     )
                //   }
                // >
                //   {notification.content}
                // </Alert>
              }
            )}
          </div>
          <div className="flex flex-row p-2 justify-between items-center">
            <Button onClick={clear}>Clear All</Button>
            <Button onClick={markAllAsRead}>Mark all as read</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const Notification = () => {}

export default NotificationCenter
