'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.white1X1 = exports.transparent1X1 = exports.AmplifyMessageMapEntries = exports.AmplifyTheme = undefined;

var _AmplifyUI = require('./AmplifyUI');

Object.keys(_AmplifyUI).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _AmplifyUI[key];
    }
  });
});

var _Auth = require('./Auth');

Object.keys(_Auth).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Auth[key];
    }
  });
});

var _Analytics = require('./Analytics');

Object.keys(_Analytics).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Analytics[key];
    }
  });
});

var _Storage = require('./Storage');

Object.keys(_Storage).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Storage[key];
    }
  });
});

var _Widget = require('./Widget');

Object.keys(_Widget).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Widget[key];
    }
  });
});

var _API = require('./API');

Object.keys(_API).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _API[key];
    }
  });
});

var _AmplifyTheme = require('./AmplifyTheme');

Object.defineProperty(exports, 'AmplifyTheme', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_AmplifyTheme).default;
  }
});

var _AmplifyMessageMap = require('./AmplifyMessageMap');

Object.defineProperty(exports, 'AmplifyMessageMapEntries', {
  enumerable: true,
  get: function get() {
    return _AmplifyMessageMap.MapEntries;
  }
});
Object.defineProperty(exports, 'transparent1X1', {
  enumerable: true,
  get: function get() {
    return _AmplifyUI.transparent1X1;
  }
});
Object.defineProperty(exports, 'white1X1', {
  enumerable: true,
  get: function get() {
    return _AmplifyUI.white1X1;
  }
});

var _awsAmplify = require('aws-amplify');

var _AmplifyI18n = require('./AmplifyI18n');

var _AmplifyI18n2 = _interopRequireDefault(_AmplifyI18n);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_awsAmplify.I18n.putVocabularies(_AmplifyI18n2.default);