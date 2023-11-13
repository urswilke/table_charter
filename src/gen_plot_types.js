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
    const x1 = data.choices.xy
    const x2 = x1 === "x" ? "y" : "x"
	const group_ 	= x1 === "y" ? Plot.groupX  : Plot.groupY
    const text_ 	= x1 === "y" ? Plot.textY   : Plot.textX
    const stack_ 	= x1 === "y" ? Plot.stackY  : Plot.stackX
    const bar_      = x1 === "y" ? Plot.barY 	: Plot.barX
    
  
    function get_bar_options() {
        const o1 = {}
        o1[x1] = "sum"
        const o2 = {
            fill: "RowTitle1",
            order: fill_order,
            tip: true,
        }
    
        o2[x1] = "Value"
        o2[x2] = (x) => ([x.ColTitle1, x.ColTitle2].join('\n'))
    
        const res = group_(
            o1,
            o2
        )
        return res
    }
    
    function get_text_options() {
        const o2 = get_bar_options(x1)
        o2[x1]["text"] = "first"
        o2[x2]["text"] = (x) => (x.Value == 0 ? null : x.Value.toFixed(0))
        o2["z"] = o2["fill"];
        delete o2["fill"];
        delete o2["tip"];
        return o2
    }




    const res = {
		marginLeft: x1 === "y" ? 40 : 120,
        color: {
            // type: "nominal",
            domain: fill_order,
            legend: true
        },
        marks: [
            bar_(
                data.plot_data,
                // https://talk.observablehq.com/t/how-to-display-text-in-each-level-of-a-stacked-bar-chart-made-with-plot/6510/2
                get_bar_options()
            ),
            text_(
                data.plot_data,
                stack_(
					get_text_options()
				)
            ),
        ]
    };
    res[x2] = ({
        domain: x_order,
        label: null
    })
	res[x1] = {
		label: null,
	}
	return res
}










function gen_plot_options_mw(data) {
	const x1 = data.choices.xy
    const x2 = x1 === "x" ? "y" : "x"
	const label_joiner = x1 === 'x' ? '\n' : ' '
	const col_lab_fun = (x) => [x.ColTitle1, x.ColTitle2].join(label_joiner)
    const row_lab_fun = (x) => x.RowTitle1;
	const color_order = [...new Set(data.plot_data.map(row_lab_fun))];

	let line_opts = {
		stroke: row_lab_fun
	}
	line_opts[x1] = col_lab_fun
	line_opts[x2] =  "Value"
	let dot_opts1 = {
		stroke: row_lab_fun
	}
	dot_opts1[x1] = col_lab_fun
	dot_opts1[x2] =  "Value"
	
	let dot_opts2 = dot_opts1
	dot_opts2["fill"] = row_lab_fun,
	dot_opts2["stroke"] = "transparent",
	dot_opts2["r"] = 7,
	dot_opts2["title"] = (x) => [
		`Q: ${x.TabTitle}`, 
		`row: ${x.RowTitle1}`, 
		`head: ${x.ColTitle1}`, 
		`col: ${x.ColTitle2}`, 
		`val: ${x.Value.toFixed(1)}`,
	].join("\n")

	
	const res = {
		marginLeft: x1 === "x" ? 40 : 160,
		color: {
			type: data.choices.color_scale,
			domain: color_order,
			legend: true
		},
		marks: [
			Plot.lineY(data.plot_data, line_opts),
			Plot.dot(data.plot_data, dot_opts1),
			Plot.dot(data.plot_data, dot_opts2),
		]
	};
	res[x2] = {
		label: null,
	} 
	res[x1] = {
		label: null,
		domain: [...new Set(data.plot_data.map(col_lab_fun))],
	}

	return res
}
