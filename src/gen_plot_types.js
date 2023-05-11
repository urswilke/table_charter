import * as Plot from "@observablehq/plot";

export function gen_plot_options(data) {
	return {
		// style: {
		// 	color: "var(--plot-primary)",
		// },
		// use ordered sequence of unique values:
		// https://observablehq.com/@ee2dev/sorting-with-plot-a-collection-of-plot-examples#cell-102
		// https://stackoverflow.com/a/14438954
		x: {
			domain: [...new Set(data.map((x) => x.ColSubtitle))],
		},
		color: {
			type: "categorical",
			domain: [...new Set(data.map((x) => x.RowTitle))],
			legend: true
		},
		marks: [
			Plot.barY(data, {x: "ColSubtitle", y: "Value", fill: "RowTitle"})
		]
	};
}
