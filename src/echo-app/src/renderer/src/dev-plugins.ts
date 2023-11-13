/**
 * This plugins are used in dev mode - via 'npm run dev'
 * All of these plugins have HMR enabled, regardless of whether you only have the plugins folder open
 */

export const getDevPlugins = () => {
  return [import('character-plugin'), import('stash-plugin'), import('poe-log-plugin')]
}
