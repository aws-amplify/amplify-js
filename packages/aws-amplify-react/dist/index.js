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
    get: function () {
      function get() {
        return _AmplifyUI[key];
      }

      return get;
    }()
  });
});

var _Auth = require('./Auth');

Object.keys(_Auth).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      function get() {
        return _Auth[key];
      }

      return get;
    }()
  });
});

var _Analytics = require('./Analytics');

Object.keys(_Analytics).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      function get() {
        return _Analytics[key];
      }

      return get;
    }()
  });
});

var _Storage = require('./Storage');

Object.keys(_Storage).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      function get() {
        return _Storage[key];
      }

      return get;
    }()
  });
});

var _Widget = require('./Widget');

Object.keys(_Widget).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      function get() {
        return _Widget[key];
      }

      return get;
    }()
  });
});

var _AmplifyTheme = require('./AmplifyTheme');

Object.defineProperty(exports, 'AmplifyTheme', {
  enumerable: true,
  get: function () {
    function get() {
      return _interopRequireDefault(_AmplifyTheme)['default'];
    }

    return get;
  }()
});

var _AmplifyMessageMap = require('./AmplifyMessageMap');

Object.defineProperty(exports, 'AmplifyMessageMapEntries', {
  enumerable: true,
  get: function () {
    function get() {
      return _AmplifyMessageMap.MapEntries;
    }

    return get;
  }()
});
Object.defineProperty(exports, 'transparent1X1', {
  enumerable: true,
  get: function () {
    function get() {
      return _AmplifyUI.transparent1X1;
    }

    return get;
  }()
});
Object.defineProperty(exports, 'white1X1', {
  enumerable: true,
  get: function () {
    function get() {
      return _AmplifyUI.white1X1;
    }

    return get;
  }()
});

var _awsAmplify = require('aws-amplify');

var _AmplifyI18n = require('./AmplifyI18n');

var _AmplifyI18n2 = _interopRequireDefault(_AmplifyI18n);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

_awsAmplify.I18n.putVocabularies(_AmplifyI18n2['default']);