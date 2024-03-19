import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
// import peerDepsExternal from "rollup-plugin-peer-deps-external";

export default {
    input: "src/index.js",
    external: ["@observablehq/plot", "compress-json", "d3", "immer", "lodash"],
    output: {
        name: "table_charter",
        file: "dist/main.es.js",
        format: "es",
    },
    plugins: [
        // peerDepsExternal(),
        resolve(),
        commonjs(),
        replace({
            preventAssignment: true,
            "process.env.NODE_ENV": JSON.stringify("development"),
        }),
        json(),
    ],
};
