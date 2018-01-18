'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var generateRandomId = function generateRandomId(size, prefix) {
    var result = '';
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = size; i > 0; i -= 1) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    var pre = prefix ? prefix : '';
    result = pre + '_' + result;
    return result;
};

exports.generateRandomId = generateRandomId;