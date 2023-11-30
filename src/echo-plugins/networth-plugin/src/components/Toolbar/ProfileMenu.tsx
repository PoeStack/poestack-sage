import { useState, useEffect, useMemo } from 'react'
import { useStore } from '../../hooks/useStore'
import { AlertDialog, Button, Command, Popover, Sheet } from 'echo-common/components-v1'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import ProfileForm from './ProfileForm'
import { Profile } from '../../store/domains/profile'
import { League } from '../../store/domains/league'
import { Character } from '../../store/domains/character'
import { StashTab } from '../../store/domains/stashtab'
import { observer } from 'mobx-react'
import { ProfilePayload } from './types'

const ProfileMenu = () => {
  const { accountStore, leagueStore } = useStore()
  const activeAccount = accountStore.activeAccount
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | undefined>()
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState(false)

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
      name: selectedProfile?.name ?? '',
      stashTabs: selectedProfile?.activeStashTabs ?? [],
      league: selectedProfile?.activeLeague ?? leagueStore.leagues[0],
      pricingLeague: selectedProfile?.activePriceLeague ?? leagueStore.leagues[0],
      character: selectedProfile?.activeCharacter ?? null,
      includeEquipment: selectedProfile?.includeEquipment ?? false,
      includeInventory: selectedProfile?.includeInventory ?? false
    }),
    [
      leagueStore.leagues,
      selectedProfile?.activeCharacter,
      selectedProfile?.activeLeague,
      selectedProfile?.activePriceLeague,
      selectedProfile?.activeStashTabs,
      selectedProfile?.includeEquipment,
      selectedProfile?.includeInventory,
      selectedProfile?.name
    ]
  )

  const form = useForm<ProfilePayload>({
    defaultValues: defaultFormValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    form.reset(defaultFormValues)
  }, [defaultFormValues, form])

  const hasProfiles = activeAccount.profiles && activeAccount.profiles?.length > 0

  return (
    <Sheet
      open={profileDialogOpen}
      onOpenChange={(open) => {
        setProfileDialogOpen(open)
        if (!open) {
          form.reset()
          setSelectedProfile(undefined)
        }
      }}
    >
      <AlertDialog
        open={deleteProfileDialogOpen}
        onOpenChange={(open) => {
          setDeleteProfileDialogOpen(open)
          if (!open) {
            setSelectedProfile(undefined)
          }
        }}
      >
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          {hasProfiles ? (
            <Popover.Trigger asChild>
              <Button
                variant="ghost"
                className="flex flex-row border rounded h-8 pl-2 pr-1 min-w-[100px] justify-between"
                role="combobox"
                aria-expanded={menuOpen}
                aria-label="Select profile"
              >
                {activeAccount.activeProfile?.name ?? 'Add Profile'}
                {menuOpen ? (
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="ml-2 h-4 w-4" />
                )}
              </Button>
            </Popover.Trigger>
          ) : (
            <Sheet.Trigger asChild>
              <Button
                variant="ghost"
                className="border rounded h-8"
                role="combobox"
                aria-expanded={menuOpen}
                aria-label="Select profile"
              >
                <PlusCircleIcon className="ml-auto mr-2 h-4 w-4" />
                Add Profile
              </Button>
            </Sheet.Trigger>
          )}
          <Popover.Content>
            <Command>
              {hasProfiles && (
                <>
                  <Command.List>
                    <Command.Group>
                      {activeAccount.profiles.map((profile) => (
                        <Command.Item
                          onSelect={() => {
                            accountStore.activeAccount.setActiveProfile?.(profile)
                            setMenuOpen(false)
                          }}
                          key={profile.uuid}
                        >
                          {profile.name}
                          <Sheet.Trigger asChild>
                            <Button className="ml-auto" size="icon" variant="ghost">
                              <PencilIcon
                                onClick={() => {
                                  setSelectedProfile(profile)
                                  setMenuOpen(false)
                                  setProfileDialogOpen(true)
                                }}
                                className="h-6 w-6 p-1 rounded hover:border-accent-foreground border border-transparent"
                              />
                            </Button>
                          </Sheet.Trigger>
                          <AlertDialog.Trigger className="ml-2 ">
                            <TrashIcon
                              onClick={() => {
                                setSelectedProfile(profile)
                                setDeleteProfileDialogOpen(true)
                              }}
                              className="h-6 w-6 p-1 rounded hover:border-accent-foreground border border-transparent"
                            />
                          </AlertDialog.Trigger>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  </Command.List>
                  <Command.Separator />
                </>
              )}
              <Command.List>
                <Command.Group>
                  <Sheet.Trigger asChild>
                    <Command.Item
                      onSelect={() => {
                        setMenuOpen(false)
                        setProfileDialogOpen(true)
                      }}
                    >
                      <PlusCircleIcon className="mr-2 h-5 w-5" />
                      Add Profile
                    </Command.Item>
                  </Sheet.Trigger>
                </Command.Group>
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover>
        <ProfileForm
          form={form}
          profile={selectedProfile}
          onClose={() => {
            setSelectedProfile(undefined)
            form.reset()
            setProfileDialogOpen(false)
          }}
        />
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>{`Delete Profile: ${selectedProfile?.name}`} </AlertDialog.Title>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel
              onClick={() => {
                setDeleteProfileDialogOpen(false)
              }}
            >
              Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={() => {
                if (selectedProfile) {
                  activeAccount.deleteProfile(selectedProfile.uuid)
                  setSelectedProfile(undefined)
                  setDeleteProfileDialogOpen(false)
                }
              }}
            >
              Continue
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Sheet>
  )
}

export default observer(ProfileMenu)
