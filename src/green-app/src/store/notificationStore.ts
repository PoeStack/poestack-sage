import { ToastData } from '@/components/notifier'
import dayjs from 'dayjs'
import { produce } from 'immer'
import { ReactNode } from 'react'
import { Id, ToastOptions as ToastifyToastOptions, TypeOptions, toast } from 'react-toastify'
import { v4 as uuidV4 } from 'uuid'
import { create } from 'zustand'

type ToastOptions = Omit<ToastifyToastOptions, 'type' | 'data'> & {
  data?: {} | ToastData
}

type AddNotificationOptions = ToastOptions & {
  display?: boolean
  read?: boolean
  createdAt?: number
}

export type Notification = {
  id: Id
  content: ReactNode
  type: TypeOptions
  options?: ToastOptions
  read: boolean
  createdAt: number
}

type State = {
  notifications: Notification[]
  activeToasts: Id[]
  toastsToDisplay: Id[]
  displayBlocked: boolean
  maxActiveToasts: number
}

type Actions = {
  addNotification: (content: ReactNode, type: TypeOptions, options?: AddNotificationOptions) => Id
  composedonOpen: <T = {}>(id: Id, props: T, notification: Notification) => void
  composedonClose: <T = {}>(id: Id, props: T, notification: Notification) => void
  handleToastOpen: (id: Id) => void
  handleToastClose: (id: Id) => void
  clear: () => void
  markAllAsRead: () => void
  markAsRead: (id: Id | Id[]) => void
  remove: (id: Id | Id[]) => void
  dismissAll: (blockDisplay?: boolean) => void
  blockDisplay: (blockDisplay: boolean) => void
}

type NotificationState = State & Actions

const initialState: State = {
  notifications: [],
  activeToasts: [],
  toastsToDisplay: [],
  displayBlocked: false,
  maxActiveToasts: 4
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  ...initialState,
  addNotification: (content, type, notificationOptions) => {
    const { toastId, onOpen, onClose, display, read, createdAt, ...options } =
      notificationOptions || {}

    const id = toastId ?? uuidV4()
    set((state) => {
      let toastsToDisplay = state.toastsToDisplay
      const notification: Notification = {
        id: id,
        type: type,
        content: content,
        options: notificationOptions,
        read: read ?? false,
        createdAt: createdAt ?? dayjs.utc().valueOf()
      }
      if ((display ?? true) && !state.displayBlocked) {
        if (state.activeToasts.length < state.maxActiveToasts) {
          // Fill active toasts
          toast(content, {
            type: type,
            toastId: id,
            onOpen: (props) => get().composedonOpen(id, props, notification),
            onClose: (props) => get().composedonClose(id, props, notification),
            ...options
          })
        } else {
          // Fill queue
          toastsToDisplay = [...toastsToDisplay, id]
        }
      }
      return { notifications: [...state.notifications, notification], toastsToDisplay }
    })
    return id
  },
  composedonOpen: (id, props, notification) => {
    get().handleToastOpen(id)
    notification?.options?.onOpen?.(props)
  },
  composedonClose: (id, props, notification) => {
    get().handleToastClose(id)
    notification?.options?.onClose?.(props)
  },
  handleToastOpen: (id) =>
    set((state) => {
      if (state.activeToasts.includes(id)) {
        return {}
      }
      return { activeToasts: [...state.activeToasts, id] }
    }),
  handleToastClose: (id) =>
    set((state) => {
      const activeToasts = [...state.activeToasts]
      let toastsToDisplay = state.toastsToDisplay
      const idx = activeToasts.indexOf(id)
      if (idx !== -1) {
        activeToasts.splice(idx, 1)
      }
      if (activeToasts.length < state.maxActiveToasts && toastsToDisplay.length > 0) {
        // Show next toasts
        toastsToDisplay = toastsToDisplay.slice()
        const nextId = toastsToDisplay.shift()
        const nextN = state.notifications.find((n) => n.id === nextId)
        if (nextN) {
          if (!activeToasts.includes(nextN.id)) {
            // Ensure toasts are not shown in between event and this set function
            activeToasts.push(nextN.id)
          }
          const { toastId, onOpen, onClose, ...options } = nextN.options || {}
          toast(nextN.content, {
            type: nextN.type,
            toastId: nextN.id,
            onOpen: (props) => get().composedonOpen(nextN.id, props, nextN),
            onClose: (props) => get().composedonClose(nextN.id, props, nextN),
            ...options
          })
        }
      }
      return { activeToasts, toastsToDisplay }
    }),
  dismissAll: (blockDisplay) => {
    set(
      produce((state: NotificationState) => {
        state.toastsToDisplay = []
        state.activeToasts.forEach((id) => toast.dismiss(id))
        if (blockDisplay !== undefined) {
          state.displayBlocked = blockDisplay
          console.log('dismissAll: Set blockDisplay: ', blockDisplay)
        }
      })
    )
  },
  blockDisplay: (blockDisplay) =>
    set(
      produce((state: NotificationState) => {
        state.displayBlocked = blockDisplay
        console.log('blockDisplay: Set blockDisplay: ', blockDisplay)
      })
    ),
  clear: () =>
    set(
      produce((state: NotificationState) => {
        state.notifications = []
      })
    ),
  markAllAsRead: () =>
    set(
      produce((state: NotificationState) => {
        state.notifications.forEach((n) => (n.read = true))
      })
    ),
  markAsRead: (ids) =>
    set(
      produce((state: NotificationState) => {
        if (Array.isArray(ids)) {
          ids.forEach((id) => {
            const n = state.notifications.find((n) => n.id === id)
            if (n) n.read = true
          })
        } else {
          const n = state.notifications.find((n) => n.id === ids)
          if (n) n.read = true
        }
      })
    ),
  remove: (ids) =>
    set(
      produce((state: NotificationState) => {
        if (Array.isArray(ids)) {
          ids.forEach((id) => {
            const idx = state.notifications.findIndex((n) => n.id === id)
            if (idx > -1) state.notifications.splice(idx, 1)
          })
        } else {
          const idx = state.notifications.findIndex((n) => n.id === ids)
          if (idx > -1) state.notifications.splice(idx, 1)
        }
      })
    )
}))
