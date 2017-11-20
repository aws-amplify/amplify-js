'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.calcKey = calcKey;
function calcKey(file, fileToKey) {
    var name = file.name,
        size = file.size,
        type = file.type;

    var key = encodeURI(name);
    if (fileToKey) {
        var callback_type = typeof fileToKey === 'undefined' ? 'undefined' : _typeof(fileToKey);
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