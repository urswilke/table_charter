import { defineConfig } from "vite";
export default defineConfig({
    base: "/table_charter/",
    esbuild: {
        supported: {
            "top-level-await": true, //browsers can handle top-level-await features
        },
    },
});
