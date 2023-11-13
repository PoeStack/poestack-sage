// electron.vite.config.ts
import path2 from "path";
import { defineConfig, defineViteConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import commonjsExternals from "vite-plugin-commonjs-externals";

// external-packages.ts
var external = ["electron", "electron-updater"];
var builtins = [
  "assert",
  "async_hooks",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "http2",
  "https",
  "inspector",
  "module",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "timers",
  "tls",
  "trace_events",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "zlib"
];
var external_packages_default = [...builtins, ...external];

// plugins/externalizeDeps.ts
import path from "node:path";
import { createRequire } from "node:module";
import { mergeConfig } from "vite";
var __electron_vite_injected_import_meta_url = "file:///C:/Users/nienh/Documents/A_Projects/poestack-sage/src/echo-app/plugins/externalizeDeps.ts";
function externalizeDepsAndPeerPlugin(options = {}) {
  const { exclude = [], include = [] } = options;
  const packagePath = path.resolve(process.cwd(), "package.json");
  const require2 = createRequire(__electron_vite_injected_import_meta_url);
  const pkg = require2(packagePath);
  let deps = Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {}));
  if (include.length) {
    deps = deps.concat(include.filter((dep) => dep.trim() !== ""));
  }
  if (exclude.length) {
    deps = deps.filter((dep) => !exclude.includes(dep));
  }
  deps = [...new Set(deps)];
  return {
    name: "vite:externalize-deps",
    enforce: "pre",
    config(config) {
      const defaultConfig = {
        build: {
          rollupOptions: {
            external: deps.length > 0 ? [...deps, new RegExp(`^(${deps.join("|")})/.+`)] : []
          }
        }
      };
      const buildConfig = mergeConfig(defaultConfig.build, config.build || {});
      config.build = buildConfig;
    }
  };
}

// electron.vite.config.ts
var commonjsPackages = Array.from(
  /* @__PURE__ */ new Set([
    // All native node-modules
    ...external_packages_default,
    ...[
      // Dependencies which should not be optimized (Node module references)
      "electron",
      "electron-updater",
      "electron/main",
      "electron/common",
      "electron/renderer",
      "@electron/remote",
      "original-fs",
      "jsonwebtoken",
      "axios",
      // Adapter { https } does only work in node env
      "sqlite3",
      "tail"
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
);
var electron_vite_config_default = defineConfig({
  main: defineViteConfig((config) => {
    return {
      plugins: [externalizeDepsAndPeerPlugin()]
    };
  }),
  preload: defineViteConfig((config) => {
    return {
      plugins: [externalizeDepsAndPeerPlugin()]
    };
  }),
  renderer: defineViteConfig((config) => {
    return {
      resolve: {
        alias: {
          "@renderer": path2.resolve("src/renderer/src")
        }
      },
      build: {
        lib: {
          // This enables, that node is available in production mode
          entry: ["src/renderer/src/index.tsx"],
          formats: ["cjs"]
        },
        rollupOptions: {
          // Compatibility mode
          treeshake: config.mode === "production" ? false : true,
          output: {
            format: "cjs"
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
        config.mode === "production" && externalizeDepsAndPeerPlugin()
      ]
    };
  })
});
export {
  electron_vite_config_default as default
};
