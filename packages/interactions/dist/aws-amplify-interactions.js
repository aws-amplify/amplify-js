(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@aws-amplify/core"), require("aws-sdk/clients/lexruntime"));
	else if(typeof define === 'function' && define.amd)
		define("aws_amplify_interactions", ["@aws-amplify/core", "aws-sdk/clients/lexruntime"], factory);
	else if(typeof exports === 'object')
		exports["aws_amplify_interactions"] = factory(require("@aws-amplify/core"), require("aws-sdk/clients/lexruntime"));
	else
		root["aws_amplify_interactions"] = factory(root["@aws-amplify/core"], root["aws-sdk/clients/lexruntime"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__aws_amplify_core__, __WEBPACK_EXTERNAL_MODULE_aws_sdk_clients_lexruntime__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./lib-esm/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./lib-esm/Interactions.js":
/*!*********************************!*\
  !*** ./lib-esm/Interactions.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_aws_amplify_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Providers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Providers */ "./lib-esm/Providers/index.js");
var __assign = undefined && undefined.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = undefined && undefined.__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};



var logger = new _aws_amplify_core__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"]('Interactions');

var Interactions =
/** @class */
function () {
  /**
   * Initialize PubSub with AWS configurations
   *
   * @param {InteractionsOptions} options - Configuration object for Interactions
   */
  function Interactions(options) {
    this._options = options;
    logger.debug('Interactions Options', this._options);
    this._pluggables = {};
  }

  Interactions.prototype.getModuleName = function () {
    return 'Interactions';
  };
  /**
   *
   * @param {InteractionsOptions} options - Configuration object for Interactions
   * @return {Object} - The current configuration
   */


  Interactions.prototype.configure = function (options) {
    var _this = this;

    var opt = options ? options.Interactions || options : {};
    logger.debug('configure Interactions', {
      opt: opt
    });
    this._options = __assign(__assign({
      bots: {}
    }, opt), opt.Interactions);
    var aws_bots_config = this._options.aws_bots_config;
    var bots_config = this._options.bots;

    if (!Object.keys(bots_config).length && aws_bots_config) {
      // Convert aws_bots_config to bots object
      if (Array.isArray(aws_bots_config)) {
        aws_bots_config.forEach(function (bot) {
          _this._options.bots[bot.name] = bot;
        });
      }
    } // Check if AWSLex provider is already on pluggables


    if (!this._pluggables.AWSLexProvider && bots_config && Object.keys(bots_config).map(function (key) {
      return bots_config[key];
    }).find(function (bot) {
      return !bot.providerName || bot.providerName === 'AWSLexProvider';
    })) {
      this._pluggables.AWSLexProvider = new _Providers__WEBPACK_IMPORTED_MODULE_1__["AWSLexProvider"]();
    }

    Object.keys(this._pluggables).map(function (key) {
      _this._pluggables[key].configure(_this._options.bots);
    });
    return this._options;
  };

  Interactions.prototype.addPluggable = function (pluggable) {
    if (pluggable && pluggable.getCategory() === 'Interactions') {
      if (!this._pluggables[pluggable.getProviderName()]) {
        pluggable.configure(this._options.bots);
        this._pluggables[pluggable.getProviderName()] = pluggable;
        return;
      } else {
        throw new Error('Bot ' + pluggable.getProviderName() + ' already plugged');
      }
    }
  };

  Interactions.prototype.send = function (botname, message) {
    return __awaiter(this, void 0, void 0, function () {
      var botProvider;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this._options.bots || !this._options.bots[botname]) {
              throw new Error('Bot ' + botname + ' does not exist');
            }

            botProvider = this._options.bots[botname].providerName || 'AWSLexProvider';

            if (!this._pluggables[botProvider]) {
              throw new Error('Bot ' + botProvider + ' does not have valid pluggin did you try addPluggable first?');
            }

            return [4
            /*yield*/
            , this._pluggables[botProvider].sendMessage(botname, message)];

          case 1:
            return [2
            /*return*/
            , _a.sent()];
        }
      });
    });
  };

  Interactions.prototype.onComplete = function (botname, callback) {
    if (!this._options.bots || !this._options.bots[botname]) {
      throw new Error('Bot ' + botname + ' does not exist');
    }

    var botProvider = this._options.bots[botname].providerName || 'AWSLexProvider';

    if (!this._pluggables[botProvider]) {
      throw new Error('Bot ' + botProvider + ' does not have valid pluggin did you try addPluggable first?');
    }

    this._pluggables[botProvider].onComplete(botname, callback);
  };

  return Interactions;
}();

/* harmony default export */ __webpack_exports__["default"] = (Interactions);

/***/ }),

/***/ "./lib-esm/Providers/AWSLexProvider.js":
/*!*********************************************!*\
  !*** ./lib-esm/Providers/AWSLexProvider.js ***!
  \*********************************************/
/*! exports provided: AWSLexProvider */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AWSLexProvider", function() { return AWSLexProvider; });
/* harmony import */ var _InteractionsProvider__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./InteractionsProvider */ "./lib-esm/Providers/InteractionsProvider.js");
/* harmony import */ var aws_sdk_clients_lexruntime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! aws-sdk/clients/lexruntime */ "aws-sdk/clients/lexruntime");
/* harmony import */ var aws_sdk_clients_lexruntime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(aws_sdk_clients_lexruntime__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_aws_amplify_core__WEBPACK_IMPORTED_MODULE_2__);
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
var __extends = undefined && undefined.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = undefined && undefined.__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};




var logger = new _aws_amplify_core__WEBPACK_IMPORTED_MODULE_2__["ConsoleLogger"]('AWSLexProvider');

var AWSLexProvider =
/** @class */
function (_super) {
  __extends(AWSLexProvider, _super);

  function AWSLexProvider(options) {
    if (options === void 0) {
      options = {};
    }

    var _this = _super.call(this, options) || this;

    _this.aws_lex = new aws_sdk_clients_lexruntime__WEBPACK_IMPORTED_MODULE_1__({
      region: _this._config.region
    });
    _this._botsCompleteCallback = {};
    return _this;
  }

  AWSLexProvider.prototype.getProviderName = function () {
    return 'AWSLexProvider';
  };

  AWSLexProvider.prototype.responseCallback = function (err, data, res, rej, botname) {
    var _this = this;

    if (err) {
      rej(err);
      return;
    } else {
      // Check if state is fulfilled to resolve onFullfilment promise
      logger.debug('postContent state', data.dialogState);

      if (data.dialogState === 'ReadyForFulfillment' || data.dialogState === 'Fulfilled') {
        if (typeof this._botsCompleteCallback[botname] === 'function') {
          setTimeout(function () {
            return _this._botsCompleteCallback[botname](null, {
              slots: data.slots
            });
          }, 0);
        }

        if (this._config && typeof this._config[botname].onComplete === 'function') {
          setTimeout(function () {
            return _this._config[botname].onComplete(null, {
              slots: data.slots
            });
          }, 0);
        }
      }

      res(data);

      if (data.dialogState === 'Failed') {
        if (typeof this._botsCompleteCallback[botname] === 'function') {
          setTimeout(function () {
            return _this._botsCompleteCallback[botname]('Bot conversation failed');
          }, 0);
        }

        if (this._config && typeof this._config[botname].onComplete === 'function') {
          setTimeout(function () {
            return _this._config[botname].onComplete('Bot conversation failed');
          }, 0);
        }
      }
    }
  };

  AWSLexProvider.prototype.sendMessage = function (botname, message) {
    var _this = this;

    return new Promise(function (res, rej) {
      return __awaiter(_this, void 0, void 0, function () {
        var credentials, params;

        var _this = this;

        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!this._config[botname]) {
                return [2
                /*return*/
                , rej('Bot ' + botname + ' does not exist')];
              }

              return [4
              /*yield*/
              , _aws_amplify_core__WEBPACK_IMPORTED_MODULE_2__["Credentials"].get()];

            case 1:
              credentials = _a.sent();

              if (!credentials) {
                return [2
                /*return*/
                , rej('No credentials')];
              }

              _aws_amplify_core__WEBPACK_IMPORTED_MODULE_2__["AWS"].config.update({
                credentials: credentials
              });
              this.aws_lex = new aws_sdk_clients_lexruntime__WEBPACK_IMPORTED_MODULE_1__({
                region: this._config[botname].region,
                credentials: credentials
              });

              if (typeof message === 'string') {
                params = {
                  botAlias: this._config[botname].alias,
                  botName: botname,
                  inputText: message,
                  userId: credentials.identityId
                };
                logger.debug('postText to lex', message);
                this.aws_lex.postText(params, function (err, data) {
                  _this.responseCallback(err, data, res, rej, botname);
                });
              } else {
                if (message.options['messageType'] === 'voice') {
                  params = {
                    botAlias: this._config[botname].alias,
                    botName: botname,
                    contentType: 'audio/x-l16; sample-rate=16000',
                    inputStream: message.content,
                    userId: credentials.identityId,
                    accept: 'audio/mpeg'
                  };
                } else {
                  params = {
                    botAlias: this._config[botname].alias,
                    botName: botname,
                    contentType: 'text/plain; charset=utf-8',
                    inputStream: message.content,
                    userId: credentials.identityId,
                    accept: 'audio/mpeg'
                  };
                }

                logger.debug('postContent to lex', message);
                this.aws_lex.postContent(params, function (err, data) {
                  _this.responseCallback(err, data, res, rej, botname);
                });
              }

              return [2
              /*return*/
              ];
          }
        });
      });
    });
  };

  AWSLexProvider.prototype.onComplete = function (botname, callback) {
    if (!this._config[botname]) {
      throw new ErrorEvent('Bot ' + botname + ' does not exist');
    }

    this._botsCompleteCallback[botname] = callback;
  };

  return AWSLexProvider;
}(_InteractionsProvider__WEBPACK_IMPORTED_MODULE_0__["AbstractInteractionsProvider"]);



/***/ }),

/***/ "./lib-esm/Providers/InteractionsProvider.js":
/*!***************************************************!*\
  !*** ./lib-esm/Providers/InteractionsProvider.js ***!
  \***************************************************/
/*! exports provided: AbstractInteractionsProvider */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AbstractInteractionsProvider", function() { return AbstractInteractionsProvider; });
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_aws_amplify_core__WEBPACK_IMPORTED_MODULE_0__);
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
var __assign = undefined && undefined.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};


var logger = new _aws_amplify_core__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"]('AbstractInteractionsProvider');

var AbstractInteractionsProvider =
/** @class */
function () {
  function AbstractInteractionsProvider(options) {
    if (options === void 0) {
      options = {};
    }

    this._config = options;
  }

  AbstractInteractionsProvider.prototype.configure = function (config) {
    if (config === void 0) {
      config = {};
    }

    this._config = __assign(__assign({}, this._config), config);
    logger.debug("configure " + this.getProviderName(), this._config);
    return this.options;
  };

  AbstractInteractionsProvider.prototype.getCategory = function () {
    return 'Interactions';
  };

  Object.defineProperty(AbstractInteractionsProvider.prototype, "options", {
    get: function get() {
      return __assign({}, this._config);
    },
    enumerable: true,
    configurable: true
  });
  return AbstractInteractionsProvider;
}();



/***/ }),

/***/ "./lib-esm/Providers/index.js":
/*!************************************!*\
  !*** ./lib-esm/Providers/index.js ***!
  \************************************/
/*! exports provided: AWSLexProvider, AbstractInteractionsProvider */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _AWSLexProvider__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AWSLexProvider */ "./lib-esm/Providers/AWSLexProvider.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AWSLexProvider", function() { return _AWSLexProvider__WEBPACK_IMPORTED_MODULE_0__["AWSLexProvider"]; });

/* harmony import */ var _InteractionsProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./InteractionsProvider */ "./lib-esm/Providers/InteractionsProvider.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AbstractInteractionsProvider", function() { return _InteractionsProvider__WEBPACK_IMPORTED_MODULE_1__["AbstractInteractionsProvider"]; });

/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */



/***/ }),

/***/ "./lib-esm/index.js":
/*!**************************!*\
  !*** ./lib-esm/index.js ***!
  \**************************/
/*! exports provided: default, AWSLexProvider, InteractionsClass */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Interactions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Interactions */ "./lib-esm/Interactions.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InteractionsClass", function() { return _Interactions__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_aws_amplify_core__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Providers_AWSLexProvider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Providers/AWSLexProvider */ "./lib-esm/Providers/AWSLexProvider.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AWSLexProvider", function() { return _Providers_AWSLexProvider__WEBPACK_IMPORTED_MODULE_2__["AWSLexProvider"]; });

/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */


var logger = new _aws_amplify_core__WEBPACK_IMPORTED_MODULE_1__["ConsoleLogger"]('Interactions');
var _instance = null;

if (!_instance) {
  logger.debug('Create Interactions Instance');
  _instance = new _Interactions__WEBPACK_IMPORTED_MODULE_0__["default"](null);
}

var Interactions = _instance;
_aws_amplify_core__WEBPACK_IMPORTED_MODULE_1___default.a.register(Interactions);
/* harmony default export */ __webpack_exports__["default"] = (Interactions);



/***/ }),

/***/ "@aws-amplify/core":
/*!************************************!*\
  !*** external "@aws-amplify/core" ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__aws_amplify_core__;

/***/ }),

/***/ "aws-sdk/clients/lexruntime":
/*!*********************************************!*\
  !*** external "aws-sdk/clients/lexruntime" ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_aws_sdk_clients_lexruntime__;

/***/ })

/******/ });
});
//# sourceMappingURL=aws-amplify-interactions.js.map