import typescript from '@rollup/plugin-typescript'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import type { InputPluginOption, RollupOptions } from 'rollup'
import fs from 'fs'
import path from 'path'
import copy from 'rollup-plugin-copy'
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'
import zipPlugin from './plugins/rollup-plugin-zip'

const packageJson = JSON.parse(fs.readFileSync(path.resolve('package.json')).toString())

const config: RollupOptions = {
  input: 'src/entry.tsx',
  external: ['fs', 'url', 'path'],
  output: {
    format: 'cjs',
    // Create chunks for locales - We want to keep the hashes, that the module resolution beginning from echo-app does not match. Its way only the resolution for the actual plugin works
    dir: `./dist`,
    plugins: [terser()]
  },
  plugins: [
    peerDepsExternal() as InputPluginOption,
    json({ compact: true }),
    typescript(),
    // This converts dynamic imports for locales from ../locales/${lng}/${ns}.json => ../locales/*/*.json => ../locales/en/common.json
    dynamicImportVars(),
    copy({
      targets: [
        {
          src: 'src/db/migrations',
          dest: `./dist/`
        }
      ],
      hook: 'writeBundle'
    }),
    // This zip does not only write the bundle it includes the custom copies
    zipPlugin({ srcDir: './dist', file: `../../../dist_plugins/${packageJson.name}.zip` })
  ]
}
// noinspection JSUnusedGlobalSymbols
export default config
