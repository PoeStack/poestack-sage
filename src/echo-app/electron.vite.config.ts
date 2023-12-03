import path from 'path'
import { defineConfig, defineViteConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import commonjsExternals from 'vite-plugin-commonjs-externals'
// @ts-ignore
import externalNodePackages from './external-packages'
import { externalizeDepsAndPeerDepsPlugin } from './plugins/externalizeDeps'
import { i18nHotReloadPlugin } from './plugins/i18nHotReload'

// All this modules are now accessible via 'import fs from 'fs'' instead of require which always works but cause problems in libs which use this node modules via import
const commonjsPackages = Array.from(
  new Set([
    // All native node-modules
    ...externalNodePackages,
    ...[
      // Dependencies which should not be optimized (Node module references)
      'electron',
      'electron-updater',
      'electron/main',
      'electron/common',
      'electron/renderer',
      '@electron/remote',
      'original-fs',
      'jsonwebtoken',
      'axios', // Adapter { https } does only work in node env
      'sqlite3',
      'tail',
      'i18next-fs-backend',
      'node-stream-zip'
    ],
    ...[
      // Do not include them or the dev serves does not work anymore
      // 'echo-common',
      // 'ggg-api',
      // 'sage-common',
      // 'ts-ratchet',
      // 'character-plugin',
      // 'poe-log-plugin',
      // 'stash-plugin'
    ]
  ])
)

export default defineConfig({
  main: defineViteConfig(() => {
    return {
      plugins: [externalizeDepsAndPeerDepsPlugin()]
    }
  }),
  preload: defineViteConfig(() => {
    return {
      plugins: [externalizeDepsAndPeerDepsPlugin()]
    }
  }),
  renderer: defineViteConfig((config) => {
    return {
      resolve: {
        alias: {
          '@renderer': path.resolve('src/renderer/src')
        }
      },
      build: {
        lib: {
          // This enables, that node is available in production mode
          entry: ['src/renderer/src/index.tsx'],
          formats: ['cjs']
        },
        rollupOptions: {
          // Compatibility mode
          treeshake: config.mode === 'production' ? false : true,
          output: {
            format: 'cjs'
          }
        }
      },
      optimizeDeps: {
        exclude: commonjsPackages
      },
      plugins: [
        react(),
        commonjsExternals({ externals: commonjsPackages }),
        // Do not bundle any dependencies in production
        config.mode === 'production' && externalizeDepsAndPeerDepsPlugin(),
        config.mode !== 'production' && i18nHotReloadPlugin()
      ]
    }
  })
})
