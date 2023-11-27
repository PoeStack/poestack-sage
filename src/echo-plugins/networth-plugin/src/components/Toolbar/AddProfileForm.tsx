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
import { Button, Checkbox, Dialog, Form, Input, Label } from 'echo-common/components-v1'
import { StashTab } from '../../store/domains/stashtab'

type AddProfilePayload = {
  name: string
  stashTabs: string[]
}

type AddProfileFormProps = {
  onClose?: () => void
}

export function AddProfileForm({ onClose }: AddProfileFormProps) {
  const form = useForm<AddProfilePayload>({
    values: {
      name: '',
      stashTabs: []
    }
  })
  const { accountStore } = useStore()
  const stashTabs = accountStore.activeAccount?.activeLeagueStashTabs ?? []

  const onSubmit: SubmitHandler<AddProfilePayload> = (data) => {
    if (!accountStore.activeAccount) return
    const { addProfile, stashTabs, activeLeague, activePriceLeague } = accountStore.activeAccount
    if (!activeLeague || !activePriceLeague) return
    const newProfile = new Profile({
      uuid: uuidv4(),
      name: data.name,
      activeLeagueRef: profileLeagueRef(activeLeague),
      activePriceLeagueRef: profilePriceLeagueRef(activePriceLeague),
      activeStashTabsRef: data.stashTabs.map((stashTab) => {
        console.log('stash', stashTab)
        return profileStashTabRef(stashTab)
      })
    })
    addProfile?.(newProfile)
    onClose?.()
  }

  const handleCheckChange = (value: boolean, id: string, onChange: (values: string[]) => void) => {
    const values = form.getValues('stashTabs')
    if (value) {
      onChange([...values, id])
    } else {
      const idIndex = values.indexOf(id)
      values.splice(idIndex, 1)
      onChange(values)
    }
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
          <Form.Field
            control={form.control}
            name="stashTabs"
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label>Stash Tabs</Form.Label>
                  <Form.Control>
                    <div className="p-2 border overflow-y-scroll h-20 w-full flex flex-row flex-wrap gap-2">
                      {stashTabs.map((stash) => (
                        <div
                          key={stash.id}
                          className="rounded-full h-7 border p-2 flex-row flex items-center justify-center gap-2"
                        >
                          <Label htmlFor={`stash-${stash.id}`}>{stash.name}</Label>
                          <Checkbox
                            onCheckedChange={(value) => {
                              handleCheckChange(!!value, stash.id, field.onChange)
                            }}
                            name={`stash-${stash.id}`}
                            checked={form.getValues('stashTabs')?.includes(stash.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </Form.Control>
                </Form.Item>
              )
            }}
          />
          <Button disabled={!form.formState.isValid} type="submit">
            Create Profile
          </Button>
        </form>
      </Form>
    </Dialog.Content>
  )
}
