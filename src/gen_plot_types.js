import * as Plot from "@observablehq/plot";
import { numberToLetters } from './utils.js'


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
	const header_start_indices = data.plot_data.map((x, i) => i === 0 || x.ColTitle != data.plot_data[i - 1].ColTitle)
	// data.plot_data = data.plot_data.map(x => ({...x, col_letter: String.fromCharCode(x.ColNo + 94), col_subcol_title: x.col_letter + '. ' + x.ColTitle}))
	// data.plot_data = data.plot_data.map(x => ({...x, col_letter: x.ColNo + 94})).map(x => ({...x, col_subcol_title: x.col_letter + '\n' + x.ColSubtitle}))
	data.plot_data = data.plot_data
		.map(x => ({...x, col_letter: numberToLetters(x.ColNo)}))
		.map((x, i) => ({
			...x, col_subcol_title: x.col_letter  + '\n' + x.ColSubtitle
			// col_subcol_title: header_start_indices[i] ? 
			// x.col_letter  + '\n' + x.ColSubtitle : 
			// x.col_letter 
			// x.col_letter + '\n' + x.ColSubtitle + '\n' + x.ColTitle : 
			// x.col_letter + '\n' + x.ColSubtitle
		}))
	const x_order = [...new Set(data.plot_data.map((x) => x.col_subcol_title))];
	console.log(x_order)
	const fill_order = [...new Set(data.plot_data.map((x) => x.RowTitle))];
	console.log(data.plot_data)
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
						// x: "ColSubtitle",
						x: "col_subcol_title",
						y: "Value", 
						// tickFormat: d => d + '\n' + d,
						// fx: "ColTitle",
						// textAnchor: "start",
						fill: "RowTitle", 
						order: fill_order
					}
				)
			),
			Plot.textY(
				data.plot_data,
				Plot.stackY(
					Plot.groupX(
						{ y: "sum", text: "first" },
						{
							x: "col_subcol_title",
							y: "Value",
							// fx: "ColTitle",
							// textAnchor: "start",
							z: "RowTitle",
							text: (d) => (d.Value == 0 ? null : d.Value.toFixed(0)),
							order: fill_order
						}
					)
				)
			),
			// Plot.axisX({ticks: "ColTitle", tickSize: 28, tickPadding: -11, textAnchor: "start"}),
			// Plot.axisX({ticks: "col_subcol_title", tickSize: 16, tickPadding: -11, textAnchor: "start"}),
					// Plot.tickX(
			// 	data.plot_data,
			// 	{
			// 		x: { tickFormat: d => d.col_subcol_title }
			// 	}
			// )
		]
	};
}
function gen_plot_options_mw(data) {
	const header_start_indices = data.plot_data.map((x, i) => i === 0 || x.ColTitle != data.plot_data[i - 1].ColTitle)
	const subcol_labels = data.plot_data.map(x => x.ColSubtitle);
	const max_text_len = Math.max(...(subcol_labels.map(el => el.length)));
	// data.plot_data = data.plot_data.map(x => ({...x, col_letter: String.fromCharCode(x.ColNo + 94), col_subcol_title: x.col_letter + '. ' + x.ColTitle}))
	// data.plot_data = data.plot_data.map(x => ({...x, col_letter: x.ColNo + 94})).map(x => ({...x, col_subcol_title: x.col_letter + '\n' + x.ColSubtitle}))
	data.plot_data = data.plot_data
		.map(x => ({...x, col_letter: numberToLetters(x.ColNo)}))
		.map((x, i) => ({
			...x, col_subcol_title: x.ColTitle  + ': ' + x.ColSubtitle.padStart(max_text_len, ' ')
		}))
	return {
		marginLeft: 300,
		y: {
			domain: [...new Set(data.plot_data.map((x) => x.col_subcol_title))],
			label: null
		},
		color: {
			type: data.choices.color_scale,
			domain: [...new Set(data.plot_data.map((x) => x.RowTitle))],
			legend: true
		},
		marks: [
			Plot.lineY(data.plot_data, {y: "col_subcol_title", x: "Value", stroke: "RowTitle"}),
			Plot.dot(data.plot_data, {y: "col_subcol_title", x: "Value", stroke: "RowTitle"}),
		]
	};
}
