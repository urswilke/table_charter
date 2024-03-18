import json from "@rollup/plugin-json";

export default {
    input: "src/index.js",
    output: {
        name: "table_charter",
        file: "dist/table_charter.es.js",
        format: "es",
    },
    plugins: [json()],
};
