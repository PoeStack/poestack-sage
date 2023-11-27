import { ExclamationCircleIcon, PlusIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { useStore } from '../../hooks/useStore'
import { useForm, SubmitHandler } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import {
  Profile,
  profileLeagueRef,
  profilePriceLeagueRef,
  profileStashTabRef
} from '../../store/domains/profile'
import { Button, Dialog, Form, Input, Label } from 'echo-common/components-v1'

type AddProfilePayload = {
  name: string
  // stashTabs: []
}

type AddProfileFormProps = {
  onClose?: () => void
}

export function AddProfileForm({ onClose }: AddProfileFormProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const form = useForm<AddProfilePayload>({
    mode: 'onChange'
  })
  const { accountStore } = useStore()

  const onSubmit: SubmitHandler<AddProfilePayload> = (data) => {
    if (!accountStore.activeAccount) return
    const { addProfile, stashTabs, activeLeague, activePriceLeague } = accountStore.activeAccount
    if (!activeLeague || !activePriceLeague) return
    const newProfile = new Profile({
      uuid: uuidv4(),
      name: data.name,
      activeLeagueRef: profileLeagueRef(activeLeague),
      activePriceLeagueRef: profilePriceLeagueRef(activePriceLeague),
      activeStashTabsRef: stashTabs.map((st) => profileStashTabRef(st))
    })
    addProfile?.(newProfile)
    onClose?.()
  }

  return (
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Add Profile</Dialog.Title>
      </Dialog.Header>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Profile Name</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Button disabled={!form.formState.isValid} type="submit">
            Create Profile
          </Button>
        </form>
      </Form>
    </Dialog.Content>
  )
}
