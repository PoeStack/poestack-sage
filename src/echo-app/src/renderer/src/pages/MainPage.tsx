import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import { CpuChipIcon, HomeIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { bind } from '@react-rxjs/core'
import { ECHO_CONTEXT_SERVICE, EchoPluginHook, cn, EchoRoute } from 'echo-common'
import { ActionTooltip, Button } from 'echo-common/components-v1'
import React, { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ProfilePage } from './ProfilePage'
import { PluginSettingsPage } from './PluginSettingsPage'
// @ts-ignore
import { DEV_PLUGINS } from '../dev-plugins'
import { APP_CONTEXT, buildContext } from '../echo-context-factory'
import { SettingsIcon } from 'lucide-react'
import PoeStackLogo from '../assets/icon.png'
import { PoeStackSettingsPage } from './PoeStackSettingsPage'

const [useCurrentRoute] = bind(APP_CONTEXT.router.currentRoute$)
const [useCurrentRoutes] = bind(APP_CONTEXT.router.routes$)

export const MainPage: React.FC = () => {
  const { router, plugins } = APP_CONTEXT
  const mounted = React.useRef(false)

  const currentRoute = useCurrentRoute()

  const PluginBody = currentRoute?.page ?? DefaultPage

  useEffect(() => {
    // Prevent React.StrictMode duplicate execution in devMode to keep current page in HMR (Exception)
    if (mounted.current) return
    mounted.current = true
    const homeRoute: EchoRoute = {
      navItems: [
        {
          location: 'l-sidebar-m',
          icon: HomeIcon,
          displayname: 'Home'
        }
      ],
      page: DefaultPage,
      path: 'home',
      plugin: 'sage'
    }
    router.registerRoute(homeRoute)
    router.push(homeRoute)

    router.registerRoute({
      navItems: [
        {
          location: 'l-sidebar-b',
          icon: UserCircleIcon,
          displayname: 'Profile'
        }
      ],
      page: ProfilePage,
      path: 'profile',
      plugin: 'sage'
    })
    router.registerRoute({
      navItems: [
        {
          location: 'l-sidebar-b',
          icon: CpuChipIcon,
          displayname: 'Plugins'
        }
      ],
      page: PluginSettingsPage,
      path: 'plugin-settings',
      plugin: 'sage'
    })
    router.registerRoute({
      navItems: [
        {
          location: 'l-sidebar-b',
          icon: SettingsIcon,
          displayname: 'Settings'
        }
      ],
      page: PoeStackSettingsPage,
      path: 'settings',
      plugin: 'sage'
    })
  }, [router])

  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      for (const [name, devPlugin] of Object.entries(DEV_PLUGINS)) {
        const context = buildContext('plugin')
        ECHO_CONTEXT_SERVICE.contexts['plugin'] = context

        devPlugin()
          .then((entry: { default: () => EchoPluginHook }) => {
            const plugin: EchoPluginHook = entry.default()

            plugin.start({
              registration: {
                name
              },
              services: {
                loggingService: APP_CONTEXT.loggingService // TODO: after implemented use APP_CONTEXT.loggingService.createChildLogger('pluginName')
              }
            })
          })
          .catch((error) => {
            APP_CONTEXT.loggingService.error(`Failed to load plugin ${name}`, error)
          })
      }
    } else {
      plugins.loadPlugins()
    }
  }, [plugins])

  return (
    <>
      <div className="w-12 drop-shadow-md h-full top-7 fixed z-10 flex flex-col bg-background brightness-75 items-center px-2 pt-2 pb-9 justify-center gap-2">
        <RouterIconNavigator location="l-sidebar-m" />
        <div className="flex-1 border-gray-500 w-full border-b-2"></div>
        <RouterIconNavigator location="l-sidebar-b" />
      </div>
      <div className="h-[calc(100vh-3.5rem)] relative overflow-auto ml-12 pb-7">
        <Suspense fallback={<DefaultPage />}>
          <PluginBody />
        </Suspense>
      </div>
    </>
  )
}

const RouterIconNavigator = ({ location }: { location: string }) => {
  const currentRoutes = useCurrentRoutes()
  const currentRoute = useCurrentRoute()

  return (
    <>
      {currentRoutes.flatMap((echoRoute) => {
        return (echoRoute.navItems ?? [])
          .filter((e) => e.location === location)
          .map((navItem, idx) => {
            const Icon = navItem.icon ?? QuestionMarkCircleIcon
            return (
              <div
                key={echoRoute.plugin + echoRoute.path + navItem.location + idx}
                className="group flex flex-row items-center"
              >
                <div
                  className={cn(
                    '-ml-2 bg-accent-foreground w-2 rounded-full',
                    // If notifiction: 'h-2',
                    currentRoute === echoRoute
                      ? 'animate-plugin-select h-5'
                      : 'group-hover:animate-plugin-select group-hover:h-3'
                  )}
                />
                <ActionTooltip side="right" align="center" label={navItem.displayname}>
                  <Button className="hover:bg-inherit" size="icon" variant="ghost">
                    <Icon
                      className="h-7 w-7"
                      onClick={() => {
                        APP_CONTEXT.router.push(echoRoute)
                      }}
                    />
                  </Button>
                </ActionTooltip>
              </div>
            )
          })
      })}
    </>
  )
}

const DefaultPage = () => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center gap-2 h-full">
      <img src={PoeStackLogo} width={200} />
      <h1 className="text-lg">{t('title.welcomeTo')}</h1>
    </div>
  )
}
