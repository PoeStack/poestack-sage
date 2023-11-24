import { Menu } from '@headlessui/react'
import { useState } from 'react'
import { IProfile } from '../../interfaces/profile.interface'
import { useStore } from '../../hooks/useStore'

export function ProfileMenu() {
  const store = useStore()
  const profiles = store?.accountStore?.activeAccount?.profiles
  const activeProfile = store?.accountStore?.activeAccount?.activeProfile
  const setActiveProfile = store.accountStore.activeAccount?.setActiveProfile
  const hasProfiles = profiles && profiles?.length > 0

  return (
    <Menu as="div">
      {!hasProfiles && <Menu.Button disabled>No profiles</Menu.Button>}
      {hasProfiles && (
        <Menu.Button disabled={!hasProfiles}>
          <div className="flex flex-col">{activeProfile?.name}</div>
          <div className="w-full h-1 border-t border-primary-text" />
        </Menu.Button>
      )}
      {hasProfiles && (
        <Menu.Items className="overflow-auto bg-secondary-surface z-50 absolute p-3 my-1 rounded-md flex flex-col">
          {profiles.map((profile) => {
            return (
              <Menu.Item key={profile.name}>
                <button
                  onClick={() => setActiveProfile?.(profile)}
                  className={`${profile.name === activeProfile?.name && 'text-sky-100'}`}
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
