import { PluginOption } from 'vite'

export const i18nHotReloadPlugin = (): PluginOption => {
  return {
    name: 'i18n-hot-reload',
    handleHotUpdate({ file, server }) {
      if (file.includes('locales') && file.endsWith('.json')) {
        server.ws.send({
          type: 'custom',
          event: 'locales-update'
        })
      }
    }
  }
}
