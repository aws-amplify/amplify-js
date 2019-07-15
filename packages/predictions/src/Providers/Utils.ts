export function makeCamelCase(obj: object, keys ?: string[]) {
  if (!obj) return undefined;
  const newObj = {};
  const keysToRename = keys ? keys : Object.keys(obj);
  keysToRename.forEach(key => {
    if (obj.hasOwnProperty(key)) {
      // change the key to camelcase.
      const camelCaseKey = key.charAt(0).toLowerCase() + key.substr(1);
      Object.assign(newObj, { [camelCaseKey]: obj[key] });
    }
  });
  return newObj;
}

export function makeCamelCaseArray(objArr: object[], keys?: string[]) {
  if (!objArr) return undefined;
  return objArr.map(obj => makeCamelCase(obj, keys));
}

export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = _event => { res(reader.result as ArrayBuffer); };
      reader.onerror = err => { rej(err); };
      try {
          reader.readAsArrayBuffer(blob);
      } catch (err) {
          rej(err); // in case user gives invalid type
      }
  });
}
