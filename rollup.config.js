import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
    input: "src/index.js",
    output: {
        name: "table_charter",
        file: "dist/main.umd.js",
        format: "umd",
    },
    plugins: [
        commonjs(),
        replace({
            "process.env.NODE_ENV": JSON.stringify("development"),
        }),
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        json(),
    ],
};
