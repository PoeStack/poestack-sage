
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import type {RollupOptions} from 'rollup';

const config: RollupOptions = {
    input: 'src/entry.tsx',
    external: ['fs'],
    output: {
        file: "dist/cjs/plugin.js",
        format: 'cjs'
    },
    plugins: [typescript(), peerDepsExternal()]
}
export default config;