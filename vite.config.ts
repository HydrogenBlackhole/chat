import { rmSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

import react from "@vitejs/plugin-react";
import electron from "vite-electron-plugin";
import { customStart, loadViteEnv } from "vite-electron-plugin/plugin";
import pkg from "./package.json";
import legacy from "@vitejs/plugin-legacy";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
// import visualizer from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(async ({ command }) => {
  rmSync("dist-electron", { recursive: true, force: true });

  const sourcemap = command === "serve" || !!process.env.VSCODE_DEBUG;
  const UnoCSS = (await import('unocss/vite')).default


  return {
    resolve: {
      alias: {
        "@": path.join(__dirname, "src"),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["legacy-js-api"],
        },
      },
    },
    plugins: [
      react(),UnoCSS(),
      electron({
        include: ["electron"],
        transformOptions: {
          sourcemap,
        },
        plugins: [
          ...(!!process.env.VSCODE_DEBUG
            ? [
              // Will start Electron via VSCode Debug
              customStart(() =>
                console.log(
                  /* For `.vscode/.debug.script.mjs` */ "[startup] Electron App",
                ),
              ),
            ]
            : []),
          // Allow use `import.meta.env.VITE_SOME_KEY` in Electron-Main
          loadViteEnv(),
        ],
      }),
      // legacy({
      //   targets: ["defaults", "not IE 11"],
      // }),
      // visualizer({ open: true }),
    ],
    server: {
      host: "0.0.0.0", // 使用你的局域网IP或者特殊值'0.0.0.0'以便外部设备可以通过IP访问
      port: 5173, // 你的端口号，如果你想要的端口
      proxy: {
        '/ff': {
          target: '',
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp("^/ff/.*?/"), ""),
          // bypass(req, res, options) {
          //   const proxyURL = options.target + options.rewrite(req.url)
          //   req.headers['x-req-proxyURL'] = proxyURL // 设置未生效
          //   res.setHeader('x-req-proxyURL', proxyURL) // 设置响应头可以看到
          // },
          configure(_, options) {
            options.rewrite = path => {
              let result = path.match(/\/ff\/(.*?)\//i)
              let ip = Buffer.from(result[1], 'base64').toString();
              let result2 = path.match(/\/ff\/.*?\/(.*?)$/i)
              // let url = new URL("http://"+ ip +":1090")
              options.target = "http://"+ ip +":1090"
              return "/" + result2[1];
            }
          },
        },
        '/ss': {
          target: 'http://110.40.33.122:5889',
          changeOrigin: true,
          secure: false,
          bypass(req, res, options) {
            const proxyURL = options.target + options.rewrite(req.url)
            console.log('proxyURL', proxyURL)
            req.headers['x-req-proxyURL'] = proxyURL // 设置未生效
            res.setHeader('x-req-proxyURL', proxyURL) // 设置响应头可以看到
          },
          rewrite: (path) => path.replace(new RegExp("^/ss"), ""),

        },
      },
    },
    clearScreen: false,
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis'
        },
        // Enable esbuild polyfill plugins
        plugins: [
          NodeGlobalsPolyfillPlugin({
            buffer: true
          })
        ]
      }
    },
    build: {
      sourcemap: false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 500,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          // manualChunks(id) {
          //   if (
          //     id.includes("node_modules") &&
          //     !id.includes("rc") &&
          //     !id.includes("ant")
          //   ) {
          //     return id.toString().split("node_modules/")[1].split("/")[0].toString();
          //   }
          // },
        },
      },
    },
  }
})
