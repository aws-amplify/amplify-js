export function calcKey(file, fileToKey) {
    const { name, size, type } = file;
    let key = encodeURI(name);
    if (fileToKey) {
        const callback_type = typeof fileToKey;
        if (callback_type === 'string') {
            key = fileToKey;
        } else if (callback_type === 'function') {
            key = fileToKey({ name: name, size: size, type: type });
        } else {
            key = encodeURI(JSON.stringify(fileToKey));
        }
        if (!key) {
            key = 'empty_key';
        }
    }

    return key.replace(/\s/g, '_');
}
