import { useState } from 'react'
import { useStore } from '../../hooks/useStore'
import { AlertDialog, Button, Command, Popover, Sheet } from 'echo-common/components-v1'
import {
  Check,
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
import { cn } from 'echo-common'

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
                className="flex flex-row border rounded h-8 pl-3 pr-2 w-[250px] justify-between"
                role="combobox"
                aria-expanded={menuOpen}
                aria-label={t('label.selectProfile')}
              >
                <span className="truncate">
                  {activeAccount.activeProfile?.name ?? t('label.addProfile')}
                </span>
                {menuOpen ? (
                  <ChevronDownIcon className="flex-shrink-0 ml-2 h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="flex-shrink-0 ml-2 h-4 w-4" />
                )}
              </Button>
            </Popover.Trigger>
          ) : (
            <Sheet.Trigger asChild>
              <Button
                variant="ghost"
                className="flex flex-row border rounded h-8 pl-2 pr-1 w-[250px] justify-between"
                role="combobox"
                aria-expanded={menuOpen}
                aria-label={t('label.selectProfile')}
              >
                <PlusCircleIcon className="flex-shrink-0 ml-auto mr-2 h-4 w-4" />
                <span className="truncate">{t('label.addProfile')}</span>
              </Button>
            </Sheet.Trigger>
          )}
          <Popover.Content className="w-[250px] p-0">
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
                          <Check
                            className={cn(
                              'h-4 w-4 mr-2 flex-shrink-0',
                              activeAccount.activeProfile?.uuid === profile.uuid
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {profile.name}
                          <Sheet.Trigger asChild>
                            <Button
                              onClick={() => {
                                setSelectedProfile(profile)
                                setMenuOpen(false)
                                setProfileDialogOpen(true)
                              }}
                              className="ml-auto hover:border-accent-foreground rounded border border-transparent h-8 w-8"
                              size="icon"
                              variant="ghost"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Sheet.Trigger>
                          <AlertDialog.Trigger asChild>
                            <Button
                              onClick={() => {
                                setSelectedProfile(profile)
                                setDeleteProfileDialogOpen(true)
                              }}
                              className="ml-2 hover:border-accent-foreground rounded border border-transparent h-8 w-8"
                              size="icon"
                              variant="ghost"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
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
