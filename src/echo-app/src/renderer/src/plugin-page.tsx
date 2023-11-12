import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import { HomeIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { bind } from '@react-rxjs/core'
import { ECHO_ROUTER, EchoPluginHook } from 'echo-common'
import { EchoRoute } from 'echo-common/dist/cjs/echo-router'
import fs from 'fs'
import os from 'os'
import * as path from 'path'
import React, { useEffect } from 'react'
import { ProfilePage } from './profile-page'
import { getDevPlugins } from './dev-plugins'

const [useCurrentRoute] = bind(ECHO_ROUTER.currentRoute$)
const [useCurrentRoutes] = bind(ECHO_ROUTER.routes$)

export const PluginPage: React.FC = () => {
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
    ECHO_ROUTER.registerRoute(homeRoute)
    ECHO_ROUTER.push(homeRoute)

    ECHO_ROUTER.registerRoute({
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
  }, [])

  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      const imports = getDevPlugins()
      imports.forEach((prom) => {
        prom.then((entry) => {
          const plugin: EchoPluginHook = entry.default()
          plugin.start()
        })
      })
    } else {
      function loadPlugins(baseDir: string) {
        fs.readdir(baseDir, (err, files) => {
          if (err) {
            return console.log('Unable to scan directory: ' + err)
          }
          files.forEach(function (file) {
            if (file.endsWith('.js')) {
              const p = path.resolve(baseDir, file)
              const entry = module.require(p)
              const plugin: EchoPluginHook = entry?.()
              plugin?.start()
            }
          })
        })
      }
      let pluginDir = path.resolve(os.homedir(), 'poestack-sage', 'plugins')
      if (import.meta.env.RENDERER_VITE_PLUGIN_PATH) {
        pluginDir = path.resolve('..', '..', import.meta.env.RENDERER_VITE_PLUGIN_PATH)
      }
      loadPlugins(pluginDir)
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
        <PluginBody />
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
                  ECHO_ROUTER.push(echoRoute)
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
