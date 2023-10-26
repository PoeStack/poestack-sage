import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import type {RollupOptions} from 'rollup';

const config: RollupOptions = {
    input: 'src/index.tsx',
    external: ['fs'],
    output: {
        file: "build/index.js",
        format: 'cjs'
    },
    plugins: [
        postcss({}),
        typescript(),
        peerDepsExternal()
    ]
}
export default config;