import typescript from '@rollup/plugin-typescript'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import type { RollupOptions } from 'rollup'
import * as fs from 'fs'
import * as path from 'path'
import copy from 'rollup-plugin-copy'

const packageJson = JSON.parse(fs.readFileSync(path.resolve('package.json')).toString())

const config: RollupOptions = {
  input: 'src/entry.tsx',
  external: ['fs'],
  output: {
    file: `./dist/${packageJson.name}.js`,
    format: 'cjs'
  },
  plugins: [
    peerDepsExternal(),
    typescript(),
    copy({
      targets: [
        {
          src: './dist/**',
          dest: `../../../dist_plugins`
        }
      ],
      hook: 'writeBundle'
    })
  ]
}
// noinspection JSUnusedGlobalSymbols
export default config
