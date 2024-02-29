import * as Plot from "@observablehq/plot";
import { bg_col, fg_col } from './utils.js'
import { distinct } from './utils.js'

export class PlotOptions {
    constructor(input_data) {
		let o = input_data.choices
		o.color_scale = input_data.color_scale;
		o.color_scheme = input_data.color_scheme;
		o.show_n = input_data.show_n;
		this.o = o;
		this.plot_data = input_data.plot_data;
		if (this.plot_data.length === 0) {
			return null
		}
		this.pre_process()
		// Execute method bar() or line() depending on the plot type:
		this[o.plot_type]()		
		this.post_process()
    }
	pre_process() {
		const o = this.o;
		const e = {};

		e.x2 = o.xy
		e.x1 = e.x2 === "x" ? "y" : "x"
		e.label_joiner = e.x1 === 'y' ? '\n' : ' '
		e.label_joiner2 = e.x2 === 'y' ? '\n' : ' '
		e.col_lab_fun = (x) => x.ColTitle2,
		e.row_lab_fun = o.color_scale === "categorical" ? 
			(x) => [...new Set([x.RowTitle1, x.RowTitle2])].join(e.label_joiner2) :
			(x) => x.RowValue;
		// e.row_lab_fun = (x) => x.RowValue;
		e.color_order = [...new Set(this.plot_data.sort((a, b) => a.RowNo - b.RowNo).map(e.row_lab_fun))];
		e.x_order = [...new Set(this.plot_data.sort((a, b) => a.ColNo - b.ColNo).map(e.col_lab_fun))];
		e.x_order_gaps = add_gaps_to_xlabels(
			e.x_order, 
			distinct(this.plot_data, ["ColTitle1", "ColNo"]).map(x => x.ColTitle1)
		);
		
		const plot_opts = {}
		plot_opts[e.x2] = e.col_lab_fun
		plot_opts[e.x1] =  "Value"
		e.plot_opts = plot_opts;

		e.color_opts = {
			type: o.color_scale === "ordinal" ? "linear" : o.color_scale,
			scheme: color_schemes_maps[o.color_scale].get(o.color_scheme),
			domain: e.color_order,
			legend: true
		}

		e.x1_opts = {
			label: null,
		}
		e.x2_opts = {
			domain: e.x_order_gaps,
			label: null
		}
		e.n_decimals = this.plot_data[0].RowDecimals;
		e.marginLeft = e.x1 === "y" ? 40 : 210
		e.marginBottom = 60
		e.axis_ = e.x1 === "y" ? "axisX" : "axisY";
		this.e = e;
	}
	bar() {
		const e = this.e;
		
		const p = {};
		p.group_ = e.x1 === "y" ? "groupX" : "groupY";
        p.text_ = e.x1 === "y" ? "textY" : "textX";
        p.stack_ = e.x1 === "y" ? "stackY" : "stackX";
        p.bar_ = e.x1 === "y" ? "barY" : "barX";
        
		
		p.group_args1 = {text: "first"}
		p.group_args1[e.x1] = "sum"
		// p.group_args2 = {...group_args1, text: "first"}
		p.group_args2_bar = {
			...e.plot_opts,
			fill: e.row_lab_fun,
			order: e.color_order,
			title: tooltip_fun(e.n_decimals)
		}
		p.group_args2_text = {
			...e.plot_opts,
			text: (x) => ((x.Value === undefined || x.Value == 0) ? null : x.Value.toFixed(e.n_decimals)),
			z: e.row_lab_fun,
			order: e.color_order,
			title: tooltip_fun(e.n_decimals),
			// put halo around text:
			// https://observablehq.com/plot/marks/text#text-options
			stroke: bg_col,
			strokeWidth: 3,
			fill: fg_col

		}
		p.group_args2_text_n = {
			...e.plot_opts,
			text: (x) => ((x.Value === undefined || x.Value == 0) ? null : 'N = ' + x.ColValidCases),
			order: e.color_order,
		}
		const is_x = this.o.xy === "x";
		p.group_args2_text_n[is_x ? "dy" : "dx"] = is_x ? -15 : 10
		is_x ? p.group_args2_text_n.lineAnchor = "bottom" : p.group_args2_text_n.textAnchor = "start"
		this.p = p;
		this.bar_plot_options()
	}
	bar_plot_options() {
		const p = this.p
		const bar_opts = Plot[p.group_](p.group_args1, p.group_args2_bar)
		const text_opts = Plot[p.group_](p.group_args1, p.group_args2_text)
		
		this.options = {
			marginTop: 30,
			marginRight: 70,
			marginLeft: this.e.marginLeft,
			marginBottom: this.e.marginBottom,
			color: this.e.color_opts,
			marks: [
				Plot[p.bar_](this.plot_data, Plot[p.stack_](bar_opts)),
				// (explicit form of this):
				// Plot[p.bar_](this.plot_data, p.bar_opts),
				// https://talk.observablehq.com/t/how-to-display-text-in-each-level-of-a-stacked-bar-chart-made-with-plot/6510/2
				this.o.color_scale === "ordinal" ? null : Plot[p.text_](this.plot_data, Plot[p.stack_](text_opts)),
				// only show if there 10 different color values at max...:
				// color_order.length > 10? null : text_(data.plot_data, stack_(text_opts)),
				this.o.show_n ? Plot.text(this.plot_data, Plot[p.group_](p.group_args1, p.group_args2_text_n)) : null,
			]
		};
	}
	
	line() {
		var p = {};
		const o = this.o;
		const e = this.e;
		p.line_opts = {
			...e.plot_opts,
			stroke: e.row_lab_fun
		}
	
		p.dot_opts = {
			...p.line_opts,
			fill: e.row_lab_fun,
			stroke: "transparent",
			r: 7,
			title: tooltip_fun(e.n_decimals)
		}
		this.p = p;
		this.line_plot_options()
	}
	line_plot_options() {
		this.options = {
			marginLeft: this.e.marginLeft,
			marginBottom: this.e.marginBottom,
			color: this.e.color_opts,
			marks: [
				Plot.lineY(this.plot_data, this.p.line_opts),
				Plot.dot(this.plot_data, this.p.dot_opts),
				// x2 === "x" ? Plot.axisX({textAnchor: "start"}) : null
			]
		};
	}
	post_process() {
		this.options[this.e.x2] = this.e.x2_opts
		this.options[this.e.x1] = this.e.x1_opts
		this.options.width = 1000
		this.options.height = 600
		this.options.style = {fontSize: "16px"}
		this.options.color.className = "large-font"
		set_axis_labels(this)
	}
}

function tooltip_fun(n_decimals) {
	return (x) => [
		// `Q: ${x.TabTitle}`, 
		`row: ${x.RowTitle1}`, 
		// only write row2 if differing from row1:
		x.RowTitle1 === x.RowTitle2 ? 
			null : 
			`row2: ${x.RowTitle2}`, 
		x.RowValue && `row value: ${x.RowValue}`,
		`header: ${x.ColTitle1}`, 
		x.ColTitle2 && `column: ${x.ColTitle2}`, 
		// if an MW value is not defined, 
		// it would lead to an error, for a line plot without this check:
		x.Value === undefined ?
			null :
			`value: ${x.Value.toFixed(n_decimals)}`,
		`N: ${x.ColValidCases.toFixed(0)}`,
			x.ColMean === undefined ?
			null :
		`mean: ${x.ColMean.toFixed(1)}`,
		null

	].join("\n")
}


// from here: 
// https://observablehq.com/@observablehq/plot-scales#schemeo
// and
// https://observablehq.com/@observablehq/plot-scales#schemec

const color_scheme_ordinal = new Map([
	["Blues", "blues"],
	["Greens", "greens"],
	["Greys", "greys"],
	["Purples", "purples"],
	["Reds", "reds"],
	["Oranges", "oranges"],
	["Turbo", "turbo"],
	["Viridis", "viridis"],
	["Magma", "magma"],
	["Inferno", "inferno"],
	["Plasma", "plasma"],
	["Cividis", "cividis"],
	["Cubehelix", "cubehelix"],
	["Warm", "warm"],
	["Cool", "cool"],
	["BuGn", "bugn"],
	["BuPu", "bupu"],
	["GnBu", "gnbu"],
	["OrRd", "orrd"],
	["PuBuGn", "pubugn"],
	["PuBu", "pubu"],
	["PuRd", "purd"],
	["RdPu", "rdpu"],
	["YlGnBu", "ylgnbu"],
	["YlGn", "ylgn"],
	["YlOrBr", "ylorbr"],
	["YlOrRd", "ylorrd"],
	["BrBG", "brbg"],
	["PRGn", "prgn"],
	["PiYG", "piyg"],
	["PuOr", "puor"],
	["RdBu", "rdbu"],
	["RdGy", "rdgy"],
	["RdYlBu", "rdylbu"],
	["RdYlGn", "rdylgn"],
	["Spectral", "spectral"],
	["BuRd", "burd"],
	["BuYlRd", "buylrd"],
	// doesn't make sense here:
	// ["Rainbow (cyclical)", "rainbow"],
	// ["Sinebow (cyclical)", "sinebow"]
])

const color_scheme_discrete = new Map([
	["Accent", "accent"],
	["Category10", "category10"],
	["Dark2", "dark2"],
	["Paired", "paired"],
	["Pastel1", "pastel1"],
	["Pastel2", "pastel2"],
	["Set1", "set1"],
	["Set2", "set2"],
	["Set3", "set3"],
	["Tableau10", "tableau10"]
])

const color_schemes_maps = {
	"ordinal": color_scheme_ordinal,
	"categorical": color_scheme_discrete,
}

export const all_color_schemes = {
	"ordinal": [...color_schemes_maps.ordinal.keys()],
	"categorical": [...color_schemes_maps.categorical.keys()],
}

function add_gaps_to_xlabels(x_order, col_titles) {
	// https://stackoverflow.com/questions/64204535/how-to-find-indexes-where-value-changes/64204722#64204722
	const diff_indices = [];
	col_titles.map((el, index) => {
		return col_titles[index-1] !== el && index > 0 && diff_indices.push(index)
	})
	const x_order_gaps = [...x_order];
	for (let i = diff_indices.length - 1; i >= 0; i--) {
		const diff_index = diff_indices[i];
		x_order_gaps.splice(diff_index, 0, null)
		
	}
	return x_order_gaps

}

function set_axis_labels(plot_options) {
	const xy = plot_options.e.x2;
	const plot_width = plot_options.options.width;
	const n_bars = plot_options.options[xy].domain.length
	const font_size = Number(plot_options.options.style.fontSize.replace(/px/, ""));
	const text_width = xy === "x" ? Math.floor(plot_width / n_bars / font_size * 0.8) : 7
	// small margin (in pixel) from where the text starts (counting from the left of the bars on the x-axis):
	const text_margin_left = 5;
	
	const subheader_tick_opts = {
		textAnchor: "start",
		// TODO: replace with HeadNo to prevent tohuwabohu if there are the same `ColTitle1`s for different headers (HeadNo is deleted from the input data at the moment...):
		z: "ColTitle1",
		text: "ColTitle1",
		tickSize: 0,
		tickFormat: x => x.ColTitle2,
		dx: xy === "x" ? -text_width / 2 * font_size + text_margin_left : -200,
		dy: xy === "x" ? 30 : 0,
		label: null,
		lineWidth: xy === "x" ? text_width : n_bars,
		textOverflow: "ellipsis-end",
	};
	subheader_tick_opts[xy] = "ColTitle2"
	const header_tick_opts = {
		textAnchor: "start",
		text: "ColTitle2",
		z: "ColNo",
		tickFormat: x => x.ColTitle2,
		tickSize: 0,
		label: null,
		dx: xy === "x" ? -text_width / 2 * font_size + text_margin_left : -100,
		lineWidth: text_width,
		textOverflow: "ellipsis-end",
	};
	header_tick_opts[xy] = "ColTitle2"
	plot_options.options.marks.push(Plot[plot_options.e.axis_](
		plot_options.plot_data, 
		Plot.selectFirst(subheader_tick_opts)
	))
	plot_options.options.marks.push(Plot[plot_options.e.axis_](
		plot_options.plot_data, 
		Plot.selectFirst(header_tick_opts)
	))
}