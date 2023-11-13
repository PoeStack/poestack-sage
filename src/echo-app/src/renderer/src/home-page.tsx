import React, { useEffect, useState } from 'react'

import { ECHO_ROUTER, EchoPluginHook, ECHO_PLUGIN_CONFIG } from 'echo-common'
import fs from 'fs'
import * as path from 'path'
import { CpuChipIcon, HomeIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import { EchoRoute } from 'echo-common/dist/cjs/echo-router'
import { bind } from '@react-rxjs/core'
import { ProfilePage } from './profile-page'
import { PluginPageHeader } from './plugin-page-header'
import { PluginPageFooter } from './plugin-page-footer'
import { PluginPage } from './plugin-page'

const [useCurrentRoute] = bind(ECHO_ROUTER.currentRoute$)
const [useCurrentRoutes] = bind(ECHO_ROUTER.routes$)

export const HomePage: React.FC = () => {
  const currentRoute = useCurrentRoute()

  const HomeBody = currentRoute?.page ?? DefaultPage

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
    ECHO_ROUTER.registerRoute({
      navItems: [
        {
          location: 'l-sidebar-b',
          icon: CpuChipIcon
        }
      ],
      page: PluginPage,
      path: 'plugins',
      plugin: 'sage'
    })
  }, [])

  useEffect(() => {
    function loadPlugins(baseDir: string) {
      const pluginConfigs = ECHO_PLUGIN_CONFIG.loadPluginConfig()
      fs.readdir(baseDir, (err, files) => {
        if (err) {
          return console.log('Unable to scan directory: ' + err)
        }
        files.forEach(function (file) {
          if (file.endsWith('.js')) {
            const p = path.resolve(baseDir, file)
            const fileName = path.basename(p).replace(/\.[^/.]+$/, '')
            console.log('loading', fileName)
            const pluginConfig = fileName && pluginConfigs[fileName]
            if (pluginConfig && pluginConfig.enabled) {
              const entry = module.require(p)
              console.log('entry', entry)
              const plugin: EchoPluginHook = entry()
              plugin.start()
            } else {
              pluginConfigs[fileName] = {
                name: fileName,
                version: 'LOCAL',
                enabled: false,
                path: p
              }
            }
          }
        })
        ECHO_PLUGIN_CONFIG.writePluginConfig(pluginConfigs)
      })
    }

    loadPlugins(path.resolve('..', '..', 'dist_plugins'))
  }, [])

  const themes = ['root']
  const [selectedTheme, setSelectedTheme] = useState(themes[0])

  return (
    <div
      className="h-screen w-screen bg-primary-surface text-primary-text"
      data-theme={selectedTheme}
    >
      <PluginPageHeader />
      <div className="w-12 drop-shadow-md h-full top-7 fixed flex flex-col bg-secondary-surface items-center px-2 pt-2 pb-9 justify-center gap-2">
        <RouterIconNavigator location="l-sidebar-m" />
        <div className="flex-1 border-gray-500 w-full border-b-2"></div>
        <RouterIconNavigator location="l-sidebar-b" />
      </div>
      <div className="ml-12 pb-7 pt-7 h-full">
        <HomeBody />
      </div>
      <PluginPageFooter />
    </div>
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
