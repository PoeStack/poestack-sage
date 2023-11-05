import typescript from '@rollup/plugin-typescript'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import type { RollupOptions } from 'rollup'
import fs from 'fs'
import path from 'path'

const packageJson = JSON.parse(fs.readFileSync(path.resolve('package.json')).toString())

const config: RollupOptions = {
  input: 'src/entry.tsx',
  external: ['fs'],
  output: {
    file: `../../../dist_plugins/${packageJson.name}.js`,
    format: 'cjs',
    sourcemap: process.env.STAGE === 'prod' ? false : 'inline'
  },
  plugins: [peerDepsExternal(), typescript()]
}
// noinspection JSUnusedGlobalSymbols
export default config
