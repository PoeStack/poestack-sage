import { EchoPluginHook, EchoRoute } from 'echo-common'
import { I18nextProvider } from 'react-i18next'
import i18nInstance from './config/i18n.config'
import { type i18n } from 'i18next'
import { Users } from 'lucide-react'
import App from './App'
import { Suspense } from 'react'
import { context } from './context'

const Root = () => {
  return (
    <Suspense>
      {/* This will overwrite the default i18n in the main app*/}
      <I18nextProvider i18n={i18nInstance as i18n}>
        <App />
      </I18nextProvider>
    </Suspense>
  )
}

const pluginRoute: EchoRoute = {
  plugin: 'example-characters',
  path: 'main',
  page: Root,
  navItems: [
    {
      location: 'l-sidebar-m',
      icon: Users,
      displayname: 'Characters'
    }
  ]
}

function start() {
  context().router.registerRoute(pluginRoute)
}

function destroy() {
  context().router.unregisterRoute(pluginRoute)
}

export default function (): EchoPluginHook {
  return {
    start: start,
    destroy: destroy
  }
}
