import { APP_CONTEXT, GGG_HTTP_UTIL } from '../echo-context-factory'


export function ProfilePage() {
  const { value: profile } = APP_CONTEXT.poeAccounts.useProfile()

  return (
    <>
      <div className="w-full h-full overflow-y-scroll flex flex-row">
        <div className="basis-1/4"></div>
        <div className="flex flex-col">
          <div>Welcome {profile?.name} to your profile</div>
          <button
            onClick={() => {
              APP_CONTEXT.dir.deleteJson('auth')
              GGG_HTTP_UTIL.tokenSubject$.next(undefined)
            }}
          >
            Logout
          </button>
        </div>
        <div className="basis-1/4"></div>
      </div>
    </>
  )
}
