import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

export default {
    input: "src/index.js",
    external: [/node_modules/],
    output: {
        name: "table_charter",
        file: "dist/main.es.js",
        format: "es",
    },
    plugins: [
        peerDepsExternal(),
        commonjs(),
        replace({
            preventAssignment: true,
            "process.env.NODE_ENV": JSON.stringify("development"),
        }),
        resolve(),
        json(),
    ],
};
