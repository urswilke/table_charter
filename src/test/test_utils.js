// https://stackoverflow.com/questions/68678126/search-for-keys-in-nested-object-and-delete-them/68678816#68678816
export function remove_fields(data, deleteKeys) {
    // There is nothing to be done if `data` is not an object,
    // but for example "user01" or "MALE".
    if (typeof data != "object") return;
    if (!data) return; // null object

    for (const key in data) {
        if (deleteKeys.includes(key)) {
            delete data[key];
        } else {
            // If the key is not deleted from the current `data` object,
            // the value should be check for black-listed keys.
            remove_fields(data[key], deleteKeys);
        }
    }
}



export function clean_data(object) {
    Object
        .entries(object)
        .forEach(([k, v]) => {
            if (v && typeof v === 'object') {
                clean_data(v);
            }
            if (v && typeof v === 'object' && !Object.keys(v).length || v === null || v === undefined || v === 0) {
                if (Array.isArray(object)) {
                    object.splice(k, 1);
                } else {
                    delete object[k];
                }
            }
        });
    return object;
}

// https://stackoverflow.com/questions/59707654/replace-nested-field-values-in-an-object?noredirect=1&lq=1/59707848#59707848
export const replace_field_strings = input => {
    if (Array.isArray(input)) {
      input.forEach(el => replace_field_strings(el));
    }
    if (typeof input === 'object' && !!input) {
      Object.keys(input).forEach(k => {
        if (
            typeof input[k] === 'string'
            // ['domain', "tab_title"].includes(k)
        ) {
            input[k] = input[k].replace(/\n/g, ' --> ');
        } else 
        replace_field_strings(input[k]);
      });
    }
    
  };