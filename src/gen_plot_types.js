import * as Plot from "@observablehq/plot";

export function gen_plot_options(data) {
	if (data.choices === undefined) {
		return {};
	}
	data["op"] = prep_options(data)
	let plot_type = data.choices.plot_type;

	var res;
	if (plot_type === "bar") {
		res = gen_bar_plot_options(data);
	}
	if (plot_type === "line") {
		res = gen_line_plot_options(data);
	}

	// TODO: adjust size according to size of containing element
	// cf https://stackoverflow.com/a/66760690
	res.width = 1000
	res.height = 600
	
	res.style = {fontSize: "16px"}

	res.color.className = "large-font"
	return res
}

function prep_options(data) {
	const x2 = data.choices.xy
    const x1 = x2 === "x" ? "y" : "x"
	const label_joiner = x1 === 'y' ? '\n' : ' '
	const label_joiner2 = x2 === 'y' ? '\n' : ' '
	const col_lab_fun = (x) => [x.ColTitle1, x.ColTitle2].join(label_joiner)
    const row_lab_fun = data.color_scale === "categorical" ? 
		(x) => [...new Set([x.RowTitle1, x.RowTitle2])].join(label_joiner2) :
		(x) => x.RowValue;
    // const row_lab_fun = (x) => x.RowValue;
	const color_order = [...new Set(data.plot_data.sort((a, b) => a.RowNo - b.RowNo).map(row_lab_fun))];
	const x_order = [...new Set(data.plot_data.sort((a, b) => a.ColNo - b.ColNo).map(col_lab_fun))];
	
	const plot_opts = {}
	plot_opts[x2] = col_lab_fun
	plot_opts[x1] =  "Value"
	const x1_opts = {
		label: null,
	}
	const x2_opts = {
        domain: x_order,
        label: null
    }

	return {
		x2,
		x1,
		label_joiner,
		label_joiner2,
		col_lab_fun,
		row_lab_fun,
		color_order,
		x_order,
		plot_opts,
		x1_opts,
		x2_opts,
	}
}

function gen_bar_plot_options(data) {
	const { 
		x2: x2,
		x1: x1,
		// label_joiner: label_joiner,
		// label_joiner2: label_joiner2,
		// col_lab_fun: col_lab_fun,
		row_lab_fun: row_lab_fun,
		color_order: color_order,
		x_order: x_order,
		plot_opts: plot_opts,
		x1_opts: x1_opts,
		x2_opts: x2_opts,
	} = data.op

	const group_ 	= x1 === "y" ? Plot.groupX  : Plot.groupY
    const text_ 	= x1 === "y" ? Plot.textY   : Plot.textX
    const stack_ 	= x1 === "y" ? Plot.stackY  : Plot.stackX
    const bar_      = x1 === "y" ? Plot.barY 	: Plot.barX
    
	const group_args1 = {text: "first"}
	group_args1[x1] = "sum"
	// const group_args2 = {...group_args1, text: "first"}
	const n_decimals = data.plot_data[0].RowDecimals;
	const group_args2_bar = {
		...plot_opts,
		fill: row_lab_fun,
		order: color_order,
		title: tooltip_fun(n_decimals)
	}
	const group_args2_text = {
		...plot_opts,
		text: (x) => ((x.Value === undefined || x.Value == 0) ? null : x.Value.toFixed(n_decimals)),
		z: row_lab_fun,
		order: color_order,
		title: tooltip_fun(n_decimals)
	}
	const bar_opts = group_(group_args1, group_args2_bar)
	const text_opts = group_(group_args1, group_args2_text)

    const res = {
		marginLeft: x1 === "y" ? 40 : 260,
		marginBottom: 60,
        color: {
			type: data.color_scale === "ordinal" ? "linear" : data.color_scale,
			scheme: color_schemes_maps[data.color_scale].get(data.color_scheme),
            domain: color_order,
            legend: true
        },
        marks: [
            bar_(data.plot_data, bar_opts),
			// https://talk.observablehq.com/t/how-to-display-text-in-each-level-of-a-stacked-bar-chart-made-with-plot/6510/2
            data.color_scale === "ordinal" ? null : text_(data.plot_data, stack_(text_opts)),
            // only show if there 10 different color values at max...:
			// color_order.length > 10? null : text_(data.plot_data, stack_(text_opts)),
        ]
    };
    res[x2] = x2_opts
	res[x1] = x1_opts
	return res
}

function gen_line_plot_options(data) {
	const { 
		x2: x2,
		x1: x1,
		// label_joiner: label_joiner,
		// label_joiner2: label_joiner2,
		// col_lab_fun: col_lab_fun,
		row_lab_fun: row_lab_fun,
		color_order: color_order,
		x_order: x_order,
		plot_opts: plot_opts,
		x1_opts: x1_opts,
		x2_opts: x2_opts
	} = data.op

	let line_opts = {
		...plot_opts,
		stroke: row_lab_fun
	}

	const n_decimals = data.plot_data[0].RowDecimals;
	let dot_opts = {
		...line_opts,
		fill: row_lab_fun,
		symbol: row_lab_fun,
		stroke: "transparent",
		r: 7,
		title: tooltip_fun(n_decimals)
	}

	
	const res = {
		marginLeft: x2 === "x" ? 40 : 160,
		marginBottom: 60,
		color: {
			type: data.color_scale === "ordinal" ? "linear" : data.color_scale,
			scheme: color_schemes_maps[data.color_scale].get(data.color_scheme),
			domain: color_order,
		},
		symbol: {legend: true},
		marks: [
			Plot.lineY(data.plot_data, line_opts),
			Plot.dot(data.plot_data, dot_opts),
			// x2 === "x" ? Plot.axisX({textAnchor: "start"}) : null
		]
	};
	res[x1] = x1_opts
	res[x2] = x2_opts

	return res
}

function tooltip_fun(n_decimals) {
	return (x) => [
		// `Q: ${x.TabTitle}`, 
		`row: ${x.RowTitle1}`, 
		// only write row2 if differing from row1:
		x.RowTitle1 === x.RowTitle2 ? 
			null : 
			`row2: ${x.RowTitle2}`, 
		`row value: ${x.RowValue}`,
		`header: ${x.ColTitle1}`, 
		`column: ${x.ColTitle2}`, 
		// if an MW value is not defined, 
		// it would lead to an error, for a line plot without this check:
		x.Value === undefined ?
			null :
			`value: ${x.Value.toFixed(n_decimals)}`,
		`N: ${x.ColValidCases.toFixed(0)}`
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