'use client'

import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { AnimatePresence, motion } from 'framer-motion'
import { ArchiveIcon, BellIcon, CheckIcon, PackageSearchIcon } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { Icons, TypeOptions, toast } from 'react-toastify'
import { useNotificationCenter } from 'react-toastify/addons/use-notification-center'
import { ToastData } from '../notifier'
import { TimeTracker } from '../time-tracker'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Switch } from '../ui/switch'
import PulsatingDot from './pulsating-dot'
dayjs.extend(relativeTime)

const types = ['success', 'info', 'warning', 'error']

const variants = {
  // used to stagger item animation when switching from closed to open and vice versa
  content: {
    open: {
      transition: { staggerChildren: 0.07, delayChildren: 0.2 }
    },
    closed: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
    }
  },
  item: {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 }
      }
    },
    closed: {
      y: 50,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 }
      }
    }
  }
}

type NotificationCenterProps = {}

const NotificationCenter = () => {
  const { notifications, clear, markAllAsRead, markAsRead, unreadCount, remove } =
    useNotificationCenter()
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [open, setOpen] = useState(false)

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
        setOpen(open)
      }}
    >
      {/* <Button onClick={(e) => addNotification()}>Add notification</Button> */}
      <PopoverTrigger asChild>
        <Button
          className={cn('relative select-none')}
          variant="ghost"
          size="icon"
          onClick={() => {
            notifications.forEach((n) => toast.dismiss(n.id))
          }}
        >
          <Badge
            className={cn(
              'rounded-full absolute -right-1 -top-1 h-4 w-4 px-0 items-center justify-center select-none cursor-pointer'
            )}
          >
            {unreadCount}
          </Badge>
          <BellIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit">
        <div className="flex flex-col gap-y-1.5 text-center sm:text-left">
          <div className="flex flex-row p-2 justify-between items-center">
            <h2 className="text-lg font-semibold leading-none tracking-tight">Notifications</h2>
            <div
              className="flex flex-row gap-2 items-center cursor-pointer"
              onClick={() => setShowUnreadOnly((prev) => !prev)}
            >
              <Switch checked={showUnreadOnly} />
              <Label className="cursor-pointer">Show unread only</Label>
            </div>
          </div>
          <AnimatePresence>
            <motion.section
              variants={variants.content}
              animate={open ? 'open' : 'closed'}
              className="flex flex-col gap-2 h-[400px] w-[300px] lg:w-[400px] overflow-y-auto"
            >
              {(!notifications.length || (unreadCount === 0 && showUnreadOnly)) && (
                <h4>
                  Your queue is empty! you are all set{' '}
                  <span role="img" aria-label="dunno what to put">
                    🎉
                  </span>
                </h4>
              )}
              <AnimatePresence>
                {(showUnreadOnly ? notifications.filter((v) => !v.read) : notifications).map(
                  (notification) => {
                    if (typeof notification.content === 'string') {
                      return (
                        <Alert key={notification.id}>
                          <AlertTitle>Heads up!</AlertTitle>
                          <AlertDescription>{notification.content || ''}</AlertDescription>
                        </Alert>
                      )
                    } else if (
                      notification.data &&
                      'type' in notification.data &&
                      notification.data.type === 'offering-buy'
                    ) {
                      const toastData = notification.data as ToastData
                      return (
                        <motion.div
                          className="flew flex-col space-y-1 border rounded-md px-4 py-3"
                          key={notification.id}
                          layout
                          initial={{ scale: 0.4, opacity: 0, y: 50 }}
                          exit={{
                            scale: 0,
                            opacity: 0,
                            transition: { duration: 0.2 }
                          }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                        >
                          <motion.article variants={variants.item}>
                            <div className="flex flex-row items-center justify-between gap-2">
                              <div className="flex flex-row items-center justify-start gap-3">
                                <div className="w-8">
                                  {(notification.icon as ReactNode) ||
                                    Icons.info({
                                      theme: notification.theme || 'dark',
                                      type: 'info'
                                    })}
                                </div>
                                <div className="flex flex-col gap-1">
                                  {toastData.toastBody}
                                  <TimeTracker
                                    className="text-sm text-muted-foreground"
                                    createdAt={dayjs.utc(toastData.created)}
                                  />
                                </div>
                              </div>
                              <div className="flex flex-row items-center">
                                <Button variant="ghost" size="icon">
                                  <PackageSearchIcon className="h-4 w-4 shrink-0" />
                                </Button>
                                <div className="flex flex-col gap-2">
                                  {notification.read ? (
                                    <div className="flex items-center justify-center w-9 h-9">
                                      <CheckIcon className=" w-4 h-4" />
                                    </div>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      <PulsatingDot />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(notification.id)}
                                  >
                                    <ArchiveIcon className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.article>
                        </motion.div>
                      )
                    }
                  }
                )}
              </AnimatePresence>
            </motion.section>
          </AnimatePresence>
          <div className="flex flex-row p-2 justify-between items-center">
            <Button onClick={clear}>Clear All</Button>
            <Button onClick={markAllAsRead}>Mark all as read</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationCenter
