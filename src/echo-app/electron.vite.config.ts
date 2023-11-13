import path from 'path'
import { defineConfig, defineViteConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import commonjsExternals from 'vite-plugin-commonjs-externals'
// @ts-ignore
import externalNodePackages from './external-packages'
import { externalizeDepsAndPeerPlugin } from './plugins/externalizeDeps'

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
      'tail'
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

// console.log(commonjsPackages)

// TODO: Suppress sourcemap not found warnings

export default defineConfig({
  main: defineViteConfig((config) => {
    return {
      plugins: [externalizeDepsAndPeerPlugin()]
    }
  }),
  preload: defineViteConfig((config) => {
    return {
      plugins: [externalizeDepsAndPeerPlugin()]
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
        config.mode === 'production' && externalizeDepsAndPeerPlugin()
      ]
    }
  })
})
