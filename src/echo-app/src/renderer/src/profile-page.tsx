import React from 'react'
import { POE_ACCOUNT_SERVICE, usePoeLeagues, usePoeProfile } from 'echo-common'

export function ProfilePage() {
  const profile = usePoeProfile()
  const leagues = usePoeLeagues()

  POE_ACCOUNT_SERVICE.profile.load('profile').subscribe()
  POE_ACCOUNT_SERVICE.leagues.load('leagues').subscribe()

  return (
    <>
      <div className="w-full h-full overflow-y-scroll flex flex-row">
        <div className="basis-1/4"></div>
        <div className="flex flex-col">
          <div>Welcome {profile?.name} to your profile</div>
          {leagues?.map((league) => <div key={league.id}>{league.id}</div>)}
        </div>
        <div className="basis-1/4"></div>
      </div>
    </>
  )
}
