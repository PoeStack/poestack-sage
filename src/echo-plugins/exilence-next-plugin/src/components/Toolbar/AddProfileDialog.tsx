import { Dialog } from '@headlessui/react'
import { PlusIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'

export type AddProfileDialogProps = {
  handleAddProfile?: () => void
}

export function AddProfileDialog({ handleAddProfile }: AddProfileDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div>
      <PlusIcon
        onClick={() => {
          setDialogOpen(true)
        }}
        className="w-5 h-5"
      />
      <Dialog
        open={dialogOpen}
        onClose={() => {
          handleAddProfile?.()
          setDialogOpen(false)
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Dialog.Panel className="flex flex-col h-3/5 w-[400px] bg-secondary-surface items-center p-12">
            <Dialog.Title>Add Profile</Dialog.Title>
            <p>test</p>
            <button />
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}
