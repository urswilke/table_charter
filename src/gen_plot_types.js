import * as Plot from "@observablehq/plot";

export function gen_plot_options(data) {
	if (data.length === 0) {
		return {};
	}
	let tab_type = data.plot_data[0].TabType;
	switch (tab_type) {
		case "CAT":
			return gen_plot_options_cat(data);
	
		case "MCG":
			return gen_plot_options_mw(data);
	
		case "MDG":
			return gen_plot_options_mw(data);
	
		case "MW":
			return gen_plot_options_mw(data);
	
			default:
			alert("Table type " + tab_type + " not implemented.")
			break;
	}
}

function gen_plot_options_cat(data) {
	const x_order = [...new Set(data.plot_data.map((x) => x.ColSubtitle))];
	const fill_order = [...new Set(data.plot_data.map((x) => x.RowTitle))];
	return {
		// style: {
		// 	color: "var(--plot-primary)",
		// },
		// use ordered sequence of unique values:
		// https://observablehq.com/@ee2dev/sorting-with-plot-a-collection-of-plot-examples#cell-102
		// https://stackoverflow.com/a/14438954
		x: {
			domain: x_order,
			label: null
		},
		y: {
			label: null,
		},
		color: {
			type: data.choices.color_scale,
			domain: fill_order,
			legend: true
		},
		marks: [
			Plot.barY(
				data.plot_data, 
				// https://talk.observablehq.com/t/how-to-display-text-in-each-level-of-a-stacked-bar-chart-made-with-plot/6510/2
				Plot.groupX(
					{y: "sum"},
					{
						x: "ColSubtitle", 
						y: "Value", 
						fill: "RowTitle",
						order: fill_order, 
						// another way to add tooltips:
						//  tip: true,
					}
				)
			),
			Plot.textY(
				data.plot_data,
				Plot.stackY(
					Plot.groupX(
						{ y: "sum", text: "first" },
						{
							x: "ColSubtitle",
							y: "Value",
							z: "RowTitle",
							text: (d) => (d.Value == 0 ? null : d.Value.toFixed(0)),
							order: fill_order
						}
					)
				)
			),
			Plot.barY(
				data.plot_data, 
				Plot.groupX(
					{y: "sum"},
					Plot.pointer({
						x: "ColSubtitle", 
						y: "Value",
						z: "RowTitle",
						stroke: "white",
						order: fill_order,
						fill: "orange",
						// https://talk.observablehq.com/t/plot-tooltips-available/6583/5:
						stroke: "transparent",
						strokeWidth: 500,
						title: (d) => [
							`Q: ${d.TabTitel1}`, 
							`row: ${d.RowTitle}`, 
							`head: ${d.ColTitle}`, 
							`col: ${d.ColSubtitle}`, 
							`val: ${d.Value.toFixed(1)}`,
						].join("\n")
					})
				)
			),
		]
	};
}
function gen_plot_options_mw(data) {
	return {
		marginLeft: 150,
		y: {
			label: null,
			domain: [...new Set(data.plot_data.map((x) => x.ColSubtitle))],
		},
		color: {
			type: data.choices.color_scale,
			domain: [...new Set(data.plot_data.map((x) => x.RowTitle))],
			legend: true
		},
		marks: [
			Plot.lineY(data.plot_data, {y: "ColSubtitle", x: "Value", stroke: "RowTitle"}),
			Plot.dot(data.plot_data, {y: "ColSubtitle", x: "Value", stroke: "RowTitle"}),
			Plot.dot(
				data.plot_data, 
				Plot.pointer({
					y: "ColSubtitle", 
					x: "Value", 
					fill: "orange",
					stroke: "transparent",
					r: 7,
					title: (d) => [
						`Q: ${d.TabTitel1}`, 
						`row: ${d.RowTitle}`, 
						`head: ${d.ColTitle}`, 
						`col: ${d.ColSubtitle}`, 
						`val: ${d.Value.toFixed(1)}`,
					].join("\n")
				}),
			),
		]
	};
}
