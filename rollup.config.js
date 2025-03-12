import fs from "fs";
import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
// import peerDepsExternal from "rollup-plugin-peer-deps-external";
import terser from "@rollup/plugin-terser";

const pkgs = [
    "@observablehq/plot",
    "d3",
    "immer",
    "intro.js",
    "lit-translate",
    "tabulator-tables",
    "lit",
];

const pkg_paths = {};
for (const name of pkgs) {
    let pkg = JSON.parse(
        fs.readFileSync(`./node_modules/${name}/package.json`, "utf-8"),
    );
    pkg_paths[name] =
        `https://cdn.jsdelivr.net/npm/${name}@${pkg.version}/+esm`;
}

const config = {
    input: "src/index.js",
    external: pkgs,
    output: {
        name: "table_charter",
        file: "dist/main.es.js",
        format: "es",
        extend: true,
        paths: pkg_paths,
        globals: { d3: "d3" },
    },
    plugins: [
        // peerDepsExternal(),
        nodeResolve(),
        commonjs(),
        replace({
            preventAssignment: true,
            "process.env.NODE_ENV": JSON.stringify("development"),
        }),
        json(),
    ],
};

export default [
    {
        ...config,
        output: {
            ...config.output,
            file: `dist/main.es.js`,
        },
    },
    {
        ...config,
        output: {
            ...config.output,
            file: `dist/main.es.min.js`,
        },
        plugins: [
            ...config.plugins,
            terser({
                output: {
                    preamble: config.output.banner,
                },
            }),
        ],
    },
];
