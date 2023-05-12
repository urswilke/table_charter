import "./action-button.js"
import './ojs-plot.js'
import { xlsx_to_json_array } from './readExcel.js'
import './tableBookData.js'

import sharedStyles from './styles.css?inline';

var xlsx_data;
const tb_data = document.querySelector("#table-book-data")

async function upload_xlsx(e) {
    xlsx_data = await xlsx_to_json_array(e);
    tb_data.data = xlsx_data
    console.log(tb_data)
    plot_histogramm()
}
document.getElementById("file-upload").addEventListener('change', upload_xlsx);

function plot_histogramm() {
	const data = tb_data.sel_data()
	plotObj.data = data
	plotObj.updatePlotOptions()
}

const plotObj = document.querySelector('#plot-element');
plotObj.appStyles = sharedStyles;


const regenButton = document.querySelector("#regen")
regenButton.onClick = plot_histogramm;


