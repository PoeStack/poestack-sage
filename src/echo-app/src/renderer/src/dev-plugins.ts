/**
 * This plugins are used in dev mode - via 'npm run dev'
 * All of these plugins have HMR enabled, regardless of whether you only have the plugins folder open
 */

export const importDevPlugin = (pluginName: string) => {
  switch (pluginName) {
    case 'character-plugin-dev':
      return import('character-plugin')
    case 'stash-plugin-dev':
      return import('stash-plugin')
    case 'poe-log-plugin-dev':
      return import('poe-log-plugin')
    default:
      return
  }
}

export const getDevPluginNames = () => {
  return ['character-plugin-dev', 'stash-plugin-dev', 'poe-log-plugin-dev']
}
