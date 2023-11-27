import { Menu } from '@headlessui/react'
import { useState } from 'react'
import { IProfile } from '../../interfaces/profile.interface'
import { useStore } from '../../hooks/useStore'
import { Button, Command, Dialog, Popover } from 'echo-common/components-v1'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon
} from 'lucide-react'
import { cn } from 'echo-common'
import { AddProfileForm } from './AddProfileForm'

export function ProfileMenu() {
  const { accountStore } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const profiles = accountStore.activeAccount?.profiles
  const activeProfile = accountStore.activeAccount?.activeProfile
  const setActiveProfile = accountStore.activeAccount?.setActiveProfile
  const hasProfiles = profiles && profiles?.length > 0

  return (
    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
              {activeProfile?.name ?? 'Add Profile'}
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
                    {profiles.map((profile) => (
                      <Command.Item key={profile.name} onSelect={() => setActiveProfile?.(profile)}>
                        {profile.name}
                        <CheckIcon
                          className={cn(
                            'ml-auto h-4 w-4',
                            activeProfile?.uuid === profile.uuid ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <PencilIcon className="ml-auto h-4 w-4" />
                        <TrashIcon className="ml-2 h-4 w-4" />
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
                      setCreateDialogOpen(true)
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
      <AddProfileForm onClose={() => setCreateDialogOpen(false)} />
    </Dialog>
  )
}
