import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
const is_standalone = process.argv.includes("--standalone");
const singlefile_plugin = is_standalone ? [viteSingleFile()] : [];
const plugins = [...singlefile_plugin];

export default defineConfig({
    base: "/table_charter/",
    plugins,
    esbuild: {
        supported: {
            "top-level-await": true, //browsers can handle top-level-await features
        },
    },
});
