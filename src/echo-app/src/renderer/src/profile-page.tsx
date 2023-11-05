import {ECHO_DIR, POE_ACCOUNT_SERVICE, usePoeProfile} from "echo-common";
import {GGG_API_UTIL} from "ggg-api";

export function ProfilePage() {

  const profile = usePoeProfile()

  POE_ACCOUNT_SERVICE.profile.load("profile").subscribe()

  return (
    <>
      <div className="w-full h-full overflow-y-scroll flex flex-row">
        <div className="basis-1/4"></div>
        <div className="flex flex-col">
          <div>Welcome {profile?.name} to your profile</div>
          <button onClick={() => {
            ECHO_DIR.deleteJson('auth')
            GGG_API_UTIL.tokenSubject$.next(undefined)
          }}>Logout
          </button>
        </div>
        <div className="basis-1/4"></div>
      </div>
    </>
  )
}
