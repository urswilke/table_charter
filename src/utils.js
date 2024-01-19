import { css } from 'lit'
import { chain, pick, uniqWith, isEqual } from 'lodash';
// import * as aq from 'arquero';
import * as XLSX from "xlsx";

export async function xlsx_to_json_array(e) {
    // from here: https://docs.sheetjs.com/docs/demos/local/file#file-api
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    return XLSX.utils.sheet_to_json(wb.Sheets["Daten"]);
}

  
export function distinct(arr, X) {
    // with arquero, something like:
    // aq.from(arr).groupby(X).rollup()
    return chain(arr.map(o => (pick(o, X))))
      .uniqWith(isEqual)
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