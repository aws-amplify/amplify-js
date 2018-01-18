const generateRandomId = (size, prefix) => {
    let result = '';
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = size; i > 0; i -= 1) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    const pre = prefix? prefix : '';
    result = pre + '_' + result;
    return result;
}

export { generateRandomId };