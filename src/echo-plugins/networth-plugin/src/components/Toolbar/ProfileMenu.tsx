import { useState } from 'react'
import { useStore } from '../../hooks/useStore'
import { AlertDialog, Button, Command, Dialog, Popover } from 'echo-common/components-v1'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon
} from 'lucide-react'
import { cn } from 'echo-common'
import ProfileForm from './ProfileForm'
import { Profile } from '../../store/domains/profile'
import { observer } from 'mobx-react'

const ProfileMenu = () => {
  const { accountStore } = useStore()
  const activeAccount = accountStore.activeAccount
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | undefined>()
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState(false)

  const hasProfiles = activeAccount?.profiles && activeAccount?.profiles?.length > 0

  return (
    <Dialog
      open={profileDialogOpen}
      onOpenChange={(open) => {
        setProfileDialogOpen(open)
        if (!open) {
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
                {activeAccount?.activeProfile?.name ?? 'Add Profile'}
                {menuOpen ? (
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="ml-2 h-4 w-4" />
                )}
              </Button>
            </Popover.Trigger>
          ) : (
            <Dialog.Trigger asChild>
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
            </Dialog.Trigger>
          )}
          <Popover.Content>
            <Command>
              {hasProfiles && (
                <>
                  <Command.List>
                    <Command.Group>
                      {activeAccount?.profiles.map((profile) => (
                        <Command.Item
                          onSelect={() => {
                            accountStore.activeAccount?.setActiveProfile?.(profile)
                            setMenuOpen(false)
                          }}
                          key={profile.uuid}
                        >
                          {profile.name}
                          <Dialog.Trigger asChild>
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
                          </Dialog.Trigger>
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
                  <Dialog.Trigger asChild>
                    <Command.Item
                      onSelect={() => {
                        setMenuOpen(false)
                        setProfileDialogOpen(true)
                      }}
                    >
                      <PlusCircleIcon className="mr-2 h-5 w-5" />
                      Add Profile
                    </Command.Item>
                  </Dialog.Trigger>
                </Command.Group>
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover>
        <ProfileForm
          profile={selectedProfile}
          onClose={() => {
            setSelectedProfile(undefined)
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
                  activeAccount?.deleteProfile(selectedProfile.uuid)
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
    </Dialog>
  )
}

export default observer(ProfileMenu)
