import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'
import postcss from 'rollup-plugin-postcss'
import type { RollupOptions } from 'rollup'

const config: RollupOptions = {
  input: 'src/renderer/src/index.tsx',
  external: ['fs'],
  output: {
    file: 'build/renderer/src/index.js',
    format: 'cjs',
    sourcemap: process.env.STAGE === 'prod' ? false : 'inline'
  },
  plugins: [
    postcss({}),
    typescript(),
    copy({
      targets: [
        {
          src: 'src/renderer/index.html',
          dest: 'build/renderer/'
        }
      ]
    })
  ]
}
export default config
