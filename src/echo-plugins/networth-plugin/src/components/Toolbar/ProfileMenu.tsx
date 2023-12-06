import { useState } from 'react'
import { useStore } from '../../hooks/useStore'
import { AlertDialog, Button, Command, Popover, Sheet } from 'echo-common/components-v1'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon
} from 'lucide-react'
import ProfileForm from './ProfileForm'
import { Profile } from '../../store/domains/profile'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'

const ProfileMenu = () => {
  const { t } = useTranslation()
  const { accountStore } = useStore()
  const activeAccount = accountStore.activeAccount
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | undefined>()
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState(false)

  const hasProfiles = activeAccount.profiles && activeAccount.profiles?.length > 0

  return (
    <Sheet
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
                aria-label={t('label.selectProfile')}
              >
                {activeAccount.activeProfile?.name ?? t('label.addProfile')}
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
                aria-label={t('label.selectProfile')}
              >
                <PlusCircleIcon className="ml-auto mr-2 h-4 w-4" />
                {t('label.addProfile')}
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
                      {t('label.addProfile')}
                    </Command.Item>
                  </Sheet.Trigger>
                </Command.Group>
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover>
        <ProfileForm
          profileDialogOpen={profileDialogOpen}
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
              {t('action.cancel')}
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
              {t('action.continue')}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Sheet>
  )
}

export default observer(ProfileMenu)
