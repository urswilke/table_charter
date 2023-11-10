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

// TODO: find better solution for ... [x.ColTitle1, x.ColTitle2].join('\n') ...
function gen_plot_options_cat(data) {
	return new CatOptions(data).opts()
}

class CatOptions {
	constructor(data) {
		this.data = data;
		this.x_order = [...new Set(data.plot_data.map((x) => [x.ColTitle1, x.ColTitle2].join('\n')))];
		this.fill_order = [...new Set(data.plot_data.map((x) => x.RowTitle1))];
		this.xy = data.choices.xy
		this.yx = this.xy === "x" ? "y" : "x"
		this.bar_opts = this.get_bar_options()
		this.text_opts = this.get_text_options()
	}
	get_bar_options() {
		const o1 = {}
		o1[this.xy] = "sum"
		const o2 = {
			fill: "RowTitle1",
			order: this.fill_order,
			// another way to add tooltips:
			tip: true,
		}

		o2[this.xy] = "Value"
		o2[this.yx] = (x) => ([x.ColTitle1, x.ColTitle2].join('\n'))

		const res = grouper()
		return res
	}
	get_text_options() {
		const o2 = this.bar_opts
		o2[this.xy]["text"] = "first"
		o2[this.yx]["text"] = (x) => (x.Value == 0 ? null : x.Value.toFixed(0))
		o2["z"] = o2["fill"];
		delete o2["fill"];
		delete o2["tip"];
		return o2
	}
	grouper() {
		return this.xy === "y" ?
			Plot.groupX(this.bar_opts, this.text_opts) :
			Plot.groupY(this.bar_opts, this.text_opts)
	}
	texter() {
		return this.xy === "y" ?
			Plot.textY(this.data, this.stacker()) :
			Plot.textX(this.data, this.stacker())
	}
	stacker() {
		return this.xy === "y" ?
			Plot.stackY(this.text_opts) :
			Plot.stackX(this.text_opts)
	}
	bar_plotter(data, options, xy) {
		return xy === "y" ?
			Plot.barY.apply(null, [data, options]) :
			Plot.barX.apply(null, [data, options])
	}
	opts() {
		const x = {
			// y: {
			// 	label: null,
			// },
			color: {
				type: this.data.choices.color_scale,
				domain: this.fill_order,
				legend: true
			},
			marks: [
				bar_plotter(
					this.data.plot_data,
					// https://talk.observablehq.com/t/how-to-display-text-in-each-level-of-a-stacked-bar-chart-made-with-plot/6510/2
					this.bar_opts,
					this.xy
				),
				this.texter(),
			]
		};
		x[this.yx] = ({
			domain: this.x_order,
			label: null
		})
		return x
	}
}
function grouper(o1, o2, xy) {
	return xy === "y" ?
		Plot.groupX(o1, o2) :
		Plot.groupY(o1, o2)
}
function texter(data, options, xy) {
	return xy === "y" ?
		Plot.textY.apply(null, [data, options]) :
		Plot.textX.apply(null, [data, options])
}
function stacker(options, xy) {
	return xy === "y" ?
		Plot.stackY.apply(null, [options]) :
		Plot.stackX.apply(null, [options])
}
function bar_plotter(data, options, xy) {
	return xy === "y" ?
		Plot.barY.apply(null, [data, options]) :
		Plot.barX.apply(null, [data, options])
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
