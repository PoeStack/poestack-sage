import { useStore } from '../../hooks/useStore'
import { useForm, SubmitHandler } from 'react-hook-form'
import {
  Profile,
  profileLeagueRef,
  profilePriceLeagueRef,
  profileStashTabRef
} from '../../store/domains/profile'
import { Button, Checkbox, Dialog, Form, Input, Label, Select } from 'echo-common/components-v1'
import { League } from '../../store/domains/league'
import { Character } from '../../store/domains/character'

type ProfilePayload = {
  name: string
  stashTabs: string[]
  league?: League
  pricingLeague?: League
  character?: Character
  includeEquipment: boolean
  includeInventory: boolean
}

type ProfileFormProps = {
  onClose?: () => void
  profile?: Profile
}

export function ProfileForm({ profile, onClose }: ProfileFormProps) {
  const { accountStore, leagueStore } = useStore()
  const activeAccount = accountStore.activeAccount
  console.log(profile?.activeLeague?.name)
  const form = useForm<ProfilePayload>({
    values: {
      name: profile?.name ?? '',
      stashTabs: profile?.activeStashTabs.map((tab) => tab.id) ?? [],
      league: profile?.activeLeague,
      pricingLeague: profile?.activePriceLeague,
      character: profile?.activeCharacter,
      includeEquipment: profile?.includeEquipment ?? false,
      includeInventory: profile?.includeInventory ?? false
    }
  })

  const stashTabs = activeAccount?.stashTabs ?? []

  const onSubmit: SubmitHandler<ProfilePayload> = (data) => {
    if (!activeAccount) return
    if (profile) {
      profile.updateProfile({ name: data.name, activeStashTabIds: data.stashTabs })
      onClose?.()
      return
    }
    if (!activeAccount?.activeLeague || !activeAccount?.activePriceLeague) return
    const newProfile = new Profile({
      name: data.name,
      activeLeagueRef: profileLeagueRef(activeAccount?.activeLeague),
      activePriceLeagueRef: profilePriceLeagueRef(activeAccount?.activePriceLeague),
      activeStashTabsRef: data.stashTabs.map((stashTab) => {
        console.log('stash', stashTab)
        return profileStashTabRef(stashTab)
      })
    })
    activeAccount?.addProfile(newProfile)
    form.reset()
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
        <Dialog.Title>{profile ? `Edit Profile: ${profile.name}` : 'Add Profile'}</Dialog.Title>
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
                  <Input {...field} placeholder="Name your profile" />
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
          <Form.Field
            control={form.control}
            name="league"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>League</Form.Label>
                <Select
                  value={field.value?.name}
                  onValueChange={(value) => {
                    const league = leagueStore.leagues.find((league) => league.name === value)
                    if (league) {
                      field.onChange(league)
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
              <Form.Item>
                <Form.Label>Pricing League</Form.Label>
                <Select
                  value={field.value?.name}
                  onValueChange={(value) => {
                    const league = leagueStore.priceLeagues.find((league) => league.name === value)
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
          <Button disabled={!form.formState.isValid} type="submit">
            {profile ? 'Save Profile' : 'Create Profile'}
          </Button>
        </form>
      </Form>
    </Dialog.Content>
  )
}
