import { useStore } from '../../hooks/useStore'
import { SubmitHandler } from 'react-hook-form'
import {
  profileCharacterRef,
  profileLeagueRef,
  profilePriceLeagueRef,
  profileStashTabRef
} from '../../store/domains/profile'
import { Profile } from '../../store/domains/profile'
import { Button, Checkbox, Form, Input, Select, Dialog } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { StashTab } from '../../store/domains/stashtab'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { League } from '../../store/domains/league'
import { Character } from '../../store/domains/character'
import { useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { StashTabMultiSelect } from './StashTabMultiSelect'

type ProfilePayload = {
  name: string
  stashTabs: StashTab[]
  league?: League
  pricingLeague?: League
  character: Character | null
  includeEquipment?: boolean
  includeInventory?: boolean
}

type ProfileFormProps = {
  onClose?: () => void
  profile?: Profile
  profileDialogOpen: boolean
}

const ProfileForm = ({ profile, onClose, profileDialogOpen }: ProfileFormProps) => {
  const { t } = useTranslation()
  const { accountStore, leagueStore } = useStore()

  const activeAccount = accountStore.activeAccount

  const schema = z.object({
    name: z.string().min(1),
    stashTabs: z.optional(z.array(z.instanceof(StashTab))),
    league: z.instanceof(League),
    pricingLeague: z.instanceof(League),
    character: z.union([z.instanceof(Character), z.null()]),
    includeEquipment: z.optional(z.boolean()),
    includeInventory: z.optional(z.boolean())
  })

  const defaultFormValues = useMemo(
    () => ({
      name: profile?.name ?? '',
      stashTabs: profile?.activeStashTabs ?? [],
      league: profile?.activeLeague ?? leagueStore.leagues[0],
      pricingLeague: profile?.activePriceLeague ?? leagueStore.leagues[0],
      character: profile?.activeCharacter ?? null,
      includeEquipment: profile?.includeEquipment ?? false,
      includeInventory: profile?.includeInventory ?? false
    }),
    [
      leagueStore.leagues,
      profile?.activeCharacter,
      profile?.activeLeague,
      profile?.activePriceLeague,
      profile?.activeStashTabs,
      profile?.includeEquipment,
      profile?.includeInventory,
      profile?.name
    ]
  )

  const form = useForm<ProfilePayload>({
    defaultValues: defaultFormValues,
    reValidateMode: 'onChange',
    mode: 'all',
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    form.reset(defaultFormValues)
  }, [defaultFormValues, form, profileDialogOpen])

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
      onClose?.()
      return
    }
    activeAccount.addProfile(new Profile(payload))
    onClose?.()
  }

  const selectedLeague = form.getValues().league
  const stashTabOptions = useMemo(
    () =>
      (activeAccount.stashTabs ?? [])
        .filter((stash) => !stash.deleted && stash.league === selectedLeague)
        .slice()
        .sort((a, b) => a.index - b.index),
    [activeAccount.stashTabs, selectedLeague]
  )

  return (
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>
          {profile ? t('title.editProfile', { name: profile.name }) : t('title.addProfile')}
        </Dialog.Title>
      </Dialog.Header>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label aria-required>{t('label.profileName')}</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder={t('label.selectProfilePlaceholder')} />
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
                  <Form.Label>{t('label.stashTabs')}</Form.Label>
                  <StashTabMultiSelect
                    selected={form.getValues('stashTabs')}
                    onChange={(stashes) => field.onChange(stashes)}
                    options={stashTabOptions}
                  />
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
                  <Form.Label aria-required>{t('label.league')}</Form.Label>
                  <Select
                    value={field.value?.name}
                    onValueChange={(value) => {
                      const league = leagueStore.leagues
                        .filter((league) => !league.deleted)
                        .find((league) => league.name === value)
                      if (league) {
                        field.onChange(league)
                        form.resetField('stashTabs', { defaultValue: [] })
                        form.resetField('character', { defaultValue: null })
                        form.resetField('includeEquipment', { defaultValue: false })
                        form.resetField('includeInventory', { defaultValue: false })
                      }
                    }}
                  >
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value placeholder={t('label.selectLeaguePlaceholder')} />
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
                  <Form.Label aria-required>{t('label.priceLeague')}</Form.Label>
                  <Select
                    value={field.value?.name}
                    onValueChange={(value) => {
                      const league = leagueStore.priceLeagues
                        .filter((league) => !league.deleted)
                        .find((league) => league.name === value)
                      if (league) {
                        field.onChange(league)
                      }
                    }}
                  >
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value placeholder={t('label.selectPriceLeaguePlaceholder')} />
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
              return (
                <Form.Item>
                  <Form.Label>{t('label.character')}</Form.Label>
                  <Select
                    disabled={!form.getValues().league}
                    value={field.value?.name ?? 'None'}
                    onValueChange={(value) => {
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
                        {t('label.none')}
                      </Select.Item>
                      {activeAccount.characters
                        .filter(
                          (character) =>
                            !character.deleted && character.league === form.getValues().league
                        )
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
          <Dialog.Footer>
            <Button
              onClick={() => {
                onClose?.()
              }}
              variant="outline"
              type="button"
            >
              {t('action.cancel')}
            </Button>
            <Button disabled={!form.formState.isValid} type="submit">
              {profile ? t('action.saveProfile') : t('action.createProfile')}
            </Button>
          </Dialog.Footer>
        </form>
      </Form>
    </Dialog.Content>
  )
}

export default observer(ProfileForm)
