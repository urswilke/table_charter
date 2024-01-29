import { defineConfig } from 'vite'
import { viteSingleFile } from "vite-plugin-singlefile"
export default defineConfig({
    base: '/table_charter/',  
    plugins: [viteSingleFile()],
    build: {
      minify: 'terser'
    },
    esbuild: {
        supported: {
          'top-level-await': true //browsers can handle top-level-await features
        },
    },
})