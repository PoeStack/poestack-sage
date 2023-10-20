import {defineConfig} from 'vite'
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [peerDepsExternal()],
    build: {
        minify: false,
        sourcemap: true,
        lib: {
            entry: path.resolve(__dirname,"src/entry.ts"),
            name: "plugin",
            fileName: (format) => `plugin.${format}.js`,
        }
    }
})
