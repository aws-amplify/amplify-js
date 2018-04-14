'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _trackLifecycle = require('./trackLifecycle');

Object.keys(_trackLifecycle).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _trackLifecycle[key];
    }
  });
});

var _trackUpdate = require('./trackUpdate');

Object.keys(_trackUpdate).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _trackUpdate[key];
    }
  });
});