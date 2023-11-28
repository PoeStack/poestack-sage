import { Menu } from '@headlessui/react'
import { useState } from 'react'
import { IProfile } from '../../interfaces/profile.interface'
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
import { ProfileForm } from './ProfileForm'

export function ProfileMenu() {
  const { accountStore } = useStore()
  const activeAccount = accountStore.activeAccount
  const [menuOpen, setMenuOpen] = useState(false)
  const [editProfileId, setEditProfileId] = useState('')
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState(false)

  const hasProfiles = activeAccount?.profiles && activeAccount?.profiles?.length > 0

  return (
    <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
      <AlertDialog open={deleteProfileDialogOpen} onOpenChange={setDeleteProfileDialogOpen}>
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          {hasProfiles ? (
            <Popover.Trigger asChild>
              <Button
                variant="ghost"
                className="border rounded h-8 pl-2 pr-1"
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
                        <Command.Item key={profile.name}>
                          <div
                            onClick={() => {
                              accountStore.activeAccount?.setActiveProfile?.(profile)
                              setMenuOpen(false)
                            }}
                          >
                            {profile.name}
                          </div>
                          <CheckIcon
                            className={cn(
                              'ml-auto h-4 w-4',
                              activeAccount?.activeProfile?.uuid === profile.uuid
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          <Dialog.Trigger asChild>
                            <Button className="ml-auto" size="icon" variant="ghost">
                              <PencilIcon
                                onClick={() => {
                                  setEditProfileId(profile.uuid)
                                  setMenuOpen(false)
                                  setProfileDialogOpen(true)
                                }}
                                className="h-4 w-4"
                              />
                            </Button>
                          </Dialog.Trigger>
                          <AlertDialog.Trigger className="ml-2">
                            <TrashIcon
                              onClick={() => {
                                setEditProfileId(profile.uuid)
                                setDeleteProfileDialogOpen(true)
                              }}
                              className="h-4 w-4"
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
          profileId={editProfileId}
          onClose={() => {
            setEditProfileId('')
            setProfileDialogOpen(false)
          }}
        />
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Delete Profile</AlertDialog.Title>
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
                console.log(editProfileId)
                if (editProfileId) {
                  activeAccount?.deleteProfile(editProfileId)
                  setEditProfileId('')
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
