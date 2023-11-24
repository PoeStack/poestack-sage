import { Dialog } from '@headlessui/react'
import { ExclamationCircleIcon, PlusIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { useStore } from '../../hooks/useStore'
import { useForm, SubmitHandler } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import { ProfileEntry } from '../../store/domains/profile'

type AddProfilePayload = {
  name: string
  // stashTabs: []
}

export function AddProfileDialog() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<AddProfilePayload>({
    mode: 'onChange'
  })
  const store = useStore()
  const addProfile = store.accountStore.activeAccount?.addProfile
  const stashTabs = store.accountStore.activeAccount?.activeLeagueStashTabs
  const league = store.accountStore.activeAccount?.activeLeague
  const priceLeague = store.accountStore.activeAccount?.activePriceLeague
  const onSubmit: SubmitHandler<AddProfilePayload> = (data) => {
    const newProfile = ProfileEntry.create({
      uuid: uuidv4(),
      name: data.name,
      activeLeague: league?.uuid as string,
      activePriceLeague: priceLeague?.uuid as string,
      activeStashTabs: stashTabs?.map((st) => st.id)
    })
    addProfile?.(newProfile)
    setDialogOpen(false)
  }
  console.log(errors)

  return (
    <div className="flex items-center justify-center">
      <button
        className="h-full"
        onClick={() => {
          setDialogOpen(true)
        }}
      >
        <PlusIcon className="w-5 h-5" />
      </button>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="z-51 fixed inset-0 flex w-screen items-center justify-center">
          <Dialog.Panel className="rounded flex flex-col h-4/5 w-[500px] bg-secondary-surface items-center py-4 gap-4">
            <Dialog.Title className="text-white font-bold p-6">Add Profile</Dialog.Title>
            <form className=" w-[400px]" onSubmit={handleSubmit(onSubmit)}>
              <div className="block flex flex-col gap-5">
                <div className="block flex flex-row gap-3 justify-start">
                  <label className="text-primary-text">Profile Name</label>
                  <input
                    className="peer text-primary-text rounded bg-input-surface pl-2"
                    {...register('name', { required: true })}
                  />
                  {errors.name && (
                    <ExclamationCircleIcon fill="red" className="w-5 h-5 peer-invalid:visible" />
                  )}
                </div>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded mb-1"
                  disabled={!isValid}
                  type="submit"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}
