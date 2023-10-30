import * as Plot from "@observablehq/plot";

export function gen_plot_options(data) {
	if (data.length === 0 || data.plot_data.length === 0) {
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
	const x_order = [...new Set(data.plot_data.map((x) => [x.ColTitle1, x.ColTitle2].join('\n')))];
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
						x: (x) => ([x.ColTitle1, x.ColTitle2].join('\n')),
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
							x: (x) => ([x.ColTitle1, x.ColTitle2].join('\n')),
							y: "Value",
							z: "RowTitle1",
							text: (x) => (x.Value == 0 ? null : x.Value.toFixed(0)),
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
						title: (x) => [
							`Q: ${x.TabTitle}`, 
							`row: ${x.RowTitle1}`, 
							`head: ${x.ColTitle1}`, 
							`col: ${x.ColTitle2}`, 
							`val: ${x.Value.toFixed(1)}`,
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
			domain: [...new Set(data.plot_data.map((x) => [x.ColTitle1, x.ColTitle2].join('\n')))],
		},
		color: {
			type: data.choices.color_scale,
			domain: [...new Set(data.plot_data.map((x) => x.RowTitle1))],
			legend: true
		},
		marks: [
			Plot.lineY(data.plot_data, {
				y: (x) => ([x.ColTitle1, x.ColTitle2].join('\n')),
				x: "Value", 
				stroke: "RowTitle1"
			}),
			Plot.dot(data.plot_data, {
				y: (x) => ([x.ColTitle1, x.ColTitle2].join('\n')),
				x: "Value", 
				stroke: "RowTitle1"
			}),
			Plot.dot(
				data.plot_data, 
				Plot.pointer({
					y: (x) => ([x.ColTitle1, x.ColTitle2].join('\n')),
					x: "Value", 
					fill: "RowTitle1",
					stroke: "transparent",
					r: 7,
					title: (x) => [
						`Q: ${x.TabTitle}`, 
						`row: ${x.RowTitle1}`, 
						`head: ${x.ColTitle1}`, 
						`col: ${x.ColTitle2}`, 
						`val: ${x.Value.toFixed(1)}`,
					].join("\n")
				}),
			),
		]
	};
}
