'use client'

import { cn } from '@/lib/utils'
import { Notification, useNotificationStore } from '@/store/notificationStore'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { AnimatePresence, motion } from 'framer-motion'
import { ArchiveIcon, BellIcon, CheckIcon, PackageSearchIcon, SettingsIcon } from 'lucide-react'
import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { Icons, Id } from 'react-toastify'
import { useShallow } from 'zustand/react/shallow'
import { ToastData } from '../notifier'
import { TimeTracker } from '../time-tracker'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Switch } from '../ui/switch'
import PulsatingDot from './pulsating-dot'
import SettingsDialogContent from './settings-dialog-content'
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
  const {
    notifications,
    // addNotification: addToast,
    clear,
    markAllAsRead,
    markAsRead,
    remove,
    dismissAll,
    blockDisplay
  } = useNotificationStore(
    useShallow((state) => ({
      notifications: state.notifications,
      // addNotification: state.addNotification,
      clear: state.clear,
      markAllAsRead: state.markAllAsRead,
      markAsRead: state.markAsRead,
      remove: state.remove,
      dismissAll: state.dismissAll,
      blockDisplay: state.blockDisplay
    }))
  )

  const unreadCount = useNotificationStore((state) => {
    return state.notifications.filter((n) => {
      if (state.toastsToDisplay.some((ttd) => ttd === n.id)) return false
      return !n.read
    }).length
  })

  const [showUnreadOnly, setShowUnreadOnly] = useState(true)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  // const addNotificationToStore = useNotificationStore((state) => state.addNotification)

  // const counterRef = useRef(0)

  // const addNotification = () => {
  //   // use a random type of notification
  //   // const toastId = uuidv4()
  //   const toastId = counterRef.current
  //   addToast(`Toast: ${toastId}`, types[Math.floor(Math.random() * types.length)] as TypeOptions, {
  //     toastId: toastId
  //   })
  //   counterRef.current++
  // }

  // useEffect(() => {
  //   setInterval(addNotification, 2000)
  // }, [])

  const handlePopoverOpenChange = (open: boolean) => {
    if (open) {
      // Race conditions - dismiss has priority!
      setTimeout(() => dismissAll(true), 0)
    } else {
      blockDisplay(false)
    }
    setPopoverOpen(open)
  }

  return (
    <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
      <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
        {/* <Button onClick={() => addNotification()}>Add notification</Button> */}
        <PopoverTrigger asChild>
          <Button className={cn('relative select-none')} variant="ghost" size="icon">
            {unreadCount > 0 && (
              <Badge
                className={cn(
                  'rounded-full absolute -right-1 -top-1 h-4 w-4 px-0 items-center justify-center select-none cursor-pointer'
                )}
              >
                {unreadCount > 99 ? 99 : unreadCount}
              </Badge>
            )}
            <BellIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit">
          <div className="flex flex-col gap-y-1.5 text-center sm:text-left">
            <div className="flex flex-row p-2 justify-between items-center">
              <h2 className="text-lg font-semibold leading-none tracking-tight">Notifications</h2>
              <div className="flex flex-row gap-2">
                <div
                  className="flex flex-row gap-2 items-center cursor-pointer"
                  onClick={() => setShowUnreadOnly((prev) => !prev)}
                >
                  <Switch checked={showUnreadOnly} />
                  <Label className="cursor-pointer">Show unread only</Label>
                </div>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </div>
            </div>
            <AnimatePresence>
              <motion.section
                variants={variants.content}
                animate={popoverOpen ? 'open' : 'closed'}
                className="flex flex-col gap-2 h-[400px] w-[300px] lg:w-[400px] overflow-y-auto overflow-x-hidden"
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
                      if (
                        notification.options?.data &&
                        'type' in notification.options.data &&
                        notification.options.data.type === 'offering-buy'
                      ) {
                        return (
                          <ListingNotificationItem
                            key={notification.id}
                            notification={notification}
                            showUnreadOnly={showUnreadOnly}
                            toastData={notification.options.data}
                            markAsRead={markAsRead}
                            remove={remove}
                          />
                        )
                      } else {
                        return (
                          <BasicNotificationItem
                            key={notification.id}
                            notification={notification}
                            showUnreadOnly={showUnreadOnly}
                            markAsRead={markAsRead}
                            remove={remove}
                          />
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
      <DialogContent>
        <SettingsDialogContent onClose={() => setSettingsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

type ListingNotificationItemProps = {
  notification: Notification
  toastData: ToastData
  showUnreadOnly: boolean
  markAsRead: (id: Id | Id[]) => void
  remove: (id: Id | Id[]) => void
}

const ListingNotificationItem = ({
  notification,
  toastData,
  showUnreadOnly,
  markAsRead,
  remove
}: ListingNotificationItemProps) => {
  const openTradeOverviewInNewWindow = useNotificationStore(
    (state) => state.openTradeOverviewInNewWindow
  )

  const actionReadButton = notification.read ? (
    <div className="flex items-center justify-center w-9 h-9">
      <CheckIcon className=" w-4 h-4" />
    </div>
  ) : (
    <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)}>
      <PulsatingDot />
    </Button>
  )

  return (
    <motion.div
      className="flew flex-col space-y-1 border rounded-md p-[0.625rem]"
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
            <div className="w-5 shrink-0">
              {Icons.info({
                theme: 'dark',
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
          {showUnreadOnly ? (
            <div className="flex flex-col gap-1">
              {actionReadButton}
              <Button variant="ghost" size="icon">
                <Link
                  href={`/trade/${notification.id}`}
                  target={openTradeOverviewInNewWindow ? '_blank' : undefined}
                  rel="noreferrer noopener"
                >
                  <PackageSearchIcon className="h-4 w-4 shrink-0" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-row items-center">
              <Button variant="ghost" size="icon">
                <Link
                  href={`/trade/${notification.id}`}
                  target={openTradeOverviewInNewWindow ? '_blank' : undefined}
                  rel="noreferrer noopener"
                >
                  <PackageSearchIcon className="h-4 w-4 shrink-0" />
                </Link>
              </Button>
              <div className="flex flex-col gap-1">
                {actionReadButton}
                <Button variant="ghost" size="icon" onClick={() => remove(notification.id)}>
                  <ArchiveIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.article>
    </motion.div>
  )
}

type BasicNotificationItemProps = {
  notification: Notification
  showUnreadOnly: boolean
  markAsRead: (id: Id | Id[]) => void
  remove: (id: Id | Id[]) => void
}

const BasicNotificationItem = ({
  notification,
  showUnreadOnly,
  markAsRead,
  remove
}: BasicNotificationItemProps) => {
  return (
    <motion.div
      className="flew flex-col space-y-1 border rounded-md p-[0.625rem]"
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
          <div className="flex flex-row items-center justify-start">
            <div className="w-5 shrink-0 mr-[0.625rem]">
              {notification.type === 'info'
                ? Icons.info({
                    theme: 'dark',
                    type: 'info'
                  })
                : notification.type === 'success'
                  ? Icons.success({
                      theme: 'dark',
                      type: 'success'
                    })
                  : notification.type === 'warning'
                    ? Icons.warning({
                        theme: 'dark',
                        type: 'warning'
                      })
                    : notification.type === 'error'
                      ? Icons.error({
                          theme: 'dark',
                          type: 'error'
                        })
                      : Icons.info({
                          theme: 'dark',
                          type: 'default'
                        })}
            </div>
            <div className="flex flex-col gap-1">
              {notification.content as ReactNode}
              <TimeTracker
                className="text-sm text-muted-foreground"
                createdAt={notification.createdAt}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {notification.read ? (
              <div className="flex items-center justify-center w-9 h-9">
                <CheckIcon className=" w-4 h-4" />
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)}>
                <PulsatingDot />
              </Button>
            )}
            {!showUnreadOnly && (
              <Button variant="ghost" size="icon" onClick={() => remove(notification.id)}>
                <ArchiveIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.article>
    </motion.div>
  )
}

export default NotificationCenter
