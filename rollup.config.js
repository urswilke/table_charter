import json from "@rollup/plugin-json";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default {
    input: "src/index.js",
    output: {
        name: "table_charter",
        file: "dist/table_charter.es.js",
        format: "es",
    },
    plugins: [
        commonjs(),
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        json(),
    ],
};
