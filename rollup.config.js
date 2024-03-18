import json from "@rollup/plugin-json";
import resolve from "rollup-plugin-node-resolve";

export default {
    input: "src/index.js",
    output: {
        name: "table_charter",
        file: "dist/table_charter.es.js",
        format: "es",
    },
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        json(),
    ],
};
