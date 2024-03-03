import { useNotificationStore } from '@/store/notificationStore'
import { useShallow } from 'zustand/react/shallow'

export const useToast = () => {
  const { addNotification: toast } = useNotificationStore(
    useShallow((state) => ({
      addNotification: state.addNotification
    }))
  )

  return toast
}
