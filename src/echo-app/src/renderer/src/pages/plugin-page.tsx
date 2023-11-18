import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import { CpuChipIcon, HomeIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { bind } from '@react-rxjs/core'
import { ECHO_CONTEXT_SERVICE, EchoPluginHook } from 'echo-common'
import { EchoRoute } from 'echo-common/dist/cjs/echo-router'
import React, { Suspense, useEffect } from 'react'
import { ProfilePage } from './profile-page'
import { PluginSettingsPage } from './plugin-settings-page'
// @ts-ignore
import { DEV_PLUGINS } from '../dev-plugins'
import { APP_CONTEXT, buildContext } from '../echo-context-factory'

const [useCurrentRoute] = bind(APP_CONTEXT.router.currentRoute$)
const [useCurrentRoutes] = bind(APP_CONTEXT.router.routes$)

export const PluginPage: React.FC = () => {
  const { router, plugins } = APP_CONTEXT

  const currentRoute = useCurrentRoute()

  const PluginBody = currentRoute?.page ?? DefaultPage

  useEffect(() => {
    const homeRoute: EchoRoute = {
      navItems: [
        {
          location: 'l-sidebar-m',
          icon: HomeIcon
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
          icon: UserCircleIcon
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
          icon: CpuChipIcon
        }
      ],
      page: PluginSettingsPage,
      path: 'plugin-settings',
      plugin: 'sage'
    })
  }, [])

  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      DEV_PLUGINS.forEach((e: Promise<{ default: () => EchoPluginHook }>) => {
        const context = buildContext('plugin')
        ECHO_CONTEXT_SERVICE.contexts['plugin'] = context

        e.then((entry: { default: () => EchoPluginHook }) => {
          const plugin: EchoPluginHook = entry.default()
          plugin.start()
        })
      })
    } else {
      plugins.loadPlugins()
    }
  }, [])

  return (
    <>
      <div className="w-12 drop-shadow-md h-full top-7 fixed flex flex-col bg-secondary-surface items-center px-2 pt-2 pb-9 justify-center gap-2">
        <RouterIconNavigator location="l-sidebar-m" />
        <div className="flex-1 border-gray-500 w-full border-b-2"></div>
        <RouterIconNavigator location="l-sidebar-b" />
      </div>
      <div className="ml-12 pb-7 pt-7 h-full">
        <Suspense fallback={<DefaultPage />}>
          {/* <PluginBody /> */}
          <div className="relative mb-3" data-te-input-wrapper-init>
            <input
              type="text"
              className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
              id="exampleFormControlInput1"
              placeholder="Example label"
            />
            <label
              htmlFor="exampleFormControlInput1"
              className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
            >
              Example label
            </label>
          </div>
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
              <Icon
                key={echoRoute.plugin + echoRoute.path + navItem.location + idx}
                className={
                  'h-7 w-7 cursor-pointer ' +
                  (currentRoute === echoRoute ? 'text-primary-accent' : '')
                }
                onClick={() => {
                  APP_CONTEXT.router.push(echoRoute)
                }}
              ></Icon>
            )
          })
      })}
    </>
  )
}

const DefaultPage = () => {
  return <>Welcome to PoeStack - Sage</>
}
