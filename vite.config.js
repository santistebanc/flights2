"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vite_1 = require("vite");
var plugin_react_1 = require("@vitejs/plugin-react");
var path_1 = require("path");
// https://vite.dev/config/
exports.default = (0, vite_1.defineConfig)(function (_a) {
    var mode = _a.mode;
    return ({
        plugins: [
            (0, plugin_react_1.default)(),
            // The code below enables dev tools like taking screenshots of your site
            // while it is being developed on chef.convex.dev.
            // Feel free to remove this code if you're no longer developing your app with Chef.
            mode === "development"
                ? {
                    name: "inject-chef-dev",
                    transform: function (code, id) {
                        if (id.includes("main.tsx")) {
                            return {
                                code: "".concat(code, "\n\n/* Added by Vite plugin inject-chef-dev */\nwindow.addEventListener('message', async (message) => {\n  if (message.source !== window.parent) return;\n  if (message.data.type !== 'chefPreviewRequest') return;\n\n  const worker = await import('https://chef.convex.dev/scripts/worker.bundled.mjs');\n  await worker.respondToMessage(message);\n});\n            "),
                                map: null,
                            };
                        }
                        return null;
                    },
                }
                : null,
            // End of code for taking screenshots on chef.convex.dev.
        ].filter(Boolean),
        resolve: {
            alias: {
                "@": path_1.default.resolve(__dirname, "./src"),
            },
        },
        css: {
            postcss: './postcss.config.js',
        },
    });
});
