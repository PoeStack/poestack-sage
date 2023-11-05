
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import type {RollupOptions} from 'rollup';

const config: RollupOptions = {
    input: 'src/entry.tsx',
    external: ['fs'],
    output: {
        file: "../../../dist_plugins/stash_plugin.js",
        format: 'cjs',
        sourcemap: true
    },
    plugins: [peerDepsExternal(), typescript()]
}
// noinspection JSUnusedGlobalSymbols
export default config;