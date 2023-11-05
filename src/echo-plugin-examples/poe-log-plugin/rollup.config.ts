import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import type {RollupOptions} from 'rollup';
import * as fs from "fs";
import * as path from "path";

const packageJson = JSON.parse(fs.readFileSync(path.resolve("package.json")).toString())

const config: RollupOptions = {
    input: 'src/entry.tsx',
    external: ['fs'],
    output: {
        file: `../../../dist_plugins/${packageJson.name}.js`,
        format: 'cjs',
        sourcemap: true
    },
    plugins: [peerDepsExternal(), typescript()]
}
// noinspection JSUnusedGlobalSymbols
export default config;