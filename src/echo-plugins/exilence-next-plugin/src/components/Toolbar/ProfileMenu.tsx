import { Menu } from '@headlessui/react'
import { useState } from 'react'
import { IProfile } from '../../interfaces/profile.interface'

const testProfiles: IProfile[] = [{ name: 'Account 1' }, { name: 'Account 2' }]

export type ProfileMenuProps = {
  profiles?: IProfile[]
  handleProfileSelect?: () => void
}

export function ProfileMenu({ profiles = testProfiles, handleProfileSelect }: ProfileMenuProps) {
  const hasProfiles = profiles?.length > 0
  const [selectedProfile, setSelectedProfile] = useState<IProfile | undefined>(
    hasProfiles ? profiles[0] : undefined
  )

  return (
    <Menu as="div">
      {!hasProfiles && <Menu.Button disabled>No profiles</Menu.Button>}
      {hasProfiles && (
        <Menu.Button disabled={!hasProfiles}>
          <div className="flex flex-col">{selectedProfile?.name}</div>
          <div className="w-full h-1 border-t border-primary-text" />
        </Menu.Button>
      )}
      {hasProfiles && (
        <Menu.Items className="overflow-auto bg-secondary-surface z-50 absolute p-3 my-1 rounded-md flex flex-col">
          {profiles.map((profile) => {
            return (
              <Menu.Item key={profile.name}>
                <button
                  onClick={() => setSelectedProfile(profile)}
                  className={`${profile.name === selectedProfile?.name && 'text-sky-100'}`}
                >
                  {profile.name}
                </button>
              </Menu.Item>
            )
          })}
        </Menu.Items>
      )}
    </Menu>
  )
}
