import { useStore } from '../../hooks/useStore'
import { SubmitHandler, UseFormReturn } from 'react-hook-form'
import {
  profileCharacterRef,
  profileLeagueRef,
  profilePriceLeagueRef,
  profileStashTabRef
} from '../../store/domains/profile'
import { Profile } from '../../store/domains/profile'
import { Button, Checkbox, Form, Input, Label, Select, Sheet } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { StashTab } from '../../store/domains/stashtab'
import { ProfilePayload } from './types'

type ProfileFormProps = {
  onClose?: () => void
  profile?: Profile
  form: UseFormReturn<ProfilePayload>
}

const ProfileForm = ({ profile, onClose, form }: ProfileFormProps) => {
  const { accountStore, leagueStore } = useStore()

  const activeAccount = accountStore.activeAccount

  const stashTabs = activeAccount.stashTabs ?? []

  const onSubmit: SubmitHandler<ProfilePayload> = (data) => {
    if (!activeAccount) return
    if (!data.league || !data.pricingLeague) return
    const payload = {
      name: data.name,
      activeLeagueRef: profileLeagueRef(data.league),
      activePriceLeagueRef: profilePriceLeagueRef(data.pricingLeague),
      activeStashTabsRef: data.stashTabs.map((tab) => profileStashTabRef(tab)),
      activeCharacterRef: data.character ? profileCharacterRef(data.character) : undefined,
      includeEquipment: data.includeEquipment ?? false,
      includeInventory: data.includeInventory ?? false
    }
    if (profile) {
      profile.updateProfile(payload)
      form.reset()
      onClose?.()
      return
    }
    activeAccount.addProfile(new Profile(payload))
    form.reset()
    onClose?.()
  }

  const handleCheckChange = (
    value: boolean,
    stashTab: StashTab,
    onChange: (values: StashTab[]) => void
  ) => {
    const values = form.getValues('stashTabs')
    if (value) {
      onChange([...values, stashTab])
    } else {
      const idIndex = values.indexOf(stashTab)
      values.splice(idIndex, 1)
      onChange(values)
    }
  }

  return (
    <Sheet.Content className="mt-7 overflow-y-scroll w-3/5 sm:max-w-full">
      <Sheet.Header>
        <Sheet.Title>{profile ? `Edit Profile: ${profile.name}` : 'Add Profile'}</Sheet.Title>
      </Sheet.Header>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Profile Name *</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder="Name your profile" />
                </Form.Control>
                <Form.Message className="text-destructive" />
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
                              handleCheckChange(!!value, stash, field.onChange)
                            }}
                            name={`stash-${stash.id}`}
                            checked={form.getValues('stashTabs')?.includes(stash)}
                          />
                        </div>
                      ))}
                    </div>
                  </Form.Control>
                </Form.Item>
              )
            }}
          />
          <div className="flex flex-grow flex-row gap-2 justify-center">
            <Form.Field
              control={form.control}
              name="league"
              render={({ field }) => (
                <Form.Item className="grow">
                  <Form.Label>League *</Form.Label>
                  <Select
                    value={field.value?.name}
                    onValueChange={(value) => {
                      const league = leagueStore.leagues.find((league) => league.name === value)
                      if (league) {
                        field.onChange(league)
                        form.resetField('character')
                        form.resetField('includeEquipment', { defaultValue: false })
                        form.resetField('includeInventory', { defaultValue: false })
                      }
                    }}
                  >
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value placeholder="Select a league" />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {leagueStore.leagues.map((league) => {
                        return (
                          <Select.Item key={league.hash} value={league.name}>
                            {league.name}
                          </Select.Item>
                        )
                      })}
                    </Select.Content>
                  </Select>
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="pricingLeague"
              render={({ field }) => (
                <Form.Item className="grow">
                  <Form.Label>Pricing League *</Form.Label>
                  <Select
                    value={field.value?.name}
                    onValueChange={(value) => {
                      const league = leagueStore.priceLeagues.find(
                        (league) => league.name === value
                      )
                      if (league) {
                        field.onChange(league)
                      }
                    }}
                  >
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value placeholder="Select a pricing league" />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {leagueStore.priceLeagues.map((league) => {
                        return (
                          <Select.Item key={league.hash} value={league.name}>
                            {league.name}
                          </Select.Item>
                        )
                      })}
                    </Select.Content>
                  </Select>
                </Form.Item>
              )}
            />
          </div>
          <Form.Field
            control={form.control}
            name="character"
            render={({ field }) => {
              console.log(form.getValues().character)
              console.log(field.value)
              return (
                <Form.Item>
                  <Form.Label>Character</Form.Label>
                  <Select
                    disabled={!form.getValues().league}
                    value={field.value?.name ?? 'None'}
                    onValueChange={(value) => {
                      console.log(value)
                      if (value === 'None') {
                        field.onChange(null)
                        form.resetField('includeEquipment', { defaultValue: false })
                        form.resetField('includeInventory', { defaultValue: false })
                      } else {
                        const character = activeAccount.characters.find(
                          (character) => character.name === value
                        )
                        if (character) {
                          field.onChange(character)
                        }
                      }
                    }}
                  >
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value defaultValue={'None'} />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      <Select.Item key={'character-none'} value={'None'}>
                        None
                      </Select.Item>
                      {activeAccount.characters
                        .filter((character) => character.league === form.getValues().league)
                        .map((character) => {
                          return (
                            <Select.Item key={character.id} value={character.name}>
                              {character.name}
                            </Select.Item>
                          )
                        })}
                    </Select.Content>
                  </Select>
                </Form.Item>
              )
            }}
          />
          {form.getValues().character && (
            <div className="flex flex-row gap-8 justify-center">
              <Form.Field
                control={form.control}
                name="includeEquipment"
                render={({ field: { value, onChange } }) => {
                  return (
                    <Form.Item className="space-y-0 flex flex-row justify-center items-center gap-2">
                      <Form.Label>Include Equpiment</Form.Label>
                      <Form.Control>
                        <Checkbox
                          disabled={!form.getValues().character}
                          checked={value}
                          onCheckedChange={onChange}
                        />
                      </Form.Control>
                    </Form.Item>
                  )
                }}
              />
              <Form.Field
                disabled={!form.getValues().character}
                control={form.control}
                name="includeInventory"
                render={({ field: { value, onChange } }) => {
                  return (
                    <Form.Item className="space-y-0 flex flex-row justify-center items-center gap-2">
                      <Form.Label>Include Inventory</Form.Label>
                      <Form.Control>
                        <Checkbox
                          disabled={!form.getValues().character}
                          checked={value}
                          onCheckedChange={onChange}
                        />
                      </Form.Control>
                    </Form.Item>
                  )
                }}
              />
            </div>
          )}

          <Button disabled={!form.formState.isValid} type="submit">
            {profile ? 'Save Profile' : 'Create Profile'}
          </Button>
        </form>
      </Form>
    </Sheet.Content>
  )
}

export default observer(ProfileForm)
