import { css } from 'lit'
import * as _ from 'lodash';
import * as XLSX from "xlsx";

export async function xlsx_to_json_array(e) {
    // from here: https://docs.sheetjs.com/docs/demos/local/file#file-api
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    return XLSX.utils.sheet_to_json(wb.Sheets["Daten"]);
}

// inspired from here: https://stackoverflow.com/a/77400725
export const unique_tab_title_by_key = (array = [], key = '') => {
    if (!key) {
        return array;
    }
  
    const mapping = {};
    const result = [];
  
    for (const item of array) {
        if (!mapping[item[key]]) {
            result.push(item.TabTitle);
            mapping[item[key]] = true;
        }
    }
  
    return result;
  };
  
export function distinct(arr, X) {
    return _(arr.map(o => (_.pick(o, X))))
      .uniqWith(_.isEqual)
      .value();
}
  
export const buttonStyles = css`
    select[multiple] option:checked {
        background: grey linear-gradient(40deg, grey 0%, #bbb 100%);
        color: --primary
    }
    select {
        border-radius:5px;
    }

`;