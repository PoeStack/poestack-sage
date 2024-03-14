'use client'
import { Button } from '@/components/ui/button'
import { SUPPORTED_LEAGUES } from '@/lib/constants'
import { useNotificationStore } from '@/store/notificationStore'
import { useAtom } from 'jotai'
import { jwtDecode } from 'jwt-decode'
import { UserRoundIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import NotificationCenter from './notificationCenter/notification-center'
import { currentUserAtom } from './providers'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from './ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { Link } from './ui/link'
import { useListingsStore } from '@/app/[locale]/listings/listingsStore'
import { useListingToolStore } from '@/app/[locale]/listing-tool/listingToolStore'
import { useTranslation } from 'react-i18next'

export function ProfileMenu() {
  const { t } = useTranslation()
  const router = useRouter()

  const [open, setOpen] = useState(false)

  const [listingsLeague, setListingsLeague] = useListingsStore(
    useShallow((state) => [state.league, state.setLeague])
  )
  const [listingToolLeague, setListingToolLeague] = useListingToolStore(
    useShallow((state) => [state.league, state.setLeague])
  )

  const resetListinsStore = useListingsStore((state) => state.reset)
  const resetListingToolStore = useListingToolStore((state) => state.reset)

  const [dismissAll, blockDisplay] = useNotificationStore(
    useShallow((state) => [state.dismissAll, state.blockDisplay])
  )

  const [currentUser, setCurrentUser] = useAtom(currentUserAtom)

  useEffect(() => {
    // New league - reset all
    if (!SUPPORTED_LEAGUES.includes(listingsLeague)) {
      console.warn('Attention! Stores going to be resetted!')
      resetListinsStore()
    }
    if (!SUPPORTED_LEAGUES.includes(listingToolLeague)) {
      console.warn('Attention! Stores going to be resetted!')
      resetListingToolStore()
    }
  }, [resetListingToolStore, resetListinsStore, listingsLeague, listingToolLeague])

  useEffect(() => {
    const jwt = localStorage.getItem('doNotShareJwt')
    if (jwt) {
      setCurrentUser(jwtDecode(jwt))
    }
  }, [setCurrentUser])

  if (currentUser?.profile?.name) {
    return (
      <>
        <Link
          href="https://discord.gg/path-of-exile-trading-530668348682403841"
          aria-label="discord"
          target="_blank"
          rel="noopener"
          variant="navbar"
          external
          className="mr-2"
        >
          {t('action.poeTradeDiscord')}
        </Link>
        <NotificationCenter />
        <AlertDialog>
          <DropdownMenu
            open={open}
            onOpenChange={(open) => {
              if (open) {
                // Race conditions - dismiss has priority!
                setTimeout(() => dismissAll(true), 0)
              } else {
                blockDisplay(false)
              }
              setOpen(open)
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex flex-row gap-2 truncate">
                <UserRoundIcon className="w-4 h-4" />
                {currentUser.profile?.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[var(--radix-dropdown-menu-trigger-width)]">
              <DropdownMenuLabel>{t('label.account')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link
                  aria-label="discord"
                  className="flex flex-row items-center gap-2 whitespace-nowrap"
                  href={
                    'https://discord.com/api/oauth2/authorize?client_id=1201653656038940672&response_type=code&redirect_uri=https%3A%2F%2Fbulk.poestack.com%2Fdiscord%2Fconnect&scope=identify+guilds.members.read'
                  }
                >
                  <svg
                    className="w-4 h-4 fill-foreground"
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title> {t('label.discordTT')}</title>
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"></path>
                  </svg>
                  {t('action.linkDiscord')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t('label.league')}</DropdownMenuLabel>
              {SUPPORTED_LEAGUES.map((league) => (
                <DropdownMenuCheckboxItem
                  key={league}
                  className="capitalize"
                  checked={listingsLeague === league}
                  onCheckedChange={() => {
                    setListingsLeague(league)
                    setListingToolLeague(league)
                  }}
                >
                  {league}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />

              <AlertDialogTrigger asChild>
                <DropdownMenuItem>
                  {t('label.hardReset')}
                  {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
                </DropdownMenuItem>
              </AlertDialogTrigger>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem('doNotShareJwt')
                  setCurrentUser(null)
                }}
              >
                {t('action.logout')}
                {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('title.alertDialogQuesting')}</AlertDialogTitle>
              <AlertDialogDescription>{t('body.hardReset')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('action.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  resetListinsStore()
                  resetListingToolStore()
                }}
              >
                {t('action.hardReset')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <div className="flex flex-row gap-4 items-center">
      <Button
        variant="secondary"
        onClick={() => {
          router.push(
            'https://www.pathofexile.com/oauth/authorize?client_id=poestack&response_type=code&scope=account:profile account:stashes account:characters account:leagues account:league_accounts&state=dawncode&redirect_uri=https://poestack.com/ggg/connected&prompt=consent'
          )
        }}
      >
        {t('action.login')}
      </Button>
    </div>
  )
}
