'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _GraphQL = require('./GraphQL');

Object.keys(_GraphQL).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _GraphQL[key];
    }
  });
});