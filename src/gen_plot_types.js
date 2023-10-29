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
	const x_order = [...new Set(data.plot_data.map((x) => x.ColTitle2))];
	const fill_order = [...new Set(data.plot_data.map((x) => x.RowTitle1))];
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
						x: "ColTitle2", 
						y: "Value", 
						fill: "RowTitle1",
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
							x: "ColTitle2",
							y: "Value",
							z: "RowTitle1",
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
						x: "ColTitle2", 
						y: "Value",
						z: "RowTitle1",
						stroke: "white",
						order: fill_order,
						fill: "orange",
						// https://talk.observablehq.com/t/plot-tooltips-available/6583/5:
						stroke: "transparent",
						strokeWidth: 500,
						title: (d) => [
							`Q: ${d.TabTitle}`, 
							`row: ${d.RowTitle1}`, 
							`head: ${d.ColTitle1}`, 
							`col: ${d.ColTitle2}`, 
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
		x: {
			label: null,
		},
		y: {
			label: null,
			domain: [...new Set(data.plot_data.map((x) => x.ColTitle2))],
		},
		color: {
			type: data.choices.color_scale,
			domain: [...new Set(data.plot_data.map((x) => x.RowTitle1))],
			legend: true
		},
		marks: [
			Plot.lineY(data.plot_data, {y: "ColTitle2", x: "Value", stroke: "RowTitle1"}),
			Plot.dot(data.plot_data, {y: "ColTitle2", x: "Value", stroke: "RowTitle1"}),
			Plot.dot(
				data.plot_data, 
				Plot.pointer({
					y: "ColTitle2", 
					x: "Value", 
					fill: "RowTitle1",
					stroke: "transparent",
					r: 7,
					title: (d) => [
						`Q: ${d.TabTitle}`, 
						`row: ${d.RowTitle1}`, 
						`head: ${d.ColTitle1}`, 
						`col: ${d.ColTitle2}`, 
						`val: ${d.Value.toFixed(1)}`,
					].join("\n")
				}),
			),
		]
	};
}
