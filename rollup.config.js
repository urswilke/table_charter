import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";
import node from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
// import peerDepsExternal from "rollup-plugin-peer-deps-external";

export default {
    input: "src/index.js",
    // external: [
    //     "@observablehq/plot",
    //     "d3",
    //     "immer",
    //     "intro.js",
    //     "lit-translate",
    //     "tabulator-tables",
    //     "lit",
    // ],
    output: {
        name: "table_charter",
        file: "dist/main.es.js",
        format: "es",
    },
    plugins: [
        // peerDepsExternal(),
        node(),
        commonjs(),
        replace({
            preventAssignment: true,
            "process.env.NODE_ENV": JSON.stringify("development"),
        }),
        json(),
    ],
};
