(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@aws-amplify/analytics"), require("@aws-amplify/api"), require("@aws-amplify/auth"), require("@aws-amplify/core"), require("@aws-amplify/interactions"), require("@aws-amplify/storage"), require("@aws-amplify/ui"), require("@aws-amplify/ui/dist/style.css"), require("@aws-amplify/xr"), require("react"));
	else if(typeof define === 'function' && define.amd)
		define("aws_amplify_react", ["@aws-amplify/analytics", "@aws-amplify/api", "@aws-amplify/auth", "@aws-amplify/core", "@aws-amplify/interactions", "@aws-amplify/storage", "@aws-amplify/ui", "@aws-amplify/ui/dist/style.css", "@aws-amplify/xr", "react"], factory);
	else if(typeof exports === 'object')
		exports["aws_amplify_react"] = factory(require("@aws-amplify/analytics"), require("@aws-amplify/api"), require("@aws-amplify/auth"), require("@aws-amplify/core"), require("@aws-amplify/interactions"), require("@aws-amplify/storage"), require("@aws-amplify/ui"), require("@aws-amplify/ui/dist/style.css"), require("@aws-amplify/xr"), require("react"));
	else
		root["aws_amplify_react"] = factory(root["@aws-amplify/analytics"], root["@aws-amplify/api"], root["@aws-amplify/auth"], root["@aws-amplify/core"], root["@aws-amplify/interactions"], root["@aws-amplify/storage"], root["@aws-amplify/ui"], root["@aws-amplify/ui/dist/style.css"], root["@aws-amplify/xr"], root["react"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__aws_amplify_analytics__, __WEBPACK_EXTERNAL_MODULE__aws_amplify_api__, __WEBPACK_EXTERNAL_MODULE__aws_amplify_auth__, __WEBPACK_EXTERNAL_MODULE__aws_amplify_core__, __WEBPACK_EXTERNAL_MODULE__aws_amplify_interactions__, __WEBPACK_EXTERNAL_MODULE__aws_amplify_storage__, __WEBPACK_EXTERNAL_MODULE__aws_amplify_ui__, __WEBPACK_EXTERNAL_MODULE__aws_amplify_ui_dist_style_css__, __WEBPACK_EXTERNAL_MODULE__aws_amplify_xr__, __WEBPACK_EXTERNAL_MODULE_react__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./lib/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../node_modules/object-assign/index.js":
/*!********************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/object-assign/index.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),

/***/ "../../node_modules/prop-types/checkPropTypes.js":
/*!**************************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/prop-types/checkPropTypes.js ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var printWarning = function() {};

if (true) {
  var ReactPropTypesSecret = __webpack_require__(/*! ./lib/ReactPropTypesSecret */ "../../node_modules/prop-types/lib/ReactPropTypesSecret.js");
  var loggedTypeFailures = {};
  var has = Function.call.bind(Object.prototype.hasOwnProperty);

  printWarning = function(text) {
    var message = 'Warning: ' + text;
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (true) {
    for (var typeSpecName in typeSpecs) {
      if (has(typeSpecs, typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          if (typeof typeSpecs[typeSpecName] !== 'function') {
            var err = Error(
              (componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' +
              'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.'
            );
            err.name = 'Invariant Violation';
            throw err;
          }
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        if (error && !(error instanceof Error)) {
          printWarning(
            (componentName || 'React class') + ': type specification of ' +
            location + ' `' + typeSpecName + '` is invalid; the type checker ' +
            'function must return `null` or an `Error` but returned a ' + typeof error + '. ' +
            'You may have forgotten to pass an argument to the type checker ' +
            'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
            'shape all require an argument).'
          );
        }
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          printWarning(
            'Failed ' + location + ' type: ' + error.message + (stack != null ? stack : '')
          );
        }
      }
    }
  }
}

/**
 * Resets warning cache when testing.
 *
 * @private
 */
checkPropTypes.resetWarningCache = function() {
  if (true) {
    loggedTypeFailures = {};
  }
}

module.exports = checkPropTypes;


/***/ }),

/***/ "../../node_modules/prop-types/factoryWithTypeCheckers.js":
/*!***********************************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/prop-types/factoryWithTypeCheckers.js ***!
  \***********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var ReactIs = __webpack_require__(/*! react-is */ "../../node_modules/react-is/index.js");
var assign = __webpack_require__(/*! object-assign */ "../../node_modules/object-assign/index.js");

var ReactPropTypesSecret = __webpack_require__(/*! ./lib/ReactPropTypesSecret */ "../../node_modules/prop-types/lib/ReactPropTypesSecret.js");
var checkPropTypes = __webpack_require__(/*! ./checkPropTypes */ "../../node_modules/prop-types/checkPropTypes.js");

var has = Function.call.bind(Object.prototype.hasOwnProperty);
var printWarning = function() {};

if (true) {
  printWarning = function(text) {
    var message = 'Warning: ' + text;
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };
}

function emptyFunctionThatReturnsNull() {
  return null;
}

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    elementType: createElementTypeTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker,
    exact: createStrictShapeTypeChecker,
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (true) {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          var err = new Error(
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
          err.name = 'Invariant Violation';
          throw err;
        } else if ( true && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            printWarning(
              'You are manually calling a React.PropTypes validation ' +
              'function for the `' + propFullName + '` prop on `' + componentName  + '`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.'
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunctionThatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!ReactIs.isValidElementType(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      if (true) {
        if (arguments.length > 1) {
          printWarning(
            'Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' +
            'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).'
          );
        } else {
          printWarning('Invalid argument supplied to oneOf, expected an array.');
        }
      }
      return emptyFunctionThatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
        var type = getPreciseType(value);
        if (type === 'symbol') {
          return String(value);
        }
        return value;
      });
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (has(propValue, key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
       true ? printWarning('Invalid argument supplied to oneOfType, expected an instance of array.') : undefined;
      return emptyFunctionThatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        printWarning(
          'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' +
          'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.'
        );
        return emptyFunctionThatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createStrictShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      // We need to check all keys in case some are required but missing from
      // props.
      var allKeys = assign({}, props[propName], shapeTypes);
      for (var key in allKeys) {
        var checker = shapeTypes[key];
        if (!checker) {
          return new PropTypeError(
            'Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' +
            '\nBad object: ' + JSON.stringify(props[propName], null, '  ') +
            '\nValid keys: ' +  JSON.stringify(Object.keys(shapeTypes), null, '  ')
          );
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // falsy value can't be a Symbol
    if (!propValue) {
      return false;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};


/***/ }),

/***/ "../../node_modules/prop-types/index.js":
/*!*****************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/prop-types/index.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

if (true) {
  var ReactIs = __webpack_require__(/*! react-is */ "../../node_modules/react-is/index.js");

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = __webpack_require__(/*! ./factoryWithTypeCheckers */ "../../node_modules/prop-types/factoryWithTypeCheckers.js")(ReactIs.isElement, throwOnDirectAccess);
} else {}


/***/ }),

/***/ "../../node_modules/prop-types/lib/ReactPropTypesSecret.js":
/*!************************************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/prop-types/lib/ReactPropTypesSecret.js ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;


/***/ }),

/***/ "../../node_modules/qr.js/lib/8BitByte.js":
/*!*******************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/qr.js/lib/8BitByte.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var mode = __webpack_require__(/*! ./mode */ "../../node_modules/qr.js/lib/mode.js");

function QR8bitByte(data) {
	this.mode = mode.MODE_8BIT_BYTE;
	this.data = data;
}

QR8bitByte.prototype = {

	getLength : function(buffer) {
		return this.data.length;
	},
	
	write : function(buffer) {
		for (var i = 0; i < this.data.length; i++) {
			// not JIS ...
			buffer.put(this.data.charCodeAt(i), 8);
		}
	}
};

module.exports = QR8bitByte;



/***/ }),

/***/ "../../node_modules/qr.js/lib/BitBuffer.js":
/*!********************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/qr.js/lib/BitBuffer.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function QRBitBuffer() {
	this.buffer = new Array();
	this.length = 0;
}

QRBitBuffer.prototype = {

	get : function(index) {
		var bufIndex = Math.floor(index / 8);
		return ( (this.buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
	},
	
	put : function(num, length) {
		for (var i = 0; i < length; i++) {
			this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
		}
	},
	
	getLengthInBits : function() {
		return this.length;
	},
	
	putBit : function(bit) {
	
		var bufIndex = Math.floor(this.length / 8);
		if (this.buffer.length <= bufIndex) {
			this.buffer.push(0);
		}
	
		if (bit) {
			this.buffer[bufIndex] |= (0x80 >>> (this.length % 8) );
		}
	
		this.length++;
	}
};

module.exports = QRBitBuffer;


/***/ }),

/***/ "../../node_modules/qr.js/lib/ErrorCorrectLevel.js":
/*!****************************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/qr.js/lib/ErrorCorrectLevel.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {
	L : 1,
	M : 0,
	Q : 3,
	H : 2
};



/***/ }),

/***/ "../../node_modules/qr.js/lib/Polynomial.js":
/*!*********************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/qr.js/lib/Polynomial.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var math = __webpack_require__(/*! ./math */ "../../node_modules/qr.js/lib/math.js");

function QRPolynomial(num, shift) {

	if (num.length == undefined) {
		throw new Error(num.length + "/" + shift);
	}

	var offset = 0;

	while (offset < num.length && num[offset] == 0) {
		offset++;
	}

	this.num = new Array(num.length - offset + shift);
	for (var i = 0; i < num.length - offset; i++) {
		this.num[i] = num[i + offset];
	}
}

QRPolynomial.prototype = {

	get : function(index) {
		return this.num[index];
	},
	
	getLength : function() {
		return this.num.length;
	},
	
	multiply : function(e) {
	
		var num = new Array(this.getLength() + e.getLength() - 1);
	
		for (var i = 0; i < this.getLength(); i++) {
			for (var j = 0; j < e.getLength(); j++) {
				num[i + j] ^= math.gexp(math.glog(this.get(i) ) + math.glog(e.get(j) ) );
			}
		}
	
		return new QRPolynomial(num, 0);
	},
	
	mod : function(e) {
	
		if (this.getLength() - e.getLength() < 0) {
			return this;
		}
	
		var ratio = math.glog(this.get(0) ) - math.glog(e.get(0) );
	
		var num = new Array(this.getLength() );
		
		for (var i = 0; i < this.getLength(); i++) {
			num[i] = this.get(i);
		}
		
		for (var i = 0; i < e.getLength(); i++) {
			num[i] ^= math.gexp(math.glog(e.get(i) ) + ratio);
		}
	
		// recursive call
		return new QRPolynomial(num, 0).mod(e);
	}
};

module.exports = QRPolynomial;


/***/ }),

/***/ "../../node_modules/qr.js/lib/QRCode.js":
/*!*****************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/qr.js/lib/QRCode.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var BitByte = __webpack_require__(/*! ./8BitByte */ "../../node_modules/qr.js/lib/8BitByte.js");
var RSBlock = __webpack_require__(/*! ./RSBlock */ "../../node_modules/qr.js/lib/RSBlock.js");
var BitBuffer = __webpack_require__(/*! ./BitBuffer */ "../../node_modules/qr.js/lib/BitBuffer.js");
var util = __webpack_require__(/*! ./util */ "../../node_modules/qr.js/lib/util.js");
var Polynomial = __webpack_require__(/*! ./Polynomial */ "../../node_modules/qr.js/lib/Polynomial.js");

function QRCode(typeNumber, errorCorrectLevel) {
	this.typeNumber = typeNumber;
	this.errorCorrectLevel = errorCorrectLevel;
	this.modules = null;
	this.moduleCount = 0;
	this.dataCache = null;
	this.dataList = [];
}

// for client side minification
var proto = QRCode.prototype;

proto.addData = function(data) {
	var newData = new BitByte(data);
	this.dataList.push(newData);
	this.dataCache = null;
};

proto.isDark = function(row, col) {
	if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
		throw new Error(row + "," + col);
	}
	return this.modules[row][col];
};

proto.getModuleCount = function() {
	return this.moduleCount;
};

proto.make = function() {
	// Calculate automatically typeNumber if provided is < 1
	if (this.typeNumber < 1 ){
		var typeNumber = 1;
		for (typeNumber = 1; typeNumber < 40; typeNumber++) {
			var rsBlocks = RSBlock.getRSBlocks(typeNumber, this.errorCorrectLevel);

			var buffer = new BitBuffer();
			var totalDataCount = 0;
			for (var i = 0; i < rsBlocks.length; i++) {
				totalDataCount += rsBlocks[i].dataCount;
			}

			for (var i = 0; i < this.dataList.length; i++) {
				var data = this.dataList[i];
				buffer.put(data.mode, 4);
				buffer.put(data.getLength(), util.getLengthInBits(data.mode, typeNumber) );
				data.write(buffer);
			}
			if (buffer.getLengthInBits() <= totalDataCount * 8)
				break;
		}
		this.typeNumber = typeNumber;
	}
	this.makeImpl(false, this.getBestMaskPattern() );
};

proto.makeImpl = function(test, maskPattern) {
	
	this.moduleCount = this.typeNumber * 4 + 17;
	this.modules = new Array(this.moduleCount);
	
	for (var row = 0; row < this.moduleCount; row++) {
		
		this.modules[row] = new Array(this.moduleCount);
		
		for (var col = 0; col < this.moduleCount; col++) {
			this.modules[row][col] = null;//(col + row) % 3;
		}
	}

	this.setupPositionProbePattern(0, 0);
	this.setupPositionProbePattern(this.moduleCount - 7, 0);
	this.setupPositionProbePattern(0, this.moduleCount - 7);
	this.setupPositionAdjustPattern();
	this.setupTimingPattern();
	this.setupTypeInfo(test, maskPattern);
	
	if (this.typeNumber >= 7) {
		this.setupTypeNumber(test);
	}

	if (this.dataCache == null) {
		this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
	}

	this.mapData(this.dataCache, maskPattern);
};

proto.setupPositionProbePattern = function(row, col)  {
	
	for (var r = -1; r <= 7; r++) {
		
		if (row + r <= -1 || this.moduleCount <= row + r) continue;
		
		for (var c = -1; c <= 7; c++) {
			
			if (col + c <= -1 || this.moduleCount <= col + c) continue;
			
			if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
					|| (0 <= c && c <= 6 && (r == 0 || r == 6) )
					|| (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
				this.modules[row + r][col + c] = true;
			} else {
				this.modules[row + r][col + c] = false;
			}
		}		
	}		
};

proto.getBestMaskPattern = function() {

	var minLostPoint = 0;
	var pattern = 0;

	for (var i = 0; i < 8; i++) {
		
		this.makeImpl(true, i);

		var lostPoint = util.getLostPoint(this);

		if (i == 0 || minLostPoint >  lostPoint) {
			minLostPoint = lostPoint;
			pattern = i;
		}
	}

	return pattern;
};

proto.createMovieClip = function(target_mc, instance_name, depth) {

	var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
	var cs = 1;

	this.make();

	for (var row = 0; row < this.modules.length; row++) {
		
		var y = row * cs;
		
		for (var col = 0; col < this.modules[row].length; col++) {

			var x = col * cs;
			var dark = this.modules[row][col];
		
			if (dark) {
				qr_mc.beginFill(0, 100);
				qr_mc.moveTo(x, y);
				qr_mc.lineTo(x + cs, y);
				qr_mc.lineTo(x + cs, y + cs);
				qr_mc.lineTo(x, y + cs);
				qr_mc.endFill();
			}
		}
	}
	
	return qr_mc;
};

proto.setupTimingPattern = function() {
	
	for (var r = 8; r < this.moduleCount - 8; r++) {
		if (this.modules[r][6] != null) {
			continue;
		}
		this.modules[r][6] = (r % 2 == 0);
	}

	for (var c = 8; c < this.moduleCount - 8; c++) {
		if (this.modules[6][c] != null) {
			continue;
		}
		this.modules[6][c] = (c % 2 == 0);
	}
};

proto.setupPositionAdjustPattern = function() {

	var pos = util.getPatternPosition(this.typeNumber);
	
	for (var i = 0; i < pos.length; i++) {
	
		for (var j = 0; j < pos.length; j++) {
		
			var row = pos[i];
			var col = pos[j];
			
			if (this.modules[row][col] != null) {
				continue;
			}
			
			for (var r = -2; r <= 2; r++) {
			
				for (var c = -2; c <= 2; c++) {
				
					if (r == -2 || r == 2 || c == -2 || c == 2
							|| (r == 0 && c == 0) ) {
						this.modules[row + r][col + c] = true;
					} else {
						this.modules[row + r][col + c] = false;
					}
				}
			}
		}
	}
};

proto.setupTypeNumber = function(test) {

	var bits = util.getBCHTypeNumber(this.typeNumber);

	for (var i = 0; i < 18; i++) {
		var mod = (!test && ( (bits >> i) & 1) == 1);
		this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
	}

	for (var i = 0; i < 18; i++) {
		var mod = (!test && ( (bits >> i) & 1) == 1);
		this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
	}
};

proto.setupTypeInfo = function(test, maskPattern) {

	var data = (this.errorCorrectLevel << 3) | maskPattern;
	var bits = util.getBCHTypeInfo(data);

	// vertical		
	for (var i = 0; i < 15; i++) {

		var mod = (!test && ( (bits >> i) & 1) == 1);

		if (i < 6) {
			this.modules[i][8] = mod;
		} else if (i < 8) {
			this.modules[i + 1][8] = mod;
		} else {
			this.modules[this.moduleCount - 15 + i][8] = mod;
		}
	}

	// horizontal
	for (var i = 0; i < 15; i++) {

		var mod = (!test && ( (bits >> i) & 1) == 1);
		
		if (i < 8) {
			this.modules[8][this.moduleCount - i - 1] = mod;
		} else if (i < 9) {
			this.modules[8][15 - i - 1 + 1] = mod;
		} else {
			this.modules[8][15 - i - 1] = mod;
		}
	}

	// fixed module
	this.modules[this.moduleCount - 8][8] = (!test);
};

proto.mapData = function(data, maskPattern) {
	
	var inc = -1;
	var row = this.moduleCount - 1;
	var bitIndex = 7;
	var byteIndex = 0;
	
	for (var col = this.moduleCount - 1; col > 0; col -= 2) {

		if (col == 6) col--;

		while (true) {

			for (var c = 0; c < 2; c++) {
				
				if (this.modules[row][col - c] == null) {
					
					var dark = false;

					if (byteIndex < data.length) {
						dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
					}

					var mask = util.getMask(maskPattern, row, col - c);

					if (mask) {
						dark = !dark;
					}
					
					this.modules[row][col - c] = dark;
					bitIndex--;

					if (bitIndex == -1) {
						byteIndex++;
						bitIndex = 7;
					}
				}
			}
							
			row += inc;

			if (row < 0 || this.moduleCount <= row) {
				row -= inc;
				inc = -inc;
				break;
			}
		}
	}
};

QRCode.PAD0 = 0xEC;
QRCode.PAD1 = 0x11;

QRCode.createData = function(typeNumber, errorCorrectLevel, dataList) {
	
	var rsBlocks = RSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
	
	var buffer = new BitBuffer();
	
	for (var i = 0; i < dataList.length; i++) {
		var data = dataList[i];
		buffer.put(data.mode, 4);
		buffer.put(data.getLength(), util.getLengthInBits(data.mode, typeNumber) );
		data.write(buffer);
	}

	// calc num max data.
	var totalDataCount = 0;
	for (var i = 0; i < rsBlocks.length; i++) {
		totalDataCount += rsBlocks[i].dataCount;
	}

	if (buffer.getLengthInBits() > totalDataCount * 8) {
		throw new Error("code length overflow. ("
			+ buffer.getLengthInBits()
			+ ">"
			+  totalDataCount * 8
			+ ")");
	}

	// end code
	if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
		buffer.put(0, 4);
	}

	// padding
	while (buffer.getLengthInBits() % 8 != 0) {
		buffer.putBit(false);
	}

	// padding
	while (true) {
		
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD0, 8);
		
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD1, 8);
	}

	return QRCode.createBytes(buffer, rsBlocks);
};

QRCode.createBytes = function(buffer, rsBlocks) {

	var offset = 0;
	
	var maxDcCount = 0;
	var maxEcCount = 0;
	
	var dcdata = new Array(rsBlocks.length);
	var ecdata = new Array(rsBlocks.length);
	
	for (var r = 0; r < rsBlocks.length; r++) {

		var dcCount = rsBlocks[r].dataCount;
		var ecCount = rsBlocks[r].totalCount - dcCount;

		maxDcCount = Math.max(maxDcCount, dcCount);
		maxEcCount = Math.max(maxEcCount, ecCount);
		
		dcdata[r] = new Array(dcCount);
		
		for (var i = 0; i < dcdata[r].length; i++) {
			dcdata[r][i] = 0xff & buffer.buffer[i + offset];
		}
		offset += dcCount;
		
		var rsPoly = util.getErrorCorrectPolynomial(ecCount);
		var rawPoly = new Polynomial(dcdata[r], rsPoly.getLength() - 1);

		var modPoly = rawPoly.mod(rsPoly);
		ecdata[r] = new Array(rsPoly.getLength() - 1);
		for (var i = 0; i < ecdata[r].length; i++) {
            var modIndex = i + modPoly.getLength() - ecdata[r].length;
			ecdata[r][i] = (modIndex >= 0)? modPoly.get(modIndex) : 0;
		}

	}
	
	var totalCodeCount = 0;
	for (var i = 0; i < rsBlocks.length; i++) {
		totalCodeCount += rsBlocks[i].totalCount;
	}

	var data = new Array(totalCodeCount);
	var index = 0;

	for (var i = 0; i < maxDcCount; i++) {
		for (var r = 0; r < rsBlocks.length; r++) {
			if (i < dcdata[r].length) {
				data[index++] = dcdata[r][i];
			}
		}
	}

	for (var i = 0; i < maxEcCount; i++) {
		for (var r = 0; r < rsBlocks.length; r++) {
			if (i < ecdata[r].length) {
				data[index++] = ecdata[r][i];
			}
		}
	}

	return data;
};

module.exports = QRCode;



/***/ }),

/***/ "../../node_modules/qr.js/lib/RSBlock.js":
/*!******************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/qr.js/lib/RSBlock.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// ErrorCorrectLevel
var ECL = __webpack_require__(/*! ./ErrorCorrectLevel */ "../../node_modules/qr.js/lib/ErrorCorrectLevel.js");

function QRRSBlock(totalCount, dataCount) {
	this.totalCount = totalCount;
	this.dataCount  = dataCount;
}

QRRSBlock.RS_BLOCK_TABLE = [

	// L
	// M
	// Q
	// H

	// 1
	[1, 26, 19],
	[1, 26, 16],
	[1, 26, 13],
	[1, 26, 9],
	
	// 2
	[1, 44, 34],
	[1, 44, 28],
	[1, 44, 22],
	[1, 44, 16],

	// 3
	[1, 70, 55],
	[1, 70, 44],
	[2, 35, 17],
	[2, 35, 13],

	// 4		
	[1, 100, 80],
	[2, 50, 32],
	[2, 50, 24],
	[4, 25, 9],
	
	// 5
	[1, 134, 108],
	[2, 67, 43],
	[2, 33, 15, 2, 34, 16],
	[2, 33, 11, 2, 34, 12],
	
	// 6
	[2, 86, 68],
	[4, 43, 27],
	[4, 43, 19],
	[4, 43, 15],
	
	// 7		
	[2, 98, 78],
	[4, 49, 31],
	[2, 32, 14, 4, 33, 15],
	[4, 39, 13, 1, 40, 14],
	
	// 8
	[2, 121, 97],
	[2, 60, 38, 2, 61, 39],
	[4, 40, 18, 2, 41, 19],
	[4, 40, 14, 2, 41, 15],
	
	// 9
	[2, 146, 116],
	[3, 58, 36, 2, 59, 37],
	[4, 36, 16, 4, 37, 17],
	[4, 36, 12, 4, 37, 13],
	
	// 10		
	[2, 86, 68, 2, 87, 69],
	[4, 69, 43, 1, 70, 44],
	[6, 43, 19, 2, 44, 20],
	[6, 43, 15, 2, 44, 16],

	// 11
	[4, 101, 81],
	[1, 80, 50, 4, 81, 51],
	[4, 50, 22, 4, 51, 23],
	[3, 36, 12, 8, 37, 13],

	// 12
	[2, 116, 92, 2, 117, 93],
	[6, 58, 36, 2, 59, 37],
	[4, 46, 20, 6, 47, 21],
	[7, 42, 14, 4, 43, 15],

	// 13
	[4, 133, 107],
	[8, 59, 37, 1, 60, 38],
	[8, 44, 20, 4, 45, 21],
	[12, 33, 11, 4, 34, 12],

	// 14
	[3, 145, 115, 1, 146, 116],
	[4, 64, 40, 5, 65, 41],
	[11, 36, 16, 5, 37, 17],
	[11, 36, 12, 5, 37, 13],

	// 15
	[5, 109, 87, 1, 110, 88],
	[5, 65, 41, 5, 66, 42],
	[5, 54, 24, 7, 55, 25],
	[11, 36, 12],

	// 16
	[5, 122, 98, 1, 123, 99],
	[7, 73, 45, 3, 74, 46],
	[15, 43, 19, 2, 44, 20],
	[3, 45, 15, 13, 46, 16],

	// 17
	[1, 135, 107, 5, 136, 108],
	[10, 74, 46, 1, 75, 47],
	[1, 50, 22, 15, 51, 23],
	[2, 42, 14, 17, 43, 15],

	// 18
	[5, 150, 120, 1, 151, 121],
	[9, 69, 43, 4, 70, 44],
	[17, 50, 22, 1, 51, 23],
	[2, 42, 14, 19, 43, 15],

	// 19
	[3, 141, 113, 4, 142, 114],
	[3, 70, 44, 11, 71, 45],
	[17, 47, 21, 4, 48, 22],
	[9, 39, 13, 16, 40, 14],

	// 20
	[3, 135, 107, 5, 136, 108],
	[3, 67, 41, 13, 68, 42],
	[15, 54, 24, 5, 55, 25],
	[15, 43, 15, 10, 44, 16],

	// 21
	[4, 144, 116, 4, 145, 117],
	[17, 68, 42],
	[17, 50, 22, 6, 51, 23],
	[19, 46, 16, 6, 47, 17],

	// 22
	[2, 139, 111, 7, 140, 112],
	[17, 74, 46],
	[7, 54, 24, 16, 55, 25],
	[34, 37, 13],

	// 23
	[4, 151, 121, 5, 152, 122],
	[4, 75, 47, 14, 76, 48],
	[11, 54, 24, 14, 55, 25],
	[16, 45, 15, 14, 46, 16],

	// 24
	[6, 147, 117, 4, 148, 118],
	[6, 73, 45, 14, 74, 46],
	[11, 54, 24, 16, 55, 25],
	[30, 46, 16, 2, 47, 17],

	// 25
	[8, 132, 106, 4, 133, 107],
	[8, 75, 47, 13, 76, 48],
	[7, 54, 24, 22, 55, 25],
	[22, 45, 15, 13, 46, 16],

	// 26
	[10, 142, 114, 2, 143, 115],
	[19, 74, 46, 4, 75, 47],
	[28, 50, 22, 6, 51, 23],
	[33, 46, 16, 4, 47, 17],

	// 27
	[8, 152, 122, 4, 153, 123],
	[22, 73, 45, 3, 74, 46],
	[8, 53, 23, 26, 54, 24],
	[12, 45, 15, 28, 46, 16],

	// 28
	[3, 147, 117, 10, 148, 118],
	[3, 73, 45, 23, 74, 46],
	[4, 54, 24, 31, 55, 25],
	[11, 45, 15, 31, 46, 16],

	// 29
	[7, 146, 116, 7, 147, 117],
	[21, 73, 45, 7, 74, 46],
	[1, 53, 23, 37, 54, 24],
	[19, 45, 15, 26, 46, 16],

	// 30
	[5, 145, 115, 10, 146, 116],
	[19, 75, 47, 10, 76, 48],
	[15, 54, 24, 25, 55, 25],
	[23, 45, 15, 25, 46, 16],

	// 31
	[13, 145, 115, 3, 146, 116],
	[2, 74, 46, 29, 75, 47],
	[42, 54, 24, 1, 55, 25],
	[23, 45, 15, 28, 46, 16],

	// 32
	[17, 145, 115],
	[10, 74, 46, 23, 75, 47],
	[10, 54, 24, 35, 55, 25],
	[19, 45, 15, 35, 46, 16],

	// 33
	[17, 145, 115, 1, 146, 116],
	[14, 74, 46, 21, 75, 47],
	[29, 54, 24, 19, 55, 25],
	[11, 45, 15, 46, 46, 16],

	// 34
	[13, 145, 115, 6, 146, 116],
	[14, 74, 46, 23, 75, 47],
	[44, 54, 24, 7, 55, 25],
	[59, 46, 16, 1, 47, 17],

	// 35
	[12, 151, 121, 7, 152, 122],
	[12, 75, 47, 26, 76, 48],
	[39, 54, 24, 14, 55, 25],
	[22, 45, 15, 41, 46, 16],

	// 36
	[6, 151, 121, 14, 152, 122],
	[6, 75, 47, 34, 76, 48],
	[46, 54, 24, 10, 55, 25],
	[2, 45, 15, 64, 46, 16],

	// 37
	[17, 152, 122, 4, 153, 123],
	[29, 74, 46, 14, 75, 47],
	[49, 54, 24, 10, 55, 25],
	[24, 45, 15, 46, 46, 16],

	// 38
	[4, 152, 122, 18, 153, 123],
	[13, 74, 46, 32, 75, 47],
	[48, 54, 24, 14, 55, 25],
	[42, 45, 15, 32, 46, 16],

	// 39
	[20, 147, 117, 4, 148, 118],
	[40, 75, 47, 7, 76, 48],
	[43, 54, 24, 22, 55, 25],
	[10, 45, 15, 67, 46, 16],

	// 40
	[19, 148, 118, 6, 149, 119],
	[18, 75, 47, 31, 76, 48],
	[34, 54, 24, 34, 55, 25],
	[20, 45, 15, 61, 46, 16]
];

QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
	
	var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
	
	if (rsBlock == undefined) {
		throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
	}

	var length = rsBlock.length / 3;
	
	var list = new Array();
	
	for (var i = 0; i < length; i++) {

		var count = rsBlock[i * 3 + 0];
		var totalCount = rsBlock[i * 3 + 1];
		var dataCount  = rsBlock[i * 3 + 2];

		for (var j = 0; j < count; j++) {
			list.push(new QRRSBlock(totalCount, dataCount) );	
		}
	}
	
	return list;
}

QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {

	switch(errorCorrectLevel) {
	case ECL.L :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
	case ECL.M :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
	case ECL.Q :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
	case ECL.H :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
	default :
		return undefined;
	}
}

module.exports = QRRSBlock;


/***/ }),

/***/ "../../node_modules/qr.js/lib/math.js":
/*!***************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/qr.js/lib/math.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var QRMath = {

	glog : function(n) {
	
		if (n < 1) {
			throw new Error("glog(" + n + ")");
		}
		
		return QRMath.LOG_TABLE[n];
	},
	
	gexp : function(n) {
	
		while (n < 0) {
			n += 255;
		}
	
		while (n >= 256) {
			n -= 255;
		}
	
		return QRMath.EXP_TABLE[n];
	},
	
	EXP_TABLE : new Array(256),
	
	LOG_TABLE : new Array(256)

};
	
for (var i = 0; i < 8; i++) {
	QRMath.EXP_TABLE[i] = 1 << i;
}
for (var i = 8; i < 256; i++) {
	QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4]
		^ QRMath.EXP_TABLE[i - 5]
		^ QRMath.EXP_TABLE[i - 6]
		^ QRMath.EXP_TABLE[i - 8];
}
for (var i = 0; i < 255; i++) {
	QRMath.LOG_TABLE[QRMath.EXP_TABLE[i] ] = i;
}

module.exports = QRMath;


/***/ }),

/***/ "../../node_modules/qr.js/lib/mode.js":
/*!***************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/qr.js/lib/mode.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {
	MODE_NUMBER :		1 << 0,
	MODE_ALPHA_NUM : 	1 << 1,
	MODE_8BIT_BYTE : 	1 << 2,
	MODE_KANJI :		1 << 3
};


/***/ }),

/***/ "../../node_modules/qr.js/lib/util.js":
/*!***************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/qr.js/lib/util.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Mode = __webpack_require__(/*! ./mode */ "../../node_modules/qr.js/lib/mode.js");
var Polynomial = __webpack_require__(/*! ./Polynomial */ "../../node_modules/qr.js/lib/Polynomial.js");
var math = __webpack_require__(/*! ./math */ "../../node_modules/qr.js/lib/math.js");

var QRMaskPattern = {
	PATTERN000 : 0,
	PATTERN001 : 1,
	PATTERN010 : 2,
	PATTERN011 : 3,
	PATTERN100 : 4,
	PATTERN101 : 5,
	PATTERN110 : 6,
	PATTERN111 : 7
};

var QRUtil = {

    PATTERN_POSITION_TABLE : [
	    [],
	    [6, 18],
	    [6, 22],
	    [6, 26],
	    [6, 30],
	    [6, 34],
	    [6, 22, 38],
	    [6, 24, 42],
	    [6, 26, 46],
	    [6, 28, 50],
	    [6, 30, 54],		
	    [6, 32, 58],
	    [6, 34, 62],
	    [6, 26, 46, 66],
	    [6, 26, 48, 70],
	    [6, 26, 50, 74],
	    [6, 30, 54, 78],
	    [6, 30, 56, 82],
	    [6, 30, 58, 86],
	    [6, 34, 62, 90],
	    [6, 28, 50, 72, 94],
	    [6, 26, 50, 74, 98],
	    [6, 30, 54, 78, 102],
	    [6, 28, 54, 80, 106],
	    [6, 32, 58, 84, 110],
	    [6, 30, 58, 86, 114],
	    [6, 34, 62, 90, 118],
	    [6, 26, 50, 74, 98, 122],
	    [6, 30, 54, 78, 102, 126],
	    [6, 26, 52, 78, 104, 130],
	    [6, 30, 56, 82, 108, 134],
	    [6, 34, 60, 86, 112, 138],
	    [6, 30, 58, 86, 114, 142],
	    [6, 34, 62, 90, 118, 146],
	    [6, 30, 54, 78, 102, 126, 150],
	    [6, 24, 50, 76, 102, 128, 154],
	    [6, 28, 54, 80, 106, 132, 158],
	    [6, 32, 58, 84, 110, 136, 162],
	    [6, 26, 54, 82, 110, 138, 166],
	    [6, 30, 58, 86, 114, 142, 170]
    ],

    G15 : (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
    G18 : (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
    G15_MASK : (1 << 14) | (1 << 12) | (1 << 10)	| (1 << 4) | (1 << 1),

    getBCHTypeInfo : function(data) {
	    var d = data << 10;
	    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
		    d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) ) ); 	
	    }
	    return ( (data << 10) | d) ^ QRUtil.G15_MASK;
    },

    getBCHTypeNumber : function(data) {
	    var d = data << 12;
	    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
		    d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) ) ); 	
	    }
	    return (data << 12) | d;
    },

    getBCHDigit : function(data) {

	    var digit = 0;

	    while (data != 0) {
		    digit++;
		    data >>>= 1;
	    }

	    return digit;
    },

    getPatternPosition : function(typeNumber) {
	    return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    },

    getMask : function(maskPattern, i, j) {
	    
	    switch (maskPattern) {
		    
	    case QRMaskPattern.PATTERN000 : return (i + j) % 2 == 0;
	    case QRMaskPattern.PATTERN001 : return i % 2 == 0;
	    case QRMaskPattern.PATTERN010 : return j % 3 == 0;
	    case QRMaskPattern.PATTERN011 : return (i + j) % 3 == 0;
	    case QRMaskPattern.PATTERN100 : return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0;
	    case QRMaskPattern.PATTERN101 : return (i * j) % 2 + (i * j) % 3 == 0;
	    case QRMaskPattern.PATTERN110 : return ( (i * j) % 2 + (i * j) % 3) % 2 == 0;
	    case QRMaskPattern.PATTERN111 : return ( (i * j) % 3 + (i + j) % 2) % 2 == 0;

	    default :
		    throw new Error("bad maskPattern:" + maskPattern);
	    }
    },

    getErrorCorrectPolynomial : function(errorCorrectLength) {

	    var a = new Polynomial([1], 0);

	    for (var i = 0; i < errorCorrectLength; i++) {
		    a = a.multiply(new Polynomial([1, math.gexp(i)], 0) );
	    }

	    return a;
    },

    getLengthInBits : function(mode, type) {

	    if (1 <= type && type < 10) {

		    // 1 - 9

		    switch(mode) {
		    case Mode.MODE_NUMBER 	: return 10;
		    case Mode.MODE_ALPHA_NUM 	: return 9;
		    case Mode.MODE_8BIT_BYTE	: return 8;
		    case Mode.MODE_KANJI  	: return 8;
		    default :
			    throw new Error("mode:" + mode);
		    }

	    } else if (type < 27) {

		    // 10 - 26

		    switch(mode) {
		    case Mode.MODE_NUMBER 	: return 12;
		    case Mode.MODE_ALPHA_NUM 	: return 11;
		    case Mode.MODE_8BIT_BYTE	: return 16;
		    case Mode.MODE_KANJI  	: return 10;
		    default :
			    throw new Error("mode:" + mode);
		    }

	    } else if (type < 41) {

		    // 27 - 40

		    switch(mode) {
		    case Mode.MODE_NUMBER 	: return 14;
		    case Mode.MODE_ALPHA_NUM	: return 13;
		    case Mode.MODE_8BIT_BYTE	: return 16;
		    case Mode.MODE_KANJI  	: return 12;
		    default :
			    throw new Error("mode:" + mode);
		    }

	    } else {
		    throw new Error("type:" + type);
	    }
    },

    getLostPoint : function(qrCode) {
	    
	    var moduleCount = qrCode.getModuleCount();
	    
	    var lostPoint = 0;
	    
	    // LEVEL1
	    
	    for (var row = 0; row < moduleCount; row++) {

		    for (var col = 0; col < moduleCount; col++) {

			    var sameCount = 0;
			    var dark = qrCode.isDark(row, col);

				for (var r = -1; r <= 1; r++) {

				    if (row + r < 0 || moduleCount <= row + r) {
					    continue;
				    }

				    for (var c = -1; c <= 1; c++) {

					    if (col + c < 0 || moduleCount <= col + c) {
						    continue;
					    }

					    if (r == 0 && c == 0) {
						    continue;
					    }

					    if (dark == qrCode.isDark(row + r, col + c) ) {
						    sameCount++;
					    }
				    }
			    }

			    if (sameCount > 5) {
				    lostPoint += (3 + sameCount - 5);
			    }
		    }
	    }

	    // LEVEL2

	    for (var row = 0; row < moduleCount - 1; row++) {
		    for (var col = 0; col < moduleCount - 1; col++) {
			    var count = 0;
			    if (qrCode.isDark(row,     col    ) ) count++;
			    if (qrCode.isDark(row + 1, col    ) ) count++;
			    if (qrCode.isDark(row,     col + 1) ) count++;
			    if (qrCode.isDark(row + 1, col + 1) ) count++;
			    if (count == 0 || count == 4) {
				    lostPoint += 3;
			    }
		    }
	    }

	    // LEVEL3

	    for (var row = 0; row < moduleCount; row++) {
		    for (var col = 0; col < moduleCount - 6; col++) {
			    if (qrCode.isDark(row, col)
					    && !qrCode.isDark(row, col + 1)
					    &&  qrCode.isDark(row, col + 2)
					    &&  qrCode.isDark(row, col + 3)
					    &&  qrCode.isDark(row, col + 4)
					    && !qrCode.isDark(row, col + 5)
					    &&  qrCode.isDark(row, col + 6) ) {
				    lostPoint += 40;
			    }
		    }
	    }

	    for (var col = 0; col < moduleCount; col++) {
		    for (var row = 0; row < moduleCount - 6; row++) {
			    if (qrCode.isDark(row, col)
					    && !qrCode.isDark(row + 1, col)
					    &&  qrCode.isDark(row + 2, col)
					    &&  qrCode.isDark(row + 3, col)
					    &&  qrCode.isDark(row + 4, col)
					    && !qrCode.isDark(row + 5, col)
					    &&  qrCode.isDark(row + 6, col) ) {
				    lostPoint += 40;
			    }
		    }
	    }

	    // LEVEL4
	    
	    var darkCount = 0;

	    for (var col = 0; col < moduleCount; col++) {
		    for (var row = 0; row < moduleCount; row++) {
			    if (qrCode.isDark(row, col) ) {
				    darkCount++;
			    }
		    }
	    }
	    
	    var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
	    lostPoint += ratio * 10;

	    return lostPoint;		
    }
};

module.exports = QRUtil;


/***/ }),

/***/ "../../node_modules/qrcode.react/lib/index.js":
/*!***********************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/qrcode.react/lib/index.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

var React = __webpack_require__(/*! react */ "react");

var PropTypes = __webpack_require__(/*! prop-types */ "../../node_modules/prop-types/index.js"); // qr.js doesn't handle error level of zero (M) so we need to do it right,
// thus the deep require.


var QRCodeImpl = __webpack_require__(/*! qr.js/lib/QRCode */ "../../node_modules/qr.js/lib/QRCode.js");

var ErrorCorrectLevel = __webpack_require__(/*! qr.js/lib/ErrorCorrectLevel */ "../../node_modules/qr.js/lib/ErrorCorrectLevel.js");

function getBackingStorePixelRatio(ctx) {
  return (// $FlowFixMe
    ctx.webkitBackingStorePixelRatio || // $FlowFixMe
    ctx.mozBackingStorePixelRatio || // $FlowFixMe
    ctx.msBackingStorePixelRatio || // $FlowFixMe
    ctx.oBackingStorePixelRatio || // $FlowFixMe
    ctx.backingStorePixelRatio || 1
  );
} // Convert from UTF-16, forcing the use of byte-mode encoding in our QR Code.
// This allows us to encode Hanji, Kanji, emoji, etc. Ideally we'd do more
// detection and not resort to byte-mode if possible, but we're trading off
// a smaller library for a smaller amount of data we can potentially encode.
// Based on http://jonisalonen.com/2012/from-utf-16-to-utf-8-in-javascript/


function convertStr(str) {
  var out = '';

  for (var i = 0; i < str.length; i++) {
    var charcode = str.charCodeAt(i);

    if (charcode < 0x0080) {
      out += String.fromCharCode(charcode);
    } else if (charcode < 0x0800) {
      out += String.fromCharCode(0xc0 | charcode >> 6);
      out += String.fromCharCode(0x80 | charcode & 0x3f);
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      out += String.fromCharCode(0xe0 | charcode >> 12);
      out += String.fromCharCode(0x80 | charcode >> 6 & 0x3f);
      out += String.fromCharCode(0x80 | charcode & 0x3f);
    } else {
      // This is a surrogate pair, so we'll reconsitute the pieces and work
      // from that
      i++;
      charcode = 0x10000 + ((charcode & 0x3ff) << 10 | str.charCodeAt(i) & 0x3ff);
      out += String.fromCharCode(0xf0 | charcode >> 18);
      out += String.fromCharCode(0x80 | charcode >> 12 & 0x3f);
      out += String.fromCharCode(0x80 | charcode >> 6 & 0x3f);
      out += String.fromCharCode(0x80 | charcode & 0x3f);
    }
  }

  return out;
}

var DEFAULT_PROPS = {
  size: 128,
  level: 'L',
  bgColor: '#FFFFFF',
  fgColor: '#000000'
};
var PROP_TYPES = {
  value: PropTypes.string.isRequired,
  size: PropTypes.number,
  level: PropTypes.oneOf(['L', 'M', 'Q', 'H']),
  bgColor: PropTypes.string,
  fgColor: PropTypes.string
};

var QRCodeCanvas =
/*#__PURE__*/
function (_React$Component) {
  _inherits(QRCodeCanvas, _React$Component);

  function QRCodeCanvas() {
    var _ref;

    var _temp, _this;

    _classCallCheck(this, QRCodeCanvas);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _possibleConstructorReturn(_this, (_temp = _this = _possibleConstructorReturn(this, (_ref = QRCodeCanvas.__proto__ || Object.getPrototypeOf(QRCodeCanvas)).call.apply(_ref, [this].concat(args))), Object.defineProperty(_assertThisInitialized(_this), "_canvas", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    }), _temp));
  }

  _createClass(QRCodeCanvas, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      var _this2 = this;

      return Object.keys(QRCodeCanvas.propTypes).some(function (k) {
        return _this2.props[k] !== nextProps[k];
      });
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.update();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.update();
    }
  }, {
    key: "update",
    value: function update() {
      var _props = this.props,
          value = _props.value,
          size = _props.size,
          level = _props.level,
          bgColor = _props.bgColor,
          fgColor = _props.fgColor; // We'll use type===-1 to force QRCode to automatically pick the best type

      var qrcode = new QRCodeImpl(-1, ErrorCorrectLevel[level]);
      qrcode.addData(convertStr(value));
      qrcode.make();

      if (this._canvas != null) {
        var canvas = this._canvas;
        var ctx = canvas.getContext('2d');

        if (!ctx) {
          return;
        }

        var cells = qrcode.modules;

        if (cells === null) {
          return;
        }

        var tileW = size / cells.length;
        var tileH = size / cells.length;
        var scale = (window.devicePixelRatio || 1) / getBackingStorePixelRatio(ctx);
        canvas.height = canvas.width = size * scale;
        ctx.scale(scale, scale);
        cells.forEach(function (row, rdx) {
          row.forEach(function (cell, cdx) {
            ctx && (ctx.fillStyle = cell ? fgColor : bgColor);
            var w = Math.ceil((cdx + 1) * tileW) - Math.floor(cdx * tileW);
            var h = Math.ceil((rdx + 1) * tileH) - Math.floor(rdx * tileH);
            ctx && ctx.fillRect(Math.round(cdx * tileW), Math.round(rdx * tileH), w, h);
          });
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var _props2 = this.props,
          value = _props2.value,
          size = _props2.size,
          level = _props2.level,
          bgColor = _props2.bgColor,
          fgColor = _props2.fgColor,
          style = _props2.style,
          otherProps = _objectWithoutProperties(_props2, ["value", "size", "level", "bgColor", "fgColor", "style"]);

      var canvasStyle = _extends({
        height: size,
        width: size
      }, style);

      return React.createElement("canvas", _extends({
        style: canvasStyle,
        height: size,
        width: size,
        ref: function ref(_ref2) {
          return _this3._canvas = _ref2;
        }
      }, otherProps));
    }
  }]);

  return QRCodeCanvas;
}(React.Component);

Object.defineProperty(QRCodeCanvas, "defaultProps", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: DEFAULT_PROPS
});
Object.defineProperty(QRCodeCanvas, "propTypes", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: PROP_TYPES
});

var QRCodeSVG =
/*#__PURE__*/
function (_React$Component2) {
  _inherits(QRCodeSVG, _React$Component2);

  function QRCodeSVG() {
    _classCallCheck(this, QRCodeSVG);

    return _possibleConstructorReturn(this, (QRCodeSVG.__proto__ || Object.getPrototypeOf(QRCodeSVG)).apply(this, arguments));
  }

  _createClass(QRCodeSVG, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      var _this4 = this;

      return Object.keys(QRCodeCanvas.propTypes).some(function (k) {
        return _this4.props[k] !== nextProps[k];
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _props3 = this.props,
          value = _props3.value,
          size = _props3.size,
          level = _props3.level,
          bgColor = _props3.bgColor,
          fgColor = _props3.fgColor,
          otherProps = _objectWithoutProperties(_props3, ["value", "size", "level", "bgColor", "fgColor"]); // We'll use type===-1 to force QRCode to automatically pick the best type


      var qrcode = new QRCodeImpl(-1, ErrorCorrectLevel[level]);
      qrcode.addData(convertStr(value));
      qrcode.make();
      var cells = qrcode.modules;

      if (cells === null) {
        return;
      } // Drawing strategy: instead of a rect per module, we're going to create a
      // single path for the dark modules and layer that on top of a light rect,
      // for a total of 2 DOM nodes. We pay a bit more in string concat but that's
      // way faster than DOM ops.
      // For level 1, 441 nodes -> 2
      // For level 40, 31329 -> 2


      var ops = [];
      cells.forEach(function (row, y) {
        var lastIsDark = false;
        var start = null;
        row.forEach(function (cell, x) {
          if (!cell && start !== null) {
            // M0 0h7v1H0z injects the space with the move and dropd the comma,
            // saving a char per operation
            ops.push("M".concat(start, " ").concat(y, "h").concat(x - start, "v1H").concat(start, "z"));
            start = null;
            return;
          } // end of row, clean up or skip


          if (x === row.length - 1) {
            if (!cell) {
              // We would have closed the op above already so this can only mean
              // 2+ light modules in a row.
              return;
            }

            if (start === null) {
              // Just a single dark module.
              ops.push("M".concat(x, ",").concat(y, " h1v1H").concat(x, "z"));
            } else {
              // Otherwise finish the current line.
              ops.push("M".concat(start, ",").concat(y, " h").concat(x + 1 - start, "v1H").concat(start, "z"));
            }

            return;
          }

          if (cell && start === null) {
            start = x;
          }
        });
      });
      return React.createElement("svg", _extends({
        shapeRendering: "crispEdges",
        height: size,
        width: size,
        viewBox: "0 0 ".concat(cells.length, " ").concat(cells.length)
      }, otherProps), React.createElement("path", {
        fill: bgColor,
        d: "M0,0 h".concat(cells.length, "v").concat(cells.length, "H0z")
      }), React.createElement("path", {
        fill: fgColor,
        d: ops.join('')
      }));
    }
  }]);

  return QRCodeSVG;
}(React.Component);

Object.defineProperty(QRCodeSVG, "defaultProps", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: DEFAULT_PROPS
});
Object.defineProperty(QRCodeSVG, "propTypes", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: PROP_TYPES
});

var QRCode = function QRCode(props) {
  var renderAs = props.renderAs,
      otherProps = _objectWithoutProperties(props, ["renderAs"]);

  var Component = renderAs === 'svg' ? QRCodeSVG : QRCodeCanvas;
  return React.createElement(Component, otherProps);
};

QRCode.defaultProps = _extends({
  renderAs: 'canvas'
}, DEFAULT_PROPS);
module.exports = QRCode;

/***/ }),

/***/ "../../node_modules/react-is/cjs/react-is.development.js":
/*!**********************************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/react-is/cjs/react-is.development.js ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** @license React v16.12.0
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */





if (true) {
  (function() {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var hasSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
// (unstable) APIs that have been removed. Can we remove the symbols?

var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

function isValidElementType(type) {
  return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
  type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE);
}

/**
 * Forked from fbjs/warning:
 * https://github.com/facebook/fbjs/blob/e66ba20ad5be433eb54423f2b097d829324d9de6/packages/fbjs/src/__forks__/warning.js
 *
 * Only change is we use console.warn instead of console.error,
 * and do nothing when 'console' is not supported.
 * This really simplifies the code.
 * ---
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */
var lowPriorityWarningWithoutStack = function () {};

{
  var printWarning = function (format) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argIndex = 0;
    var message = 'Warning: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    });

    if (typeof console !== 'undefined') {
      console.warn(message);
    }

    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  lowPriorityWarningWithoutStack = function (condition, format) {
    if (format === undefined) {
      throw new Error('`lowPriorityWarningWithoutStack(condition, format, ...args)` requires a warning ' + 'message argument');
    }

    if (!condition) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      printWarning.apply(void 0, [format].concat(args));
    }
  };
}

var lowPriorityWarningWithoutStack$1 = lowPriorityWarningWithoutStack;

function typeOf(object) {
  if (typeof object === 'object' && object !== null) {
    var $$typeof = object.$$typeof;

    switch ($$typeof) {
      case REACT_ELEMENT_TYPE:
        var type = object.type;

        switch (type) {
          case REACT_ASYNC_MODE_TYPE:
          case REACT_CONCURRENT_MODE_TYPE:
          case REACT_FRAGMENT_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_SUSPENSE_TYPE:
            return type;

          default:
            var $$typeofType = type && type.$$typeof;

            switch ($$typeofType) {
              case REACT_CONTEXT_TYPE:
              case REACT_FORWARD_REF_TYPE:
              case REACT_LAZY_TYPE:
              case REACT_MEMO_TYPE:
              case REACT_PROVIDER_TYPE:
                return $$typeofType;

              default:
                return $$typeof;
            }

        }

      case REACT_PORTAL_TYPE:
        return $$typeof;
    }
  }

  return undefined;
} // AsyncMode is deprecated along with isAsyncMode

var AsyncMode = REACT_ASYNC_MODE_TYPE;
var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
var ContextConsumer = REACT_CONTEXT_TYPE;
var ContextProvider = REACT_PROVIDER_TYPE;
var Element = REACT_ELEMENT_TYPE;
var ForwardRef = REACT_FORWARD_REF_TYPE;
var Fragment = REACT_FRAGMENT_TYPE;
var Lazy = REACT_LAZY_TYPE;
var Memo = REACT_MEMO_TYPE;
var Portal = REACT_PORTAL_TYPE;
var Profiler = REACT_PROFILER_TYPE;
var StrictMode = REACT_STRICT_MODE_TYPE;
var Suspense = REACT_SUSPENSE_TYPE;
var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

function isAsyncMode(object) {
  {
    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
      hasWarnedAboutDeprecatedIsAsyncMode = true;
      lowPriorityWarningWithoutStack$1(false, 'The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
    }
  }

  return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
}
function isConcurrentMode(object) {
  return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
}
function isContextConsumer(object) {
  return typeOf(object) === REACT_CONTEXT_TYPE;
}
function isContextProvider(object) {
  return typeOf(object) === REACT_PROVIDER_TYPE;
}
function isElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}
function isForwardRef(object) {
  return typeOf(object) === REACT_FORWARD_REF_TYPE;
}
function isFragment(object) {
  return typeOf(object) === REACT_FRAGMENT_TYPE;
}
function isLazy(object) {
  return typeOf(object) === REACT_LAZY_TYPE;
}
function isMemo(object) {
  return typeOf(object) === REACT_MEMO_TYPE;
}
function isPortal(object) {
  return typeOf(object) === REACT_PORTAL_TYPE;
}
function isProfiler(object) {
  return typeOf(object) === REACT_PROFILER_TYPE;
}
function isStrictMode(object) {
  return typeOf(object) === REACT_STRICT_MODE_TYPE;
}
function isSuspense(object) {
  return typeOf(object) === REACT_SUSPENSE_TYPE;
}

exports.typeOf = typeOf;
exports.AsyncMode = AsyncMode;
exports.ConcurrentMode = ConcurrentMode;
exports.ContextConsumer = ContextConsumer;
exports.ContextProvider = ContextProvider;
exports.Element = Element;
exports.ForwardRef = ForwardRef;
exports.Fragment = Fragment;
exports.Lazy = Lazy;
exports.Memo = Memo;
exports.Portal = Portal;
exports.Profiler = Profiler;
exports.StrictMode = StrictMode;
exports.Suspense = Suspense;
exports.isValidElementType = isValidElementType;
exports.isAsyncMode = isAsyncMode;
exports.isConcurrentMode = isConcurrentMode;
exports.isContextConsumer = isContextConsumer;
exports.isContextProvider = isContextProvider;
exports.isElement = isElement;
exports.isForwardRef = isForwardRef;
exports.isFragment = isFragment;
exports.isLazy = isLazy;
exports.isMemo = isMemo;
exports.isPortal = isPortal;
exports.isProfiler = isProfiler;
exports.isStrictMode = isStrictMode;
exports.isSuspense = isSuspense;
  })();
}


/***/ }),

/***/ "../../node_modules/react-is/index.js":
/*!***************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/react-is/index.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (false) {} else {
  module.exports = __webpack_require__(/*! ./cjs/react-is.development.js */ "../../node_modules/react-is/cjs/react-is.development.js");
}


/***/ }),

/***/ "../../node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./lib/API/GraphQL/Connect.js":
/*!************************************!*\
  !*** ./lib/API/GraphQL/Connect.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __extends = this && this.__extends || function () {
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

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
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

var __generator = this && this.__generator || function (thisArg, body) {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var react_1 = __webpack_require__(/*! react */ "react");

var api_1 = __webpack_require__(/*! @aws-amplify/api */ "@aws-amplify/api");

var Connect =
/** @class */
function (_super) {
  __extends(Connect, _super);

  function Connect(props) {
    var _this = _super.call(this, props) || this;

    _this.state = _this.getInitialState();
    _this.subSubscription = null;
    return _this;
  }

  Connect.prototype.getInitialState = function () {
    var query = this.props.query;
    return {
      loading: query && !!query.query,
      data: {},
      errors: [],
      mutation: function mutation() {
        return console.warn('Not implemented');
      }
    };
  };

  Connect.prototype.getDefaultState = function () {
    return {
      loading: false,
      data: {},
      errors: [],
      mutation: function mutation() {
        return console.warn('Not implemented');
      }
    };
  };

  Connect.prototype._fetchData = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, _b, _c, query, _d, variables, _e, _f, mutation, _g, mutationVariables, subscription, _h, onSubscriptionMsg, _j, data, mutationProp, errors, hasValidQuery, hasValidMutation, hasValidSubscription, response, err_1, subsQuery, subsVars, observable;

      var _this = this;

      return __generator(this, function (_k) {
        switch (_k.label) {
          case 0:
            this._unsubscribe();

            this.setState({
              loading: true
            });
            _a = this.props, _b = _a.query, _c = _b === void 0 ? {} : _b, query = _c.query, _d = _c.variables, variables = _d === void 0 ? {} : _d, _e = _a.mutation, _f = _e === void 0 ? {} : _e, mutation = _f.query, _g = _f.mutationVariables, mutationVariables = _g === void 0 ? {} : _g, subscription = _a.subscription, _h = _a.onSubscriptionMsg, onSubscriptionMsg = _h === void 0 ? function (prevData) {
              return prevData;
            } : _h;
            _j = this.getDefaultState(), data = _j.data, mutationProp = _j.mutation, errors = _j.errors;

            if (!api_1["default"] || typeof api_1["default"].graphql !== 'function' || typeof api_1["default"].getGraphqlOperationType !== 'function') {
              throw new Error('No API module found, please ensure @aws-amplify/api is imported');
            }

            hasValidQuery = query && api_1["default"].getGraphqlOperationType(query) === 'query';
            hasValidMutation = mutation && api_1["default"].getGraphqlOperationType(mutation) === 'mutation';
            hasValidSubscription = subscription && api_1["default"].getGraphqlOperationType(subscription.query) === 'subscription';

            if (!hasValidQuery && !hasValidMutation && !hasValidSubscription) {
              console.warn('No query, mutation or subscription was specified');
            }

            if (!hasValidQuery) return [3
            /*break*/
            , 4];
            _k.label = 1;

          case 1:
            _k.trys.push([1, 3,, 4]);

            data = null;
            return [4
            /*yield*/
            , api_1["default"].graphql({
              query: query,
              variables: variables
            })];

          case 2:
            response = _k.sent(); // @ts-ignore

            data = response.data;
            return [3
            /*break*/
            , 4];

          case 3:
            err_1 = _k.sent();
            data = err_1.data;
            errors = err_1.errors;
            return [3
            /*break*/
            , 4];

          case 4:
            if (hasValidMutation) {
              // @ts-ignore
              mutationProp = function mutationProp(variables) {
                return __awaiter(_this, void 0, void 0, function () {
                  var result;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [4
                        /*yield*/
                        , api_1["default"].graphql({
                          query: mutation,
                          variables: variables
                        })];

                      case 1:
                        result = _a.sent();
                        this.forceUpdate();
                        return [2
                        /*return*/
                        , result];
                    }
                  });
                });
              };
            }

            if (hasValidSubscription) {
              subsQuery = subscription.query, subsVars = subscription.variables;

              try {
                observable = api_1["default"].graphql({
                  query: subsQuery,
                  variables: subsVars
                }); // @ts-ignore

                this.subSubscription = observable.subscribe({
                  next: function next(_a) {
                    var data = _a.value.data;
                    var prevData = _this.state.data; // @ts-ignore

                    var newData = onSubscriptionMsg(prevData, data);

                    if (_this.mounted) {
                      _this.setState({
                        data: newData
                      });
                    }
                  },
                  error: function error(err) {
                    return console.error(err);
                  }
                });
              } catch (err) {
                errors = err.errors;
              }
            }

            this.setState({
              data: data,
              errors: errors,
              mutation: mutationProp,
              loading: false
            });
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  Connect.prototype._unsubscribe = function () {
    if (this.subSubscription) {
      this.subSubscription.unsubscribe();
    }
  };

  Connect.prototype.componentDidMount = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        this._fetchData();

        this.mounted = true;
        return [2
        /*return*/
        ];
      });
    });
  };

  Connect.prototype.componentWillUnmount = function () {
    this._unsubscribe();

    this.mounted = false;
  };

  Connect.prototype.componentDidUpdate = function (prevProps) {
    var loading = this.state.loading;
    var _a = this.props,
        newQueryObj = _a.query,
        newMutationObj = _a.mutation;
    var prevQueryObj = prevProps.query,
        prevMutationObj = prevProps.mutation; // query
    // @ts-ignore

    var _b = newQueryObj || {},
        newQuery = _b.query,
        newQueryVariables = _b.variables; // @ts-ignore


    var _c = prevQueryObj || {},
        prevQuery = _c.query,
        prevQueryVariables = _c.variables;

    var queryChanged = prevQuery !== newQuery || JSON.stringify(prevQueryVariables) !== JSON.stringify(newQueryVariables); // mutation
    // @ts-ignore

    var _d = newMutationObj || {},
        newMutation = _d.query,
        newMutationVariables = _d.variables; // @ts-ignore


    var _e = prevMutationObj || {},
        prevMutation = _e.query,
        prevMutationVariables = _e.variables;

    var mutationChanged = prevMutation !== newMutation || JSON.stringify(prevMutationVariables) !== JSON.stringify(newMutationVariables);

    if (!loading && (queryChanged || mutationChanged)) {
      this._fetchData();
    }
  };

  Connect.prototype.render = function () {
    var _a = this.state,
        data = _a.data,
        loading = _a.loading,
        mutation = _a.mutation,
        errors = _a.errors; // @ts-ignore

    return this.props.children({
      data: data,
      errors: errors,
      loading: loading,
      mutation: mutation
    }) || null;
  };

  return Connect;
}(react_1.Component);

exports["default"] = Connect;

/***/ }),

/***/ "./lib/API/GraphQL/index.js":
/*!**********************************!*\
  !*** ./lib/API/GraphQL/index.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Connect_1 = __webpack_require__(/*! ./Connect */ "./lib/API/GraphQL/Connect.js");

exports.Connect = Connect_1["default"];

/***/ }),

/***/ "./lib/API/index.js":
/*!**************************!*\
  !*** ./lib/API/index.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function __export(m) {
  for (var p in m) {
    if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

__export(__webpack_require__(/*! ./GraphQL */ "./lib/API/GraphQL/index.js"));

/***/ }),

/***/ "./lib/Amplify-UI/Amplify-UI-Components-React.js":
/*!*******************************************************!*\
  !*** ./lib/Amplify-UI/Amplify-UI-Components-React.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __assign = this && this.__assign || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

__webpack_require__(/*! @aws-amplify/ui/dist/style.css */ "@aws-amplify/ui/dist/style.css");

var AmplifyUI = __webpack_require__(/*! @aws-amplify/ui */ "@aws-amplify/ui");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ./Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

exports.Container = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.container);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: AmplifyUI.container,
    style: style
  }), props.children));
};

exports.FormContainer = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  return exports.beforeAfter(React.createElement("div", {
    className: AmplifyUI.formContainer,
    style: theme.formContainer
  }, props.children));
};

exports.FormSection = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.formSection);
  return React.createElement(exports.FormContainer, {
    theme: theme
  }, exports.beforeAfter(React.createElement("div", {
    className: AmplifyUI.formSection,
    style: style
  }, props.children)));
};

exports.SectionHeader = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.sectionHeader);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: AmplifyUI.sectionHeader,
    style: style
  }), React.createElement(exports.SectionHeaderContent, {
    theme: theme
  }, props.children, props.hint && React.createElement("div", {
    className: AmplifyUI.sectionHeaderHint
  }, props.hint))));
};

exports.SectionHeaderContent = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.sectionHeaderContent);
  return exports.beforeAfter(React.createElement("span", {
    className: AmplifyUI.sectionHeaderContent,
    style: style
  }, props.children));
};

exports.SectionFooter = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.sectionFooter);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: AmplifyUI.sectionFooter,
    style: style
  }), props.children));
};

exports.SectionFooterPrimaryContent = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.sectionFooterPrimaryContent);
  return exports.beforeAfter(React.createElement("span", {
    className: AmplifyUI.sectionFooterPrimaryContent,
    style: style
  }, props.children));
};

exports.SectionFooterSecondaryContent = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.sectionFooterSecondaryContent);
  return exports.beforeAfter(React.createElement("span", {
    className: AmplifyUI.sectionFooterSecondaryContent,
    style: style
  }, props.children));
};

exports.SectionBody = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.sectionBody);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: AmplifyUI.sectionBody,
    style: style
  }), props.children));
};

exports.ActionRow = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.actionRow);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: "amplify-action-row",
    style: style
  }), props.children));
};

exports.Strike = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.strike);
  return exports.beforeAfter(React.createElement("div", {
    className: AmplifyUI.strike,
    style: style
  }, React.createElement(exports.StrikeContent, {
    theme: theme
  }, props.children)));
};

exports.StrikeContent = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  return exports.beforeAfter(React.createElement("span", {
    className: AmplifyUI.strikeContent,
    style: theme.strikeContent
  }, props.children));
};

exports.FormRow = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.formRow);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: AmplifyUI.formRow,
    style: style
  }), props.children));
};

exports.RadioRow = function (props) {
  var id = props.id || '_' + props.value;
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  return React.createElement(exports.FormRow, {
    theme: theme
  }, React.createElement(exports.Radio, __assign({}, props, {
    id: id
  })), React.createElement(exports.Label, {
    htmlFor: id,
    theme: theme
  }, props.placeholder));
};

exports.Radio = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.radio);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("input", __assign({}, p, {
    type: "radio",
    className: AmplifyUI.radio,
    style: style
  })));
};

exports.InputRow = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.input);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return React.createElement(exports.FormRow, {
    theme: theme
  }, exports.beforeAfter(React.createElement("input", __assign({}, p, {
    className: AmplifyUI.input,
    style: style
  }))));
};

exports.Input = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.input);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return React.createElement("input", __assign({}, p, {
    className: AmplifyUI.input,
    style: style
  }));
};

exports.SelectInput = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.selectInput);
  return React.createElement("div", {
    className: AmplifyUI.selectInput,
    style: style
  }, props.children);
};

exports.FormField = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.formField);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: AmplifyUI.formField,
    style: style
  }), props.children));
};

exports.Button = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.button);
  var disabled = props.disabled || false;
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("button", __assign({}, p, {
    className: AmplifyUI.button,
    style: style,
    disabled: disabled
  }), props.children));
};

exports.PhotoPickerButton = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.photoPickerButton);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return React.createElement("button", __assign({}, p, {
    className: [AmplifyUI.photoPickerButton, AmplifyUI.button].join(' '),
    style: style
  }), props.children);
};

exports.SignInButton = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var styles = Object.assign({}, theme.signInButton, theme[props.variant]);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("button", __assign({}, p, {
    className: AmplifyUI.signInButton,
    style: styles
  }), props.children));
};

exports.SignInButtonIcon = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.signInButtonIcon);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("span", __assign({}, p, {
    className: AmplifyUI.signInButtonIcon,
    style: style
  }), props.children));
};

exports.SignInButtonContent = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.signInButtonContent);
  return exports.beforeAfter(React.createElement("span", {
    className: AmplifyUI.signInButtonContent,
    style: style
  }, props.children));
};

exports.Link = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.a);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("a", __assign({}, p, {
    className: AmplifyUI.a,
    style: style
  }), props.children));
};

exports.Label = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.label);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("label", __assign({}, p, {
    className: AmplifyUI.label,
    style: style
  }), props.children));
};

exports.Hint = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.hint);
  return exports.beforeAfter(React.createElement("div", {
    className: AmplifyUI.hint,
    style: style
  }, props.children));
};

exports.InputLabel = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.inputLabel);
  return exports.beforeAfter(React.createElement("div", {
    className: AmplifyUI.inputLabel,
    style: style
  }, props.children));
};

exports.NavBar = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.navBar);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: AmplifyUI.navBar,
    style: style
  }), props.children));
};

exports.Nav = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.nav);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: AmplifyUI.nav,
    style: style
  }), props.children));
};

exports.NavRight = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.navRight);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: AmplifyUI.navRight,
    style: style
  }), props.children));
};

exports.NavItem = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.navItem);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: AmplifyUI.navItem,
    style: style
  }), props.children));
};

exports.NavButton = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.navButton);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("button", __assign({}, p, {
    className: AmplifyUI.button,
    style: style
  }), exports.beforeAfter(React.createElement("span", null, props.children))));
};

exports.Toast = function (props) {
  var onClose = props.onClose;
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  return React.createElement("div", __assign({}, props, {
    theme: theme,
    className: AmplifyUI.toast,
    style: theme.toast
  }), React.createElement("span", null, props.children), React.createElement("a", {
    className: AmplifyUI.toastClose,
    onClick: onClose
  }));
}; // @ts-ignore


exports.Toast.defaultProps = {
  onClose: function onClose() {
    return void 0;
  }
};

exports.PhotoPlaceholder = function (props) {
  var theme = props.theme || Amplify_UI_Theme_1["default"];
  var style = exports.propStyle(props, theme.photoPlaceholder);
  return React.createElement("div", {
    className: AmplifyUI.photoPlaceholder,
    style: style
  }, React.createElement("div", {
    className: AmplifyUI.photoPlaceholderIcon
  }, React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "64",
    height: "64",
    viewBox: "0 0 24 24"
  }, React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3.2"
  }), React.createElement("path", {
    d: "M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
  }), React.createElement("path", {
    d: "M0 0h24v24H0z",
    fill: "none"
  }))));
};

exports.beforeAfter = function (el) {
  var style = el.props.style || {};
  var before = style.before,
      after = style.after;

  if (!before && !after) {
    return el;
  }

  return React.createElement("span", {
    style: {
      position: 'relative'
    }
  }, before ? React.createElement("span", {
    style: before
  }, before.content) : null, el, after ? React.createElement("span", {
    style: after
  }, after.content) : null);
};

exports.propStyle = function (props, themeStyle) {
  var id = props.id,
      style = props.style;
  var styl = Object.assign({}, style, themeStyle);

  if (!id) {
    return styl;
  }

  var selector = '#' + id;
  Object.assign(styl, styl[selector]);
  return styl;
};

/***/ }),

/***/ "./lib/Amplify-UI/Amplify-UI-Theme.js":
/*!********************************************!*\
  !*** ./lib/Amplify-UI/Amplify-UI-Theme.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Container = {};
exports.FormContainer = {};
exports.FormSection = {};
exports.FormField = {};
exports.SectionHeader = {};
exports.SectionBody = {};
exports.SectionFooter = {};
exports.SectionFooterPrimaryContent = {};
exports.SectionFooterSecondaryContent = {};
exports.Input = {};
exports.Button = {};
exports.PhotoPickerButton = {};
exports.PhotoPlaceholder = {};
exports.SignInButton = {};
exports.SignInButtonIcon = {};
exports.SignInButtonContent = {};
exports.Strike = {};
exports.StrikeContent = {};
exports.ActionRow = {};
exports.FormRow = {};
exports.A = {};
exports.Hint = {};
exports.Radio = {};
exports.Label = {};
exports.InputLabel = {};
exports.AmazonSignInButton = {};
exports.FacebookSignInButton = {};
exports.GoogleSignInButton = {};
exports.OAuthSignInButton = {};
exports.Toast = {};
exports.NavBar = {};
exports.NavRight = {};
exports.Nav = {};
exports.NavItem = {};
exports.NavButton = {};
var AmplifyTheme = {
  container: exports.Container,
  formContainer: exports.FormContainer,
  formSection: exports.FormSection,
  formField: exports.FormField,
  sectionHeader: exports.SectionHeader,
  sectionBody: exports.SectionBody,
  sectionFooter: exports.SectionFooter,
  sectionFooterPrimaryContent: exports.SectionFooterPrimaryContent,
  sectionFooterSecondaryContent: exports.SectionFooterSecondaryContent,
  input: exports.Input,
  button: exports.Button,
  photoPickerButton: exports.PhotoPickerButton,
  photoPlaceholder: exports.PhotoPlaceholder,
  signInButton: exports.SignInButton,
  signInButtonIcon: exports.SignInButtonIcon,
  signInButtonContent: exports.SignInButtonContent,
  amazonSignInButton: exports.AmazonSignInButton,
  facebookSignInButton: exports.FacebookSignInButton,
  googleSignInButton: exports.GoogleSignInButton,
  oAuthSignInButton: exports.OAuthSignInButton,
  formRow: exports.FormRow,
  strike: exports.Strike,
  strikeContent: exports.StrikeContent,
  actionRow: exports.ActionRow,
  a: exports.A,
  hint: exports.Hint,
  radio: exports.Radio,
  label: exports.Label,
  inputLabel: exports.InputLabel,
  toast: exports.Toast,
  navBar: exports.NavBar,
  nav: exports.Nav,
  navRight: exports.NavRight,
  navItem: exports.NavItem,
  navButton: exports.NavButton
};
exports["default"] = AmplifyTheme;

/***/ }),

/***/ "./lib/Amplify-UI/data-test-attributes.js":
/*!************************************************!*\
  !*** ./lib/Amplify-UI/data-test-attributes.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
}); // Auth

var signIn = {
  section: 'sign-in-section',
  headerSection: 'sign-in-header-section',
  bodySection: 'sign-in-body-section',
  footerSection: 'sign-in-footer-section',
  usernameInput: 'username-input',
  passwordInput: 'sign-in-password-input',
  forgotPasswordLink: 'sign-in-forgot-password-link',
  signInButton: 'sign-in-sign-in-button',
  createAccountLink: 'sign-in-create-account-link',
  signInError: 'authenticator-error'
};
var signOut = {
  button: 'sign-out-button',
  section: 'sign-out-section'
};
var signUp = {
  section: 'sign-up-section',
  headerSection: 'sign-up-header-section',
  bodySection: 'sign-up-body-section',
  nonPhoneNumberInput: 'sign-up-non-phone-number-input',
  phoneNumberInput: 'sign-up-phone-number-input',
  dialCodeSelect: 'sign-up-dial-code-select',
  footerSection: 'sign-up-footer-section',
  createAccountButton: 'sign-up-create-account-button',
  signInLink: 'sign-up-sign-in-link',
  signUpButton: 'sign-up-sign-up-button',
  signInButton: 'sign-up-sign-in-button',
  confirmButton: 'sign-up-confirm-button'
};
var verifyContact = {
  section: 'verify-contact-section',
  headerSection: 'verify-contact-header-section',
  bodySection: 'verify-contact-body-section',
  submitButton: 'verify-contact-submit-button',
  verifyButton: 'verify-contact-verify-button',
  skipLink: 'verify-contact-skip-link'
};
var TOTPSetup = {
  component: 'totp-setup-component'
};
var requireNewPassword = {
  section: 'require-new-password-section',
  headerSection: 'require-new-password-header-section',
  footerSection: 'require-new-password-footer-section',
  bodySection: 'require-new-password-body-section',
  newPasswordInput: 'require-new-password-new-password-input',
  backToSignInLink: 'require-new-password-back-to-sign-in-link',
  submitButton: 'require-new-password-submit-button'
};
var loading = {
  section: 'loading-secton'
};
var greetings = {
  navBar: 'greetings-nav-bar',
  nav: 'greetings-nav',
  navRight: 'greetings-nav-right'
}; // TODO: Change Angular Component (Greeting) to match React Component (Greetings)

var greeting = {
  signOutButton: 'sign-out-button',
  signOutLink: 'greeting-sign-out-link',
  navRight: 'greetings-nav-right'
};
var federatedSignIn = {
  section: 'federated-sign-in-section',
  bodySection: 'federated-sign-in-body-section',
  signInButtons: 'federated-sign-in-buttons'
};
var confirmSignUp = {
  section: 'confirm-sign-up-section',
  headerSection: 'confirm-sign-up-header-section',
  bodySection: 'confirm-sign-up-body-section',
  usernameInput: 'confirm-sign-up-username-input',
  confirmationCodeInput: 'confirm-sign-up-confirmation-code-input',
  resendCodeLink: 'confirm-sign-up-resend-code-link',
  confirmButton: 'confirm-sign-up-confirm-button',
  backToSignInLink: 'confirm-sign-up-back-to-sign-in-link'
};
var confirmSignIn = {
  section: 'confirm-sign-in-section',
  headerSection: 'confirm-sign-in-header-section',
  bodySection: 'confirm-sign-in-body-section',
  codeInput: 'confirm-sign-in-code-input',
  confirmButton: 'confirm-sign-in-confirm-button',
  backToSignInLink: 'confirm-sign-in-back-to-sign-in-link'
};
var setMFAComp = {
  section: 'set-mfa-section',
  headerSection: 'set-mfa-header-section',
  bodySection: 'set-mfa-header-body-section',
  smsInput: 'set-mfa-sms-input',
  totpInput: 'set-mfa-totp-input',
  noMfaInput: 'set-mfa-nomfa-input',
  verificationCodeInput: 'set-mfa-verification-code-input',
  setMfaButton: 'set-mfa-set-mfa-button',
  verifyTotpTokenButton: 'set-mfa-verify-totp-token-button',
  cancelButton: 'set-mfa-cancel-button'
};
var forgotPassword = {
  section: 'forgot-password-section',
  headerSection: 'forgot-password-header-section',
  bodySection: 'forgot-password-body-section',
  submitButton: 'forgot-password-submit-button',
  sendCodeButton: 'forgot-password-send-code-button',
  resendCodeLink: 'forgot-password-resend-code-link',
  backToSignInLink: 'forgot-password-back-to-sign-in-link',
  usernameInput: 'username-input',
  codeInput: 'forgot-password-code-input',
  newPasswordInput: 'forgot-password-new-password-input'
};
exports.sumerianScene = {
  container: 'sumerian-scene-container',
  sumerianScene: 'sumerian-scene',
  loading: 'sumerian-scene-loading',
  loadingLogo: 'sumerian-scene-loading-logo',
  loadingSceneName: 'sumerian-scene-loading-scene-name',
  loadingBar: 'sumerian-scene-loading-bar',
  errorText: 'sumerian-scene-error-text',
  bar: 'sumerian-scene-bar',
  actions: 'sumerian-scene-actions'
};
exports.genericAttrs = {
  usernameInput: 'username-input',
  emailInput: 'email-input',
  phoneNumberInput: 'phone-number-input',
  dialCodeSelect: 'dial-code-select'
};
exports.auth = {
  signIn: signIn,
  signOut: signOut,
  signUp: signUp,
  verifyContact: verifyContact,
  TOTPSetup: TOTPSetup,
  requireNewPassword: requireNewPassword,
  loading: loading,
  genericAttrs: exports.genericAttrs,
  greetings: greetings,
  greeting: greeting,
  federatedSignIn: federatedSignIn,
  confirmSignUp: confirmSignUp,
  confirmSignIn: confirmSignIn,
  setMFAComp: setMFAComp,
  forgotPassword: forgotPassword
};

/***/ }),

/***/ "./lib/AmplifyI18n.js":
/*!****************************!*\
  !*** ./lib/AmplifyI18n.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

Object.defineProperty(exports, "__esModule", {
  value: true
});
var dict = {
  de: {
    'Sign In': 'Anmelden',
    'Sign Up': 'Registrieren',
    'Sign Out': 'Abmelden',
    'Sign in to your account': 'Melden Sie sich mit Ihrem Account an',
    Username: 'Benutzername',
    Password: 'Passwort',
    'Enter your username': 'Geben Sie Ihren Benutzernamen ein',
    'Enter your password': 'Geben Sie Ihr Passwort ein',
    'No account? ': 'Kein Account? ',
    'Forget your password? ': 'Passwort vergessen? ',
    'Reset password': 'Passwort zurücksetzen',
    'User does not exist': 'Dieser Benutzer existiert nicht',
    'User already exists': 'Dieser Benutzer existiert bereits',
    'Incorrect username or password': 'Falscher Benutzername oder falsches Passwort',
    'Invalid password format': 'Ungültiges Passwort-Format',
    'Create account': 'Hier registrieren',
    'Forgot Password': 'Passwort vergessen',
    'Change Password': 'Passwort ändern',
    'New Password': 'Neues Passwort',
    Email: 'Email',
    'Phone Number': 'Telefonnummer',
    'Confirm a Code': 'Code bestätigen',
    'Confirm Sign In': 'Anmeldung bestätigen',
    'Confirm Sign Up': 'Registrierung bestätigen',
    'Back to Sign In': 'Zurück zur Anmeldung',
    'Send Code': 'Code senden',
    Confirm: 'Bestätigen',
    'Resend Code': 'Code erneut senden',
    Submit: 'Abschicken',
    Skip: 'Überspringen',
    Verify: 'Verifizieren',
    'Verify Contact': 'Kontakt verifizieren',
    Code: 'Code',
    'Confirmation Code': 'Bestätigungs-Code',
    'Lost your code? ': 'Code verloren? ',
    'Account recovery requires verified contact information': 'Zurücksetzen des Account benötigt einen verifizierten Account',
    'Invalid phone number format': "Ung\xFCltiges Telefonummern-Format.\n            Benutze eine Nummer im Format: +12345678900",
    'Create Account': 'Account erstellen',
    'Have an account? ': 'Schon registriert? ',
    'Sign in': 'Anmelden',
    'Create a new account': 'Erstelle einen neuen Account',
    'Reset your password': 'Zurücksetzen des Passworts',
    'An account with the given email already exists.': 'Ein Account mit dieser Email existiert bereits.',
    'Username cannot be empty': 'Benutzername darf nicht leer sein',
    'Password attempts exceeded': 'Die maximale Anzahl der fehlerhaften Anmeldeversuche wurde erreicht'
  },
  fr: {
    'Sign In': 'Se connecter',
    'Sign Up': "S'inscrire",
    'Sign Out': 'Déconnexion',
    'Forgot Password': 'Mot de passe oublié',
    Username: "Nom d'utilisateur",
    Password: 'Mot de passe',
    'Change Password': 'Changer le mot de passe',
    'New Password': 'nouveau mot de passe',
    Email: 'Email',
    'Phone Number': 'Numéro de téléphone',
    'Confirm a Code': 'Confirmer un code',
    'Confirm Sign In': 'Confirmer la connexion',
    'Confirm Sign Up': "Confirmer l'inscription",
    'Back to Sign In': 'Retour à la connexion',
    'Send Code': 'Envoyer le code',
    Confirm: 'Confirmer',
    'Resend a Code': 'Renvoyer un code',
    Submit: 'Soumettre',
    Skip: 'Sauter',
    Verify: 'Vérifier',
    'Verify Contact': 'Vérifier le contact',
    Code: 'Code',
    'Account recovery requires verified contact information': 'La récupération du compte nécessite des informations de contact vérifiées',
    'User does not exist': "L'utilisateur n'existe pas",
    'User already exists': "L'utilisateur existe déjà",
    'Incorrect username or password': 'identifiant ou mot de passe incorrect',
    'Invalid password format': 'format de mot de passe invalide',
    'Invalid phone number format': "Format de num\xE9ro de t\xE9l\xE9phone invalide.\nVeuillez utiliser un format de num\xE9ro de t\xE9l\xE9phone du +12345678900",
    'Sign in to your account': 'Connectez-vous à votre compte',
    'Forget your password? ': 'Mot de passe oublié ? ',
    'Reset password': 'Réinitialisez votre mot de passe',
    'No account? ': 'Pas de compte ? ',
    'Create account': 'Créer un compte',
    'Create Account': 'Créer un compte',
    'Have an account? ': 'Déjà un compte ? ',
    'Sign in': 'Se connecter',
    'Create a new account': 'Créer un nouveau compte',
    'Reset your password': 'Réinitialisez votre mot de passe',
    'Enter your username': "Saisissez votre nom d'utilisateur",
    'Enter your password': 'Saisissez votre mot de passe',
    'An account with the given email already exists.': 'Un utilisateur avec cette adresse email existe déjà.',
    'Username cannot be empty': "Le nom d'utilisateur doit être renseigné"
  },
  es: {
    'Sign In': 'Registrarse',
    'Sign Up': 'Regístrate',
    'Sign Out': 'Desconectar',
    'Forgot Password': 'Se te olvidó tu contraseña',
    Username: 'Nombre de usuario',
    Password: 'Contraseña',
    'Change Password': 'Cambia la contraseña',
    'New Password': 'Nueva contraseña',
    Email: 'Email',
    'Phone Number': 'Número de teléfono',
    'Confirm a Code': 'Confirmar un código',
    'Confirm Sign In': 'Confirmar inicio de sesión',
    'Confirm Sign Up': 'Confirmar Registrarse',
    'Back to Sign In': 'Volver a Iniciar sesión',
    'Send Code': 'Enviar código',
    Confirm: 'Confirmar',
    'Resend a Code': 'Reenviar un código',
    Submit: 'Enviar',
    Skip: 'Omitir',
    Verify: 'Verificar',
    'Verify Contact': 'Verificar contacto',
    Code: 'Código',
    'Account recovery requires verified contact information': 'La recuperación de la cuenta requiere información de contacto verificada',
    'User does not exist': 'el usuario no existe',
    'User already exists': 'El usuario ya existe',
    'Incorrect username or password': 'Nombre de usuario o contraseña incorrecta',
    'Invalid password format': 'Formato de contraseña inválido',
    'Invalid phone number format': "Formato de n\xFAmero de tel\xE9fono inv\xE1lido.\nUtilice el formato de n\xFAmero de tel\xE9fono +12345678900"
  },
  it: {
    'Account recovery requires verified contact information': 'Ripristino del conto richiede un account verificati',
    'An account with the given email already exists.': 'Un account con questa email esiste già.',
    'Back to Sign In': 'Torna alla Accesso',
    'Change Password': 'Cambia la password',
    Code: 'Codice',
    Confirm: 'Conferma',
    'Confirm Sign In': 'Conferma di applicazione',
    'Confirm Sign Up': 'Registrazione Conferma',
    'Confirm a Code': 'Codice Conferma',
    'Confirmation Code': 'Codice di verifica',
    'Create Account': 'Crea account',
    'Create a new account': 'Creare un nuovo account',
    'Create account': 'Registrati',
    Email: 'E-mail',
    'Enter your password': 'Inserire la password',
    'Enter your username': 'Inserisci il tuo nome utente',
    'Forget your password?': 'Password dimenticata?',
    'Forgot Password': 'Password dimenticata',
    'Have an account? ': 'Già registrato?',
    'Incorrect username or password': 'Nome utente o password errati',
    'Invalid password format': 'Formato della password non valido',
    'Invalid phone number format': 'Utilizzo non valido Telefonummern formattare un numero nel formato :. 12.345.678,9 mille',
    'Lost your code?': 'Perso codice?',
    'New Password': 'Nuova password',
    'No account? ': 'Nessun account?',
    Password: 'Password',
    'Password attempts exceeded': 'Il numero massimo di tentativi di accesso falliti è stato raggiunto',
    'Phone Number': 'Numero di telefono',
    'Resend Code': 'Codice Rispedisci',
    'Reset password': 'Ripristina password',
    'Reset your password': 'Resetta password',
    'Send Code': 'Invia codice',
    'Sign In': 'Accesso',
    'Sign Out': 'Esci',
    'Sign Up': 'Iscriviti',
    'Sign in': 'Accesso',
    'Sign in to your account': 'Accedi con il tuo account a',
    Skip: 'Salta',
    Submit: 'Sottoscrivi',
    'User already exists': 'Questo utente esiste già',
    'User does not exist': 'Questo utente non esiste',
    Username: 'Nome utente',
    'Username cannot be empty': 'Nome utente non può essere vuoto',
    Verify: 'Verifica',
    'Verify Contact': 'Contatto verifica'
  },
  zh: {
    'Sign In': '登录',
    'Sign Up': '注册',
    'Sign Out': '退出',
    'Forgot Password': '忘记密码',
    Username: '用户名',
    Password: '密码',
    'Change Password': '改变密码',
    'New Password': '新密码',
    Email: '邮箱',
    'Phone Number': '电话',
    'Confirm a Code': '确认码',
    'Confirm Sign In': '确认登录',
    'Confirm Sign Up': '确认注册',
    'Back to Sign In': '回到登录',
    'Send Code': '发送确认码',
    Confirm: '确认',
    'Resend a Code': '重发确认码',
    Submit: '提交',
    Skip: '跳过',
    Verify: '验证',
    'Verify Contact': '验证联系方式',
    Code: '确认码',
    'Account recovery requires verified contact information': '账户恢复需要验证过的联系方式',
    'User does not exist': '用户不存在',
    'User already exists': '用户已经存在',
    'Incorrect username or password': '用户名或密码错误',
    'Invalid password format': '密码格式错误',
    'Invalid phone number format': '电话格式错误，请使用格式 +12345678900'
  }
};
exports["default"] = dict;

/***/ }),

/***/ "./lib/AmplifyMessageMap.js":
/*!**********************************!*\
  !*** ./lib/AmplifyMessageMap.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

exports.MapEntries = [['User does not exist', /user.*not.*exist/i], ['User already exists', /user.*already.*exist/i], ['Incorrect username or password', /incorrect.*username.*password/i], ['Invalid password format', /validation.*password/i], ['Invalid phone number format', /invalid.*phone/i, 'Invalid phone number format. Please use a phone number format of +12345678900']];

function AmplifyMessageMap(message) {
  // @ts-ignore
  var match = exports.MapEntries.filter(function (entry) {
    return entry[1].test(message);
  });

  if (match.length === 0) {
    return message;
  }

  var entry = match[0];
  var msg = entry.length > 2 ? entry[2] : entry[0];
  return core_1.I18n.get(entry[0], msg);
}

exports["default"] = AmplifyMessageMap;

/***/ }),

/***/ "./lib/AmplifyTheme.js":
/*!*****************************!*\
  !*** ./lib/AmplifyTheme.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

exports.Container = {
  fontFamily: "-apple-system,\n                BlinkMacSystemFont,\n                \"Segoe UI\",\n                Roboto,\n                \"Helvetica Neue\",\n                Arial,\n                sans-serif,\n                \"Apple Color Emoji\",\n                \"Segoe UI Emoji\",\n                \"Segoe UI Symbol\"",
  fontWeight: '400',
  lineHeight: '1.5',
  color: '#212529',
  textAlign: 'left',
  paddingLeft: '15px',
  paddingRight: '15px'
};
exports.NavBar = {
  position: 'relative',
  border: '1px solid transparent',
  borderColor: '#e7e7e7'
};
exports.NavRight = {
  textAlign: 'right'
};
exports.Nav = {
  margin: '7.5px'
};
exports.NavItem = {
  display: 'inline-block',
  padding: '10px 5px',
  lineHeight: '20px'
};
exports.NavButton = {
  display: 'inline-block',
  padding: '6px 12px',
  marginTop: '8px',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '1.42857143',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
  touchAction: 'manipulation',
  cursor: 'pointer',
  userSelect: 'none',
  backgroundImage: 'none',
  border: '1px solid transparent',
  borderRadius: '4px',
  color: '#333',
  backgroundColor: '#fff',
  borderColor: '#ccc'
};
exports.FormContainer = {
  textAlign: 'center'
};
exports.FormSection = {
  marginBottom: '20px',
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  borderRadius: '4px',
  textAlign: 'left',
  width: '400px',
  display: 'inline-block'
};
exports.ErrorSection = {
  marginBottom: '20px',
  color: '#fff',
  backgroundColor: '#f0ad4e',
  border: '1px solid #eea236',
  borderRadius: '4px',
  textAlign: 'left'
};
exports.SectionHeader = {
  color: '#fff',
  backgroundColor: '#337ab7',
  borderColor: '#337ab7',
  padding: '10px 15px',
  borderBottom: '1px solid transparent',
  borderTopLeftRadius: '3px',
  borderTopRightRadius: '3px',
  textAlign: 'center'
};
exports.SectionFooter = {
  color: '#333',
  backgroundColor: '#f5f5f5',
  padding: '10px 15px',
  borderTop: '1px solid #ddd',
  borderTopLeftRadius: '3px',
  borderTopRightRadius: '3px'
};
exports.SectionBody = {
  padding: '15px'
};
exports.FormRow = {
  marginBottom: '15px'
};
exports.ActionRow = {
  marginBottom: '15px'
};
exports.Input = {
  display: 'block',
  width: '100%',
  height: '34px',
  padding: '6px 12px',
  fontSize: '14px',
  lineHeight: '1.42857143',
  color: '#555',
  backgroundColor: '#fff',
  backgroundImage: 'none',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxShadow: 'inset 0 1px 1px rgba(0,0,0,.075)',
  boxSizing: 'border-box',
  transition: 'border-color ease-in-out .15s,box-shadow ease-in-out .15s'
};
exports.Button = {
  display: 'inline-block',
  padding: '6px 12px',
  marginBottom: '0',
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '1.42857143',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
  touchAction: 'manipulation',
  cursor: 'pointer',
  userSelect: 'none',
  backgroundImage: 'none',
  border: '1px solid transparent',
  borderRadius: '4px',
  color: '#333',
  backgroundColor: '#fff',
  borderColor: '#ccc'
};
exports.SignInButton = {
  position: 'relative',
  padding: '6px 12px 6px 44px',
  fontSize: '14px',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'block',
  width: '100%',
  marginTop: '2px',
  '#google_signin_btn': {
    color: '#fff',
    backgroundColor: '#dd4b39',
    borderColor: 'rgba(0,0,0,0.2)'
  },
  '#facebook_signin_btn': {
    color: '#fff',
    backgroundColor: '#3b5998',
    borderColor: 'rgba(0,0,0,0.2)'
  }
};
exports.Space = {
  display: 'inline-block',
  width: '20px'
};
exports.A = {
  color: '#007bff',
  cursor: 'pointer'
};
exports.Pre = {
  overflow: 'auto',
  fontFamily: "Menlo,\n                Monaco,\n                Consolas,\n                \"Courier New\",\n                monospace",
  display: 'block',
  padding: '9.5px',
  margin: '0 0 10px',
  fontSize: '13px',
  lineHeight: '1.42857143',
  color: '#333',
  wordBreak: 'break-all',
  wordWrap: 'break-word',
  backgroundColor: '#f5f5f5',
  border: '1px solid #ccc',
  borderRadius: '4px'
};
exports.Col1 = {
  display: 'inline-block',
  width: '8.33333333%'
};
exports.Col2 = {
  display: 'inline-block',
  width: '16.66666667%'
};
exports.Col3 = {
  display: 'inline-block',
  width: '25%'
};
exports.Col4 = {
  display: 'inline-block',
  width: '33.33333333%'
};
exports.Col5 = {
  display: 'inline-block',
  width: '41.66666667%'
};
exports.Col6 = {
  display: 'inline-block',
  width: '50%'
};
exports.Col7 = {
  display: 'inline-block',
  width: '58.33333333%'
};
exports.Col8 = {
  display: 'inline-block',
  width: '66.66666667%'
};
exports.Col9 = {
  display: 'inline-block',
  width: '75%'
};
exports.Col10 = {
  display: 'inline-block',
  width: '83.33333333%'
};
exports.Col11 = {
  display: 'inline-block',
  width: '91.66666667%'
};
exports.Col12 = {
  display: 'inline-block',
  width: '100%'
};
exports.Hidden = {
  display: 'none'
};
var Bootstrap = {
  container: exports.Container,
  navBar: exports.NavBar,
  nav: exports.Nav,
  navRight: exports.NavRight,
  navItem: exports.NavItem,
  navButton: exports.NavButton,
  formContainer: exports.FormContainer,
  formSection: exports.FormSection,
  errorSection: exports.ErrorSection,
  sectionHeader: exports.SectionHeader,
  sectionBody: exports.SectionBody,
  sectionFooter: exports.SectionFooter,
  formRow: exports.FormRow,
  actionRow: exports.ActionRow,
  space: exports.Space,
  signInButton: exports.SignInButton,
  input: exports.Input,
  button: exports.Button,
  a: exports.A,
  pre: exports.Pre,
  col1: exports.Col1,
  col2: exports.Col2,
  col3: exports.Col3,
  col4: exports.Col4,
  col5: exports.Col5,
  col6: exports.Col6,
  col7: exports.Col7,
  col8: exports.Col8,
  col9: exports.Col9,
  col10: exports.Col10,
  col11: exports.Col11,
  col12: exports.Col12,
  hidden: exports.Hidden
};
exports["default"] = Bootstrap;

/***/ }),

/***/ "./lib/AmplifyUI.js":
/*!**************************!*\
  !*** ./lib/AmplifyUI.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __assign = this && this.__assign || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var AmplifyTheme_1 = __webpack_require__(/*! ./AmplifyTheme */ "./lib/AmplifyTheme.js");

exports.Container = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.container);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: "amplify-container",
    style: style
  }), props.children));
};

exports.FormContainer = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.formContainer);
  return exports.beforeAfter(React.createElement("div", {
    className: "amplify-form-container",
    style: style
  }, props.children));
};

exports.FormSection = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.formSection);
  return React.createElement(exports.FormContainer, {
    theme: theme
  }, exports.beforeAfter(React.createElement("div", {
    className: "amplify-form-section",
    style: style
  }, props.children)));
};

exports.ErrorSection = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.errorSection);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: "amplify-error-section",
    style: style
  }), React.createElement(exports.ErrorSectionContent, null, props.children)));
};

exports.ErrorSectionContent = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.errorSectionContent);
  return exports.beforeAfter(React.createElement("span", {
    className: "amplify-error-section-content",
    style: style
  }, props.children));
};

exports.SectionHeader = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.sectionHeader);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: "amplify-section-header",
    style: style
  }), React.createElement(exports.SectionHeaderContent, {
    theme: theme
  }, props.children)));
};

exports.SectionHeaderContent = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.sectionHeaderContent);
  return exports.beforeAfter(React.createElement("span", {
    className: "amplify-section-header-content",
    style: style
  }, props.children));
};

exports.SectionFooter = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.sectionFooter);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: "amplify-section-footer",
    style: style
  }), React.createElement(exports.SectionFooterContent, null, props.children)));
};

exports.SectionFooterContent = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.sectionFooterContent);
  return exports.beforeAfter(React.createElement("span", {
    className: "amplify-section-footer-content",
    style: style
  }, props.children));
};

exports.SectionBody = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.sectionBody);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: "amplify-section-body",
    style: style
  }), props.children));
};

exports.ActionRow = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.actionRow);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: "amplify-action-row",
    style: style
  }), props.children));
};

exports.FormRow = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.formRow);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: "amplify-form-row",
    style: style
  }), props.children));
};

exports.InputRow = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.input);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return React.createElement(exports.FormRow, {
    theme: theme
  }, exports.beforeAfter(React.createElement("input", __assign({}, p, {
    className: "amplify-input",
    style: style
  }))));
};

exports.RadioRow = function (props) {
  var id = props.id || '_' + props.value;
  var theme = props.theme || AmplifyTheme_1["default"];
  return React.createElement(exports.FormRow, {
    theme: theme
  }, React.createElement(exports.Radio, __assign({}, props, {
    id: id
  })), React.createElement(exports.Label, {
    htmlFor: id,
    theme: theme
  }, props.placeholder));
};

exports.Radio = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.radio);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("input", __assign({}, p, {
    type: "radio",
    className: "amplify-radio",
    style: style
  })));
};

exports.CheckboxRow = function (props) {
  var id = props.id || '_' + props.name;
  var theme = props.theme || AmplifyTheme_1["default"];
  return React.createElement(exports.FormRow, {
    theme: theme
  }, React.createElement(exports.Checkbox, __assign({}, props, {
    id: id
  })), React.createElement(exports.Label, {
    htmlFor: id,
    theme: theme
  }, props.placeholder));
};

exports.Checkbox = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.checkbox);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("input", __assign({}, p, {
    type: "checkbox",
    className: "amplify-checkbox",
    style: style
  })));
};

exports.MessageRow = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  return React.createElement(exports.FormRow, {
    theme: theme
  }, React.createElement(exports.MessageContent, {
    theme: theme
  }, props.children));
};

exports.MessageContent = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  return exports.beforeAfter(React.createElement("span", {
    className: "amplify-message-content",
    style: theme.messageContent
  }, props.children));
};

exports.ButtonRow = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  return exports.beforeAfter(React.createElement("div", {
    className: "amplify-action-row",
    style: theme.actionRow
  }, React.createElement(exports.Button, __assign({}, props))));
};

exports.Button = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.button);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("button", __assign({}, p, {
    className: "amplify-button",
    style: style
  }), React.createElement(exports.ButtonContent, {
    theme: theme
  }, props.children)));
};

exports.ButtonContent = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  return exports.beforeAfter(React.createElement("span", {
    className: "amplify-button-content",
    style: theme.buttonContent
  }, props.children));
};

exports.SignInButton = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.signInButton);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("button", __assign({}, p, {
    className: "amplify-signin-button",
    style: style
  }), props.children));
};

exports.Link = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.a);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("a", __assign({}, p, {
    className: "amplify-a",
    style: style
  }), props.children));
};

exports.Label = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.label);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("label", __assign({}, p, {
    className: "amplify-label",
    style: style
  }), props.children));
};

exports.Space = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.space);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("span", __assign({}, p, {
    className: "amplify-space",
    style: style
  }), props.children));
};

exports.NavBar = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.navBar);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: "amplify-nav-bar",
    style: style
  }), props.children));
};

exports.Nav = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.nav);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: "amplify-nav",
    style: style
  }), props.children));
};

exports.NavRight = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.navRight);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: "amplify-nav-right",
    style: style
  }), props.children));
};

exports.NavItem = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.navItem);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("div", __assign({}, p, {
    className: "amplify-nav-item",
    style: style
  }), props.children));
};

exports.NavButton = function (props) {
  var theme = props.theme || AmplifyTheme_1["default"];
  var style = exports.propStyle(props, theme.navButton);
  var p = core_1.JS.objectLessAttributes(props, 'theme');
  return exports.beforeAfter(React.createElement("button", __assign({}, p, {
    className: "amplify-nav-button",
    style: style
  }), exports.beforeAfter(React.createElement("span", {
    style: theme.navButtonContent
  }, props.children))));
};

exports.beforeAfter = function (el) {
  var style = el.props.style || {};
  var before = style.before,
      after = style.after;

  if (!before && !after) {
    return el;
  }

  return React.createElement("span", {
    style: {
      position: 'relative'
    }
  }, before ? React.createElement("span", {
    style: before
  }, before.content) : null, el, after ? React.createElement("span", {
    style: after
  }, after.content) : null);
};

exports.propStyle = function (props, themeStyle) {
  var id = props.id,
      style = props.style;
  var styl = Object.assign({}, style, themeStyle);

  if (!id) {
    return styl;
  }

  var selector = '#' + id;
  Object.assign(styl, styl[selector]);
  return styl;
};

exports.transparent1X1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
exports.white1X1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP7//wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';

/***/ }),

/***/ "./lib/Analytics/index.js":
/*!********************************!*\
  !*** ./lib/Analytics/index.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

function __export(m) {
  for (var p in m) {
    if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

__export(__webpack_require__(/*! ./trackLifecycle */ "./lib/Analytics/trackLifecycle.js"));

__export(__webpack_require__(/*! ./trackUpdate */ "./lib/Analytics/trackUpdate.js"));

/***/ }),

/***/ "./lib/Analytics/trackLifecycle.js":
/*!*****************************************!*\
  !*** ./lib/Analytics/trackLifecycle.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

var __assign = this && this.__assign || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var react_1 = __webpack_require__(/*! react */ "react");

var analytics_1 = __webpack_require__(/*! @aws-amplify/analytics */ "@aws-amplify/analytics");

var Default_Track_Events = ['componentDidMount', 'componentDidUpdate', 'compomentWillUnmount', 'compomentDidCatch', 'render'];

function trackLifecycle(Comp, trackerName, events) {
  if (events === void 0) {
    events = Default_Track_Events;
  }

  return (
    /** @class */
    function (_super) {
      __extends(WithTrackLifecycle, _super);

      function WithTrackLifecycle(props) {
        var _this = _super.call(this, props) || this;

        _this.trackerName = trackerName;
        _this.trackEvents = events;

        _this.track('constructor');

        return _this;
      }

      WithTrackLifecycle.prototype.track = function (event) {
        var filtered = this.trackEvents.filter(function (item) {
          return item === event;
        });

        if (filtered.length > 0) {
          if (analytics_1["default"] && typeof analytics_1["default"].record === 'function') {
            analytics_1["default"].record({
              name: this.trackerName,
              attributes: {
                event: event
              }
            });
          } else {
            throw new Error('No Analytics module found, please ensure @aws-amplify/analytics is imported');
          }
        }
      };

      WithTrackLifecycle.prototype.componentWillMount = function () {
        this.track('componentWillMount');
      };

      WithTrackLifecycle.prototype.componentDidMount = function () {
        this.track('componentDidMount');
      };

      WithTrackLifecycle.prototype.componentWillUnmount = function () {
        this.track('componentWillUnmount');
      };

      WithTrackLifecycle.prototype.componentDidCatch = function () {
        this.track('componentDidCatch');
      };

      WithTrackLifecycle.prototype.componentWillReceiveProps = function () {
        this.track('componentWillReceiveProps');
      };

      WithTrackLifecycle.prototype.shouldComponentUpdate = function () {
        this.track('shouldComponentUpdate');
        return true;
      };

      WithTrackLifecycle.prototype.componentWillUpdate = function () {
        this.track('componentWillUpdate');
      };

      WithTrackLifecycle.prototype.componentDidUpdate = function () {
        this.track('componentDidUpdate');
      };

      WithTrackLifecycle.prototype.setState = function () {
        this.track('setState');
      };

      WithTrackLifecycle.prototype.forceUpdate = function () {
        this.track('forceUpdate');
      };

      WithTrackLifecycle.prototype.render = function () {
        this.track('render');
        return React.createElement(Comp, __assign({}, this.props));
      };

      return WithTrackLifecycle;
    }(react_1.Component)
  );
}

exports.trackLifecycle = trackLifecycle;

/***/ }),

/***/ "./lib/Analytics/trackUpdate.js":
/*!**************************************!*\
  !*** ./lib/Analytics/trackUpdate.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

var __assign = this && this.__assign || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var react_1 = __webpack_require__(/*! react */ "react");

var analytics_1 = __webpack_require__(/*! @aws-amplify/analytics */ "@aws-amplify/analytics");

function trackUpdate(Comp, trackerName) {
  return (
    /** @class */
    function (_super) {
      __extends(class_1, _super);

      function class_1(props) {
        var _this = _super.call(this, props) || this;

        _this.trackerName = trackerName;
        return _this;
      }

      class_1.prototype.componentDidUpdate = function (prevProps, prevState) {
        var attributes = Object.assign({}, this.props, this.state);

        if (analytics_1["default"] && typeof analytics_1["default"].record === 'function') {
          analytics_1["default"].record({
            name: this.trackerName,
            attributes: attributes
          });
        } else {
          throw new Error('No Analytics module found, please ensure @aws-amplify/analytics is imported');
        }
      };

      class_1.prototype.render = function () {
        return React.createElement(Comp, __assign({}, this.props));
      };

      return class_1;
    }(react_1.Component)
  );
}

exports.trackUpdate = trackUpdate;

/***/ }),

/***/ "./lib/Auth/AuthPiece.js":
/*!*******************************!*\
  !*** ./lib/Auth/AuthPiece.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

var __extends = this && this.__extends || function () {
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

var _a;

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var types_1 = __webpack_require__(/*! ./common/types */ "./lib/Auth/common/types.js");

var PhoneField_1 = __webpack_require__(/*! ./PhoneField */ "./lib/Auth/PhoneField.js");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var labelMap = (_a = {}, _a[types_1.UsernameAttributes.EMAIL] = 'Email', _a[types_1.UsernameAttributes.PHONE_NUMBER] = 'Phone Number', _a[types_1.UsernameAttributes.USERNAME] = 'Username', _a);

var AuthPiece =
/** @class */
function (_super) {
  __extends(AuthPiece, _super);

  function AuthPiece(props) {
    var _this = _super.call(this, props) || this;

    _this.inputs = {};
    _this._isHidden = true;
    _this._validAuthStates = [];
    _this.phone_number = '';
    _this.changeState = _this.changeState.bind(_this);
    _this.error = _this.error.bind(_this);
    _this.handleInputChange = _this.handleInputChange.bind(_this);
    _this.renderUsernameField = _this.renderUsernameField.bind(_this);
    _this.getUsernameFromInput = _this.getUsernameFromInput.bind(_this);
    _this.onPhoneNumberChanged = _this.onPhoneNumberChanged.bind(_this);
    return _this;
  }

  AuthPiece.prototype.componentDidMount = function () {
    if (window && window.location && window.location.search) {
      if (!this.props.authData || !this.props.authData.username) {
        var searchParams = new URLSearchParams(window.location.search);
        var username = searchParams ? searchParams.get('username') : undefined;
        this.setState({
          username: username
        });
      }
    }
  };

  AuthPiece.prototype.getUsernameFromInput = function () {
    var _a = this.props.usernameAttributes,
        usernameAttributes = _a === void 0 ? 'username' : _a;

    switch (usernameAttributes) {
      case types_1.UsernameAttributes.EMAIL:
        return this.inputs.email;

      case types_1.UsernameAttributes.PHONE_NUMBER:
        return this.phone_number;

      default:
        return this.inputs.username || this.state.username;
    }
  };

  AuthPiece.prototype.onPhoneNumberChanged = function (phone_number) {
    this.phone_number = phone_number;
  };

  AuthPiece.prototype.renderUsernameField = function (theme) {
    var _a = this.props.usernameAttributes,
        usernameAttributes = _a === void 0 ? [] : _a;

    if (usernameAttributes === types_1.UsernameAttributes.EMAIL) {
      return React.createElement(Amplify_UI_Components_React_1.FormField, {
        theme: theme
      }, React.createElement(Amplify_UI_Components_React_1.InputLabel, {
        theme: theme
      }, core_1.I18n.get('Email'), " *"), React.createElement(Amplify_UI_Components_React_1.Input, {
        autoFocus: true,
        placeholder: core_1.I18n.get('Enter your email'),
        theme: theme,
        key: "email",
        name: "email",
        type: "email",
        onChange: this.handleInputChange,
        "data-test": data_test_attributes_1.auth.genericAttrs.emailInput
      }));
    } else if (usernameAttributes === types_1.UsernameAttributes.PHONE_NUMBER) {
      return React.createElement(PhoneField_1.PhoneField, {
        theme: theme,
        onChangeText: this.onPhoneNumberChanged
      });
    } else {
      return React.createElement(Amplify_UI_Components_React_1.FormField, {
        theme: theme
      }, React.createElement(Amplify_UI_Components_React_1.InputLabel, {
        theme: theme
      }, core_1.I18n.get(this.getUsernameLabel()), " *"), React.createElement(Amplify_UI_Components_React_1.Input, {
        defaultValue: this.state.username,
        autoFocus: true,
        placeholder: core_1.I18n.get('Enter your username'),
        theme: theme,
        key: "username",
        name: "username",
        onChange: this.handleInputChange,
        "data-test": data_test_attributes_1.auth.genericAttrs.usernameInput
      }));
    }
  };

  AuthPiece.prototype.getUsernameLabel = function () {
    var _a = this.props.usernameAttributes,
        usernameAttributes = _a === void 0 ? types_1.UsernameAttributes.USERNAME : _a;
    return labelMap[usernameAttributes] || usernameAttributes;
  }; // extract username from authData


  AuthPiece.prototype.usernameFromAuthData = function () {
    var authData = this.props.authData;

    if (!authData) {
      return '';
    }

    var username = '';

    if (_typeof(authData) === 'object') {
      // user object
      username = authData.user ? authData.user.username : authData.username;
    } else {
      username = authData; // username string
    }

    return username;
  };

  AuthPiece.prototype.errorMessage = function (err) {
    if (typeof err === 'string') {
      return err;
    }

    return err.message ? err.message : JSON.stringify(err);
  };

  AuthPiece.prototype.triggerAuthEvent = function (event) {
    var state = this.props.authState;

    if (this.props.onAuthEvent) {
      this.props.onAuthEvent(state, event);
    }
  };

  AuthPiece.prototype.changeState = function (state, data) {
    if (this.props.onStateChange) {
      this.props.onStateChange(state, data);
    }

    this.triggerAuthEvent({
      type: 'stateChange',
      data: state
    });
  };

  AuthPiece.prototype.error = function (err) {
    this.triggerAuthEvent({
      type: 'error',
      data: this.errorMessage(err)
    });
  };

  AuthPiece.prototype.handleInputChange = function (evt) {
    this.inputs = this.inputs || {};
    var _a = evt.target,
        name = _a.name,
        value = _a.value,
        type = _a.type,
        checked = _a.checked;
    var check_type = ['radio', 'checkbox'].includes(type);
    this.inputs[name] = check_type ? checked : value;
    this.inputs['checkedValue'] = check_type ? value : null;
  };

  AuthPiece.prototype.render = function () {
    if (!this._validAuthStates.includes(this.props.authState)) {
      this._isHidden = true;
      this.inputs = {};
      return null;
    }

    if (this._isHidden) {
      this.inputs = {};
      var track = this.props.track;
      if (track) track();
    }

    this._isHidden = false;
    return this.showComponent(this.props.theme || Amplify_UI_Theme_1["default"]);
  };

  AuthPiece.prototype.showComponent = function (_theme) {
    throw 'You must implement showComponent(theme) and don\'t forget to set this._validAuthStates.';
  };

  return AuthPiece;
}(React.Component);

exports["default"] = AuthPiece;

/***/ }),

/***/ "./lib/Auth/Authenticator.js":
/*!***********************************!*\
  !*** ./lib/Auth/Authenticator.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var Greetings_1 = __webpack_require__(/*! ./Greetings */ "./lib/Auth/Greetings.js");

var SignIn_1 = __webpack_require__(/*! ./SignIn */ "./lib/Auth/SignIn.js");

var ConfirmSignIn_1 = __webpack_require__(/*! ./ConfirmSignIn */ "./lib/Auth/ConfirmSignIn.js");

var RequireNewPassword_1 = __webpack_require__(/*! ./RequireNewPassword */ "./lib/Auth/RequireNewPassword.js");

var SignUp_1 = __webpack_require__(/*! ./SignUp */ "./lib/Auth/SignUp.js");

var Loading_1 = __webpack_require__(/*! ./Loading */ "./lib/Auth/Loading.js");

var ConfirmSignUp_1 = __webpack_require__(/*! ./ConfirmSignUp */ "./lib/Auth/ConfirmSignUp.js");

var VerifyContact_1 = __webpack_require__(/*! ./VerifyContact */ "./lib/Auth/VerifyContact.js");

var ForgotPassword_1 = __webpack_require__(/*! ./ForgotPassword */ "./lib/Auth/ForgotPassword.js");

var TOTPSetup_1 = __webpack_require__(/*! ./TOTPSetup */ "./lib/Auth/TOTPSetup.js");

var constants_1 = __webpack_require__(/*! ./common/constants */ "./lib/Auth/common/constants.js");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var AmplifyMessageMap_1 = __webpack_require__(/*! ../AmplifyMessageMap */ "./lib/AmplifyMessageMap.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var logger = new core_1.ConsoleLogger('Authenticator');
var AUTHENTICATOR_AUTHSTATE = 'amplify-authenticator-authState';

exports.EmptyContainer = function (_a) {
  var children = _a.children;
  return React.createElement(React.Fragment, null, children);
};

var Authenticator =
/** @class */
function (_super) {
  __extends(Authenticator, _super);

  function Authenticator(props) {
    var _this = _super.call(this, props) || this;

    _this.handleStateChange = _this.handleStateChange.bind(_this);
    _this.handleAuthEvent = _this.handleAuthEvent.bind(_this);
    _this.onHubCapsule = _this.onHubCapsule.bind(_this);
    _this._initialAuthState = _this.props.authState || 'signIn';
    _this.state = {
      authState: 'loading'
    };
    core_1.Hub.listen('auth', _this.onHubCapsule);
    return _this;
  }

  Authenticator.prototype.componentDidMount = function () {
    var config = this.props.amplifyConfig;

    if (config) {
      core_1["default"].configure(config);
    }

    this._isMounted = true; // The workaround for Cognito Hosted UI:
    // Don't check the user immediately if redirected back from Hosted UI as
    // it might take some time for credentials to be available, instead
    // wait for the hub event sent from Auth module. This item in the
    // localStorage is a mark to indicate whether the app is just redirected
    // back from Hosted UI or not and is set in Auth:handleAuthResponse.

    var byHostedUI = localStorage.getItem(constants_1["default"].REDIRECTED_FROM_HOSTED_UI);
    localStorage.removeItem(constants_1["default"].REDIRECTED_FROM_HOSTED_UI);
    if (byHostedUI !== 'true') this.checkUser();
  };

  Authenticator.prototype.componentWillUnmount = function () {
    this._isMounted = false;
  };

  Authenticator.prototype.checkUser = function () {
    var _this = this;

    if (!auth_1["default"] || typeof auth_1["default"].currentAuthenticatedUser !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    return auth_1["default"].currentAuthenticatedUser().then(function (user) {
      if (!_this._isMounted) {
        return;
      }

      _this.handleStateChange('signedIn', user);
    })["catch"](function (err) {
      if (!_this._isMounted) {
        return;
      }

      var cachedAuthState = null;

      try {
        cachedAuthState = localStorage.getItem(AUTHENTICATOR_AUTHSTATE);
      } catch (e) {
        logger.debug('Failed to get the auth state from local storage', e);
      }

      var promise = cachedAuthState === 'signedIn' ? auth_1["default"].signOut() : Promise.resolve();
      promise.then(function () {
        return _this.handleStateChange(_this._initialAuthState);
      })["catch"](function (e) {
        logger.debug('Failed to sign out', e);
      });
    });
  };

  Authenticator.prototype.onHubCapsule = function (capsule) {
    var channel = capsule.channel,
        payload = capsule.payload,
        source = capsule.source;

    if (channel === 'auth') {
      switch (payload.event) {
        case 'cognitoHostedUI':
          this.handleStateChange('signedIn', payload.data);
          break;

        case 'cognitoHostedUI_failure':
          this.handleStateChange('signIn', null);
          break;

        case 'parsingUrl_failure':
          this.handleStateChange('signIn', null);
          break;

        case 'signOut':
          this.handleStateChange('signIn', null);
          break;

        case 'customGreetingSignOut':
          this.handleStateChange('signIn', null);
          break;

        default:
          break;
      }
    }
  };

  Authenticator.prototype.handleStateChange = function (state, data) {
    logger.debug('authenticator state change ' + state, data);

    if (state === this.state.authState) {
      return;
    }

    if (state === 'signedOut') {
      state = 'signIn';
    }

    try {
      localStorage.setItem(AUTHENTICATOR_AUTHSTATE, state);
    } catch (e) {
      logger.debug('Failed to set the auth state into local storage', e);
    }

    if (this._isMounted) {
      this.setState({
        authState: state,
        authData: data,
        error: null,
        showToast: false
      });
    }

    if (this.props.onStateChange) {
      this.props.onStateChange(state, data);
    }
  };

  Authenticator.prototype.handleAuthEvent = function (state, event, showToast) {
    if (showToast === void 0) {
      showToast = true;
    }

    if (event.type === 'error') {
      var map = this.props.errorMessage || AmplifyMessageMap_1["default"];
      var message = typeof map === 'string' ? map : map(event.data);
      this.setState({
        error: message,
        showToast: showToast
      });
    }
  };

  Authenticator.prototype.render = function () {
    var _this = this;

    var _a = this.state,
        authState = _a.authState,
        authData = _a.authData;
    var theme = this.props.theme || Amplify_UI_Theme_1["default"];
    var messageMap = this.props.errorMessage || AmplifyMessageMap_1["default"]; // If container prop is undefined, default to AWS Amplify UI Container
    // otherwise if truthy, use the supplied render prop
    // otherwise if falsey, use EmptyContainer

    var Wrapper = this.props.container === undefined ? Amplify_UI_Components_React_1.Container : this.props.container || exports.EmptyContainer;
    var _b = this.props,
        hideDefault = _b.hideDefault,
        _c = _b.hide,
        hide = _c === void 0 ? [] : _c,
        federated = _b.federated,
        signUpConfig = _b.signUpConfig,
        usernameAttributes = _b.usernameAttributes;

    if (hideDefault) {
      hide = hide.concat([Greetings_1["default"], SignIn_1["default"], ConfirmSignIn_1["default"], RequireNewPassword_1["default"], SignUp_1["default"], ConfirmSignUp_1["default"], VerifyContact_1["default"], ForgotPassword_1["default"], TOTPSetup_1["default"], Loading_1["default"]]);
    }

    var props_children = [];

    if (_typeof(this.props.children) === 'object') {
      if (Array.isArray(this.props.children)) {
        props_children = this.props.children;
      } else {
        props_children.push(this.props.children);
      }
    }

    var default_children = [React.createElement(Greetings_1["default"], {
      federated: federated
    }), React.createElement(SignIn_1["default"], {
      federated: federated
    }), React.createElement(ConfirmSignIn_1["default"], null), React.createElement(RequireNewPassword_1["default"], null), React.createElement(SignUp_1["default"], {
      signUpConfig: signUpConfig
    }), React.createElement(ConfirmSignUp_1["default"], null), React.createElement(VerifyContact_1["default"], null), React.createElement(ForgotPassword_1["default"], null), React.createElement(TOTPSetup_1["default"], null), React.createElement(Loading_1["default"], null)];
    var props_children_override = React.Children.map(props_children, function (child) {
      return child.props.override;
    });
    hide = hide.filter(function (component) {
      return !props_children.find(function (child) {
        return child.type === component;
      });
    });
    var render_props_children = React.Children.map(props_children, function (child, index) {
      return React.cloneElement(child, {
        key: 'aws-amplify-authenticator-props-children-' + index,
        theme: theme,
        messageMap: messageMap,
        authState: authState,
        authData: authData,
        onStateChange: _this.handleStateChange,
        onAuthEvent: _this.handleAuthEvent,
        hide: hide,
        override: props_children_override,
        usernameAttributes: usernameAttributes
      });
    });
    var render_default_children = hideDefault ? [] : React.Children.map(default_children, function (child, index) {
      return React.cloneElement(child, {
        key: 'aws-amplify-authenticator-default-children-' + index,
        theme: theme,
        messageMap: messageMap,
        authState: authState,
        authData: authData,
        onStateChange: _this.handleStateChange,
        onAuthEvent: _this.handleAuthEvent,
        hide: hide,
        override: props_children_override,
        usernameAttributes: usernameAttributes
      });
    });
    var render_children = render_default_children.concat(render_props_children);
    var error = this.state.error;
    return React.createElement(Wrapper, {
      theme: theme
    }, this.state.showToast && React.createElement(Amplify_UI_Components_React_1.Toast, {
      theme: theme,
      onClose: function onClose() {
        return _this.setState({
          showToast: false
        });
      },
      "data-test": data_test_attributes_1.auth.signIn.signInError
    }, core_1.I18n.get(error)), render_children);
  };

  return Authenticator;
}(React.Component);

exports["default"] = Authenticator;

/***/ }),

/***/ "./lib/Auth/ConfirmSignIn.js":
/*!***********************************!*\
  !*** ./lib/Auth/ConfirmSignIn.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var AuthPiece_1 = __webpack_require__(/*! ./AuthPiece */ "./lib/Auth/AuthPiece.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var ConfirmSignIn =
/** @class */
function (_super) {
  __extends(ConfirmSignIn, _super);

  function ConfirmSignIn(props) {
    var _this = _super.call(this, props) || this;

    _this._validAuthStates = ['confirmSignIn'];
    _this.confirm = _this.confirm.bind(_this);
    _this.checkContact = _this.checkContact.bind(_this);
    _this.state = {
      mfaType: 'SMS'
    };
    return _this;
  }

  ConfirmSignIn.prototype.checkContact = function (user) {
    var _this = this;

    if (!auth_1["default"] || typeof auth_1["default"].verifiedContact !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].verifiedContact(user).then(function (data) {
      if (!core_1.JS.isEmpty(data.verified)) {
        _this.changeState('signedIn', user);
      } else {
        var newUser = Object.assign(user, data);

        _this.changeState('verifyContact', newUser);
      }
    });
  };

  ConfirmSignIn.prototype.confirm = function (event) {
    var _this = this;

    if (event) {
      event.preventDefault();
    }

    var user = this.props.authData;
    var code = this.inputs.code;
    var mfaType = user.challengeName === 'SOFTWARE_TOKEN_MFA' ? 'SOFTWARE_TOKEN_MFA' : null;

    if (!auth_1["default"] || typeof auth_1["default"].confirmSignIn !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].confirmSignIn(user, code, mfaType).then(function () {
      _this.checkContact(user);
    })["catch"](function (err) {
      return _this.error(err);
    });
  };

  ConfirmSignIn.prototype.componentDidUpdate = function () {
    // logger.debug('component did update with props', this.props);
    var user = this.props.authData;
    var mfaType = user && user.challengeName === 'SOFTWARE_TOKEN_MFA' ? 'TOTP' : 'SMS';
    if (this.state.mfaType !== mfaType) this.setState({
      mfaType: mfaType
    });
  };

  ConfirmSignIn.prototype.showComponent = function (theme) {
    var _this = this;

    var hide = this.props.hide;

    if (hide && hide.includes(ConfirmSignIn)) {
      return null;
    }

    return React.createElement(Amplify_UI_Components_React_1.FormSection, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.confirmSignIn.section
    }, React.createElement(Amplify_UI_Components_React_1.SectionHeader, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.confirmSignIn.headerSection
    }, core_1.I18n.get('Confirm ' + this.state.mfaType + ' Code')), React.createElement("form", {
      onSubmit: this.confirm,
      "data-test": data_test_attributes_1.auth.confirmSignIn.bodySection
    }, React.createElement(Amplify_UI_Components_React_1.SectionBody, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.FormField, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.InputLabel, {
      theme: theme
    }, core_1.I18n.get('Code'), " *"), React.createElement(Amplify_UI_Components_React_1.Input, {
      autoFocus: true,
      placeholder: core_1.I18n.get('Code'),
      theme: theme,
      key: "code",
      name: "code",
      autoComplete: "off",
      onChange: this.handleInputChange,
      "data-test": data_test_attributes_1.auth.confirmSignIn.codeInput
    }))), React.createElement(Amplify_UI_Components_React_1.SectionFooter, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.SectionFooterPrimaryContent, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.confirmSignIn.confirmButton
    }, React.createElement(Amplify_UI_Components_React_1.Button, {
      theme: theme,
      type: "submit"
    }, core_1.I18n.get('Confirm'))), React.createElement(Amplify_UI_Components_React_1.SectionFooterSecondaryContent, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.Link, {
      theme: theme,
      onClick: function onClick() {
        return _this.changeState('signIn');
      },
      "data-test": data_test_attributes_1.auth.confirmSignIn.backToSignInLink
    }, core_1.I18n.get('Back to Sign In'))))));
  };

  return ConfirmSignIn;
}(AuthPiece_1["default"]);

exports["default"] = ConfirmSignIn;

/***/ }),

/***/ "./lib/Auth/ConfirmSignUp.js":
/*!***********************************!*\
  !*** ./lib/Auth/ConfirmSignUp.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var AuthPiece_1 = __webpack_require__(/*! ./AuthPiece */ "./lib/Auth/AuthPiece.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var logger = new core_1.ConsoleLogger('ConfirmSignUp');

var ConfirmSignUp =
/** @class */
function (_super) {
  __extends(ConfirmSignUp, _super);

  function ConfirmSignUp(props) {
    var _this = _super.call(this, props) || this;

    _this._validAuthStates = ['confirmSignUp'];
    _this.confirm = _this.confirm.bind(_this);
    _this.resend = _this.resend.bind(_this);
    return _this;
  }

  ConfirmSignUp.prototype.confirm = function () {
    var _this = this;

    var username = this.usernameFromAuthData() || this.inputs.username;
    var code = this.inputs.code;

    if (!auth_1["default"] || typeof auth_1["default"].confirmSignUp !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].confirmSignUp(username, code).then(function () {
      return _this.changeState('signedUp');
    })["catch"](function (err) {
      return _this.error(err);
    });
  };

  ConfirmSignUp.prototype.resend = function () {
    var _this = this;

    var username = this.usernameFromAuthData() || this.inputs.username;

    if (!auth_1["default"] || typeof auth_1["default"].resendSignUp !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].resendSignUp(username).then(function () {
      return logger.debug('code resent');
    })["catch"](function (err) {
      return _this.error(err);
    });
  };

  ConfirmSignUp.prototype.showComponent = function (theme) {
    var _this = this;

    var hide = this.props.hide;
    var username = this.usernameFromAuthData();

    if (hide && hide.includes(ConfirmSignUp)) {
      return null;
    }

    return React.createElement(Amplify_UI_Components_React_1.FormSection, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.confirmSignUp.section
    }, React.createElement(Amplify_UI_Components_React_1.SectionHeader, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.confirmSignUp.headerSection
    }, core_1.I18n.get('Confirm Sign Up')), React.createElement(Amplify_UI_Components_React_1.SectionBody, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.confirmSignUp.bodySection
    }, React.createElement(Amplify_UI_Components_React_1.FormField, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.InputLabel, {
      theme: theme
    }, core_1.I18n.get(this.getUsernameLabel()), " *"), React.createElement(Amplify_UI_Components_React_1.Input, {
      placeholder: core_1.I18n.get('Username'),
      theme: theme,
      key: "username",
      name: "username",
      onChange: this.handleInputChange,
      disabled: username,
      value: username ? username : '',
      "data-test": data_test_attributes_1.auth.confirmSignUp.usernameInput
    })), React.createElement(Amplify_UI_Components_React_1.FormField, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.InputLabel, {
      theme: theme
    }, core_1.I18n.get('Confirmation Code'), " *"), React.createElement(Amplify_UI_Components_React_1.Input, {
      autoFocus: true,
      placeholder: core_1.I18n.get('Enter your code'),
      theme: theme,
      key: "code",
      name: "code",
      autoComplete: "off",
      onChange: this.handleInputChange,
      "data-test": data_test_attributes_1.auth.confirmSignUp.confirmationCodeInput
    }), React.createElement(Amplify_UI_Components_React_1.Hint, {
      theme: theme
    }, core_1.I18n.get('Lost your code? '), React.createElement(Amplify_UI_Components_React_1.Link, {
      theme: theme,
      onClick: this.resend,
      "data-test": data_test_attributes_1.auth.confirmSignUp.resendCodeLink
    }, core_1.I18n.get('Resend Code'))))), React.createElement(Amplify_UI_Components_React_1.SectionFooter, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.SectionFooterPrimaryContent, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.Button, {
      theme: theme,
      onClick: this.confirm,
      "data-test": data_test_attributes_1.auth.confirmSignUp.confirmButton
    }, core_1.I18n.get('Confirm'))), React.createElement(Amplify_UI_Components_React_1.SectionFooterSecondaryContent, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.Link, {
      theme: theme,
      onClick: function onClick() {
        return _this.changeState('signIn');
      },
      "data-test": data_test_attributes_1.auth.confirmSignUp.backToSignInLink
    }, core_1.I18n.get('Back to Sign In')))));
  };

  return ConfirmSignUp;
}(AuthPiece_1["default"]);

exports["default"] = ConfirmSignUp;

/***/ }),

/***/ "./lib/Auth/FederatedSignIn.js":
/*!*************************************!*\
  !*** ./lib/Auth/FederatedSignIn.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var Provider_1 = __webpack_require__(/*! ./Provider */ "./lib/Auth/Provider/index.js");

var logger = new core_1.ConsoleLogger('FederatedSignIn');

var FederatedButtons =
/** @class */
function (_super) {
  __extends(FederatedButtons, _super);

  function FederatedButtons() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  FederatedButtons.prototype.google = function (google_client_id) {
    if (!google_client_id) {
      return null;
    }

    var _a = this.props,
        theme = _a.theme,
        onStateChange = _a.onStateChange;
    return React.createElement(Provider_1.GoogleButton, {
      google_client_id: google_client_id,
      theme: theme,
      onStateChange: onStateChange
    });
  };

  FederatedButtons.prototype.facebook = function (facebook_app_id) {
    if (!facebook_app_id) {
      return null;
    }

    var _a = this.props,
        theme = _a.theme,
        onStateChange = _a.onStateChange;
    return React.createElement(Provider_1.FacebookButton, {
      facebook_app_id: facebook_app_id,
      theme: theme,
      onStateChange: onStateChange
    });
  };

  FederatedButtons.prototype.amazon = function (amazon_client_id) {
    if (!amazon_client_id) {
      return null;
    }

    var _a = this.props,
        theme = _a.theme,
        onStateChange = _a.onStateChange;
    return React.createElement(Provider_1.AmazonButton, {
      amazon_client_id: amazon_client_id,
      theme: theme,
      onStateChange: onStateChange
    });
  };

  FederatedButtons.prototype.OAuth = function (oauth_config) {
    if (!oauth_config) {
      return null;
    }

    var _a = this.props,
        theme = _a.theme,
        onStateChange = _a.onStateChange;
    return React.createElement(Provider_1.OAuthButton, {
      label: oauth_config ? oauth_config.label : undefined,
      theme: theme,
      onStateChange: onStateChange
    });
  };

  FederatedButtons.prototype.auth0 = function (auth0) {
    if (!auth0) {
      return null;
    }

    var _a = this.props,
        theme = _a.theme,
        onStateChange = _a.onStateChange;
    return React.createElement(Provider_1.Auth0Button, {
      label: auth0 ? auth0.label : undefined,
      theme: theme,
      onStateChange: onStateChange,
      auth0: auth0
    });
  };

  FederatedButtons.prototype.render = function () {
    var authState = this.props.authState;

    if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) {
      return null;
    }

    var federated = this.props.federated || {};

    if (!auth_1["default"] || typeof auth_1["default"].configure !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    } // @ts-ignore


    var _a = auth_1["default"].configure().oauth,
        oauth = _a === void 0 ? {} : _a; // backward compatibility

    if (oauth['domain']) {
      federated.oauth_config = Object.assign({}, federated.oauth_config, oauth); // @ts-ignore
    } else if (oauth.awsCognito) {
      // @ts-ignore
      federated.oauth_config = Object.assign({}, federated.oauth_config, // @ts-ignore
      oauth.awsCognito);
    } // @ts-ignore


    if (oauth.auth0) {
      // @ts-ignore
      federated.auth0 = Object.assign({}, federated.auth0, oauth.auth0);
    }

    if (core_1.JS.isEmpty(federated)) {
      return null;
    }

    var google_client_id = federated.google_client_id,
        facebook_app_id = federated.facebook_app_id,
        amazon_client_id = federated.amazon_client_id,
        oauth_config = federated.oauth_config,
        auth0 = federated.auth0;
    var theme = this.props.theme || Amplify_UI_Theme_1["default"];
    return React.createElement("div", null, React.createElement("div", null, this.google(google_client_id)), React.createElement("div", null, this.facebook(facebook_app_id)), React.createElement("div", null, this.amazon(amazon_client_id)), React.createElement("div", null, this.OAuth(oauth_config)), React.createElement("div", null, this.auth0(auth0)), React.createElement(Amplify_UI_Components_React_1.Strike, {
      theme: theme
    }, core_1.I18n.get('or')));
  };

  return FederatedButtons;
}(React.Component);

exports.FederatedButtons = FederatedButtons;

var FederatedSignIn =
/** @class */
function (_super) {
  __extends(FederatedSignIn, _super);

  function FederatedSignIn() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  FederatedSignIn.prototype.render = function () {
    var _a = this.props,
        authState = _a.authState,
        onStateChange = _a.onStateChange;
    var federated = this.props.federated || {};

    if (!auth_1["default"] || typeof auth_1["default"].configure !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    } // @ts-ignore


    var _b = auth_1["default"].configure().oauth,
        oauth = _b === void 0 ? {} : _b; // backward compatibility

    if (oauth['domain']) {
      federated.oauth_config = Object.assign({}, federated.oauth_config, oauth); // @ts-ignore
    } else if (oauth.awsCognito) {
      // @ts-ignore
      federated.oauth_config = Object.assign({}, federated.oauth_config, // @ts-ignore
      oauth.awsCognito);
    } // @ts-ignore


    if (oauth.auth0) {
      // @ts-ignore
      federated.auth0 = Object.assign({}, federated.auth0, oauth.auth0);
    }

    if (!federated) {
      logger.debug('federated prop is empty. show nothing');
      logger.debug('federated={google_client_id: , facebook_app_id: , amazon_client_id}');
      return null;
    } // @ts-ignore


    if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) {
      return null;
    }

    logger.debug('federated Config is', federated);
    var theme = this.props.theme || Amplify_UI_Theme_1["default"];
    return React.createElement(Amplify_UI_Components_React_1.FormSection, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.federatedSignIn.section
    }, React.createElement(Amplify_UI_Components_React_1.SectionBody, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.federatedSignIn.bodySection
    }, React.createElement(FederatedButtons, {
      federated: federated,
      theme: theme,
      authState: authState,
      onStateChange: onStateChange,
      "data-test": data_test_attributes_1.auth.federatedSignIn.signInButtons
    })));
  };

  return FederatedSignIn;
}(React.Component);

exports["default"] = FederatedSignIn;

/***/ }),

/***/ "./lib/Auth/ForgotPassword.js":
/*!************************************!*\
  !*** ./lib/Auth/ForgotPassword.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var AuthPiece_1 = __webpack_require__(/*! ./AuthPiece */ "./lib/Auth/AuthPiece.js");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var logger = new core_1.ConsoleLogger('ForgotPassword');

var ForgotPassword =
/** @class */
function (_super) {
  __extends(ForgotPassword, _super);

  function ForgotPassword(props) {
    var _this = _super.call(this, props) || this;

    _this.send = _this.send.bind(_this);
    _this.submit = _this.submit.bind(_this);
    _this._validAuthStates = ['forgotPassword'];
    _this.state = {
      delivery: null
    };
    return _this;
  }

  ForgotPassword.prototype.send = function () {
    var _this = this;

    var _a = this.props.authData,
        authData = _a === void 0 ? {} : _a;
    var username = this.getUsernameFromInput() || authData.username;

    if (!auth_1["default"] || typeof auth_1["default"].forgotPassword !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].forgotPassword(username).then(function (data) {
      logger.debug(data);

      _this.setState({
        delivery: data.CodeDeliveryDetails
      });
    })["catch"](function (err) {
      return _this.error(err);
    });
  };

  ForgotPassword.prototype.submit = function () {
    var _this = this;

    var _a = this.props.authData,
        authData = _a === void 0 ? {} : _a;
    var _b = this.inputs,
        code = _b.code,
        password = _b.password;
    var username = this.getUsernameFromInput() || authData.username;

    if (!auth_1["default"] || typeof auth_1["default"].forgotPasswordSubmit !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].forgotPasswordSubmit(username, code, password).then(function (data) {
      logger.debug(data);

      _this.changeState('signIn');

      _this.setState({
        delivery: null
      });
    })["catch"](function (err) {
      return _this.error(err);
    });
  };

  ForgotPassword.prototype.sendView = function () {
    var theme = this.props.theme || Amplify_UI_Theme_1["default"];
    return React.createElement("div", null, this.renderUsernameField(theme));
  };

  ForgotPassword.prototype.submitView = function () {
    var theme = this.props.theme || Amplify_UI_Theme_1["default"];
    return React.createElement("div", null, React.createElement(Amplify_UI_Components_React_1.FormField, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.InputLabel, {
      theme: theme
    }, core_1.I18n.get('Code'), " *"), React.createElement(Amplify_UI_Components_React_1.Input, {
      placeholder: core_1.I18n.get('Code'),
      theme: theme,
      key: "code",
      name: "code",
      autoComplete: "off",
      onChange: this.handleInputChange
    })), React.createElement(Amplify_UI_Components_React_1.FormField, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.InputLabel, {
      theme: theme
    }, core_1.I18n.get('New Password'), " *"), React.createElement(Amplify_UI_Components_React_1.Input, {
      placeholder: core_1.I18n.get('New Password'),
      theme: theme,
      type: "password",
      key: "password",
      name: "password",
      autoComplete: "off",
      onChange: this.handleInputChange
    })));
  };

  ForgotPassword.prototype.showComponent = function (theme) {
    var _this = this;

    var _a = this.props,
        authState = _a.authState,
        hide = _a.hide,
        _b = _a.authData,
        authData = _b === void 0 ? {} : _b;

    if (hide && hide.includes(ForgotPassword)) {
      return null;
    }

    return React.createElement(Amplify_UI_Components_React_1.FormSection, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.forgotPassword.section
    }, React.createElement(Amplify_UI_Components_React_1.SectionHeader, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.forgotPassword.headerSection
    }, core_1.I18n.get('Reset your password')), React.createElement(Amplify_UI_Components_React_1.SectionBody, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.forgotPassword.bodySection
    }, this.state.delivery || authData.username ? this.submitView() : this.sendView()), React.createElement(Amplify_UI_Components_React_1.SectionFooter, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.SectionFooterPrimaryContent, {
      theme: theme
    }, this.state.delivery || authData.username ? React.createElement(Amplify_UI_Components_React_1.Button, {
      theme: theme,
      onClick: this.submit,
      "data-test": data_test_attributes_1.auth.forgotPassword.submitButton
    }, core_1.I18n.get('Submit')) : React.createElement(Amplify_UI_Components_React_1.Button, {
      theme: theme,
      onClick: this.send,
      "data-test": data_test_attributes_1.auth.forgotPassword.sendCodeButton
    }, core_1.I18n.get('Send Code'))), React.createElement(Amplify_UI_Components_React_1.SectionFooterSecondaryContent, {
      theme: theme
    }, this.state.delivery || authData.username ? React.createElement(Amplify_UI_Components_React_1.Link, {
      theme: theme,
      onClick: this.send,
      "data-test": data_test_attributes_1.auth.forgotPassword.resendCodeLink
    }, core_1.I18n.get('Resend Code')) : React.createElement(Amplify_UI_Components_React_1.Link, {
      theme: theme,
      onClick: function onClick() {
        return _this.changeState('signIn');
      },
      "data-test": data_test_attributes_1.auth.forgotPassword.backToSignInLink
    }, core_1.I18n.get('Back to Sign In')))));
  };

  return ForgotPassword;
}(AuthPiece_1["default"]);

exports["default"] = ForgotPassword;

/***/ }),

/***/ "./lib/Auth/Greetings.js":
/*!*******************************!*\
  !*** ./lib/Auth/Greetings.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

var __assign = this && this.__assign || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var AuthPiece_1 = __webpack_require__(/*! ./AuthPiece */ "./lib/Auth/AuthPiece.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var SignOut_1 = __webpack_require__(/*! ./SignOut */ "./lib/Auth/SignOut.js");

var Provider_1 = __webpack_require__(/*! ./Provider */ "./lib/Auth/Provider/index.js");

var types_1 = __webpack_require__(/*! ./common/types */ "./lib/Auth/common/types.js");

var logger = new core_1.ConsoleLogger('Greetings');

var Greetings =
/** @class */
function (_super) {
  __extends(Greetings, _super);

  function Greetings(props) {
    var _this = _super.call(this, props) || this;

    _this.state = {};
    _this.onHubCapsule = _this.onHubCapsule.bind(_this);
    _this.inGreeting = _this.inGreeting.bind(_this);
    core_1.Hub.listen('auth', _this.onHubCapsule);
    _this._validAuthStates = ['signedIn'];
    return _this;
  }

  Greetings.prototype.componentDidMount = function () {
    this._isMounted = true;
    this.findState();
  };

  Greetings.prototype.componentWillUnmount = function () {
    this._isMounted = false;
  };

  Greetings.prototype.findState = function () {
    var _this = this;

    if (!this.props.authState && !this.props.authData) {
      auth_1["default"].currentAuthenticatedUser().then(function (user) {
        _this.setState({
          authState: 'signedIn',
          authData: user,
          stateFromStorage: true
        });
      })["catch"](function (err) {
        return logger.debug(err);
      });
    }
  };

  Greetings.prototype.onHubCapsule = function (capsule) {
    if (this._isMounted) {
      var channel = capsule.channel,
          payload = capsule.payload;

      if (channel === 'auth' && payload.event === 'signIn') {
        this.setState({
          authState: 'signedIn',
          authData: payload.data
        });

        if (!this.props.authState) {
          this.setState({
            stateFromStorage: true
          });
        }
      } else if (channel === 'auth' && payload.event === 'signOut' && !this.props.authState) {
        this.setState({
          authState: 'signIn'
        });
      }
    }
  };

  Greetings.prototype.inGreeting = function (name) {
    var _a = this.props.usernameAttributes,
        usernameAttributes = _a === void 0 ? types_1.UsernameAttributes.USERNAME : _a;
    var prefix = usernameAttributes === types_1.UsernameAttributes.USERNAME ? core_1.I18n.get('Hello') + " " : '';
    return "" + prefix + name;
  };

  Greetings.prototype.outGreeting = function () {
    return '';
  };

  Greetings.prototype.userGreetings = function (theme) {
    var user = this.props.authData || this.state.authData;
    var greeting = this.props.inGreeting || this.inGreeting; // get name from attributes first

    var _a = this.props.usernameAttributes,
        usernameAttributes = _a === void 0 ? 'username' : _a;
    var name = '';

    switch (usernameAttributes) {
      case types_1.UsernameAttributes.EMAIL:
        // Email as Username
        name = user.attributes ? user.attributes.email : user.username;
        break;

      case types_1.UsernameAttributes.PHONE_NUMBER:
        // Phone number as Username
        name = user.attributes ? user.attributes.phone_number : user.username;
        break;

      default:
        var nameFromAttr = user.attributes ? user.attributes.name || (user.attributes.given_name ? user.attributes.given_name + ' ' + user.attributes.family_name : undefined) : undefined;
        name = nameFromAttr || user.name || user.username;
        break;
    }

    var message = typeof greeting === 'function' ? greeting(name) : greeting;
    return React.createElement("span", null, React.createElement(Amplify_UI_Components_React_1.NavItem, {
      theme: theme
    }, message), this.renderSignOutButton());
  };

  Greetings.prototype.renderSignOutButton = function () {
    var _a = this.props.federated,
        federated = _a === void 0 ? {} : _a;
    var google_client_id = federated.google_client_id,
        facebook_app_id = federated.facebook_app_id,
        amazon_client_id = federated.amazon_client_id,
        auth0 = federated.auth0; // @ts-ignore

    var config = auth_1["default"].configure();
    var _b = config.oauth,
        oauth = _b === void 0 ? {} : _b; // @ts-ignore

    var googleClientId = google_client_id || config.googleClientId; // @ts-ignore

    var facebookAppId = facebook_app_id || config.facebookClientId; // @ts-ignore

    var amazonClientId = amazon_client_id || config.amazonClientId; // @ts-ignore

    var auth0_config = auth0 || oauth.auth0;
    var SignOutComponent = SignOut_1["default"]; // @ts-ignore

    if (googleClientId) SignOutComponent = Provider_1.withGoogle(SignOut_1["default"]); // @ts-ignore

    if (facebookAppId) SignOutComponent = Provider_1.withFacebook(SignOut_1["default"]); // @ts-ignore

    if (amazonClientId) SignOutComponent = Provider_1.withAmazon(SignOut_1["default"]); // @ts-ignore

    if (auth0_config) SignOutComponent = Provider_1.withAuth0(SignOut_1["default"]);
    var stateAndProps = Object.assign({}, this.props, this.state);
    return React.createElement(SignOutComponent, __assign({}, stateAndProps));
  };

  Greetings.prototype.noUserGreetings = function (theme) {
    var greeting = this.props.outGreeting || this.outGreeting;
    var message = typeof greeting === 'function' ? greeting() : greeting;
    return message ? React.createElement(Amplify_UI_Components_React_1.NavItem, {
      theme: theme
    }, message) : null;
  };

  Greetings.prototype.render = function () {
    var hide = this.props.hide;

    if (hide && hide.includes(Greetings)) {
      return null;
    }

    var authState = this.props.authState || this.state.authState;
    var signedIn = authState === 'signedIn';
    var theme = this.props.theme || Amplify_UI_Theme_1["default"];
    var greeting = signedIn ? this.userGreetings(theme) : this.noUserGreetings(theme);

    if (!greeting) {
      return null;
    }

    return React.createElement(Amplify_UI_Components_React_1.NavBar, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.greetings.navBar
    }, React.createElement(Amplify_UI_Components_React_1.Nav, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.greetings.nav
    }, React.createElement(Amplify_UI_Components_React_1.NavRight, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.greetings.navRight
    }, greeting)));
  };

  return Greetings;
}(AuthPiece_1["default"]);

exports["default"] = Greetings;

/***/ }),

/***/ "./lib/Auth/Loading.js":
/*!*****************************!*\
  !*** ./lib/Auth/Loading.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var AuthPiece_1 = __webpack_require__(/*! ./AuthPiece */ "./lib/Auth/AuthPiece.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var Loading =
/** @class */
function (_super) {
  __extends(Loading, _super);

  function Loading(props) {
    var _this = _super.call(this, props) || this;

    _this._validAuthStates = ['loading'];
    return _this;
  }

  Loading.prototype.showComponent = function (theme) {
    var hide = this.props.hide;

    if (hide && hide.includes(Loading)) {
      return null;
    }

    return React.createElement(Amplify_UI_Components_React_1.FormSection, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.loading.section
    }, React.createElement(Amplify_UI_Components_React_1.SectionBody, {
      theme: theme
    }, core_1.I18n.get('Loading...')));
  };

  return Loading;
}(AuthPiece_1["default"]);

exports["default"] = Loading;

/***/ }),

/***/ "./lib/Auth/PhoneField.js":
/*!********************************!*\
  !*** ./lib/Auth/PhoneField.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var country_dial_codes_1 = __webpack_require__(/*! ./common/country-dial-codes */ "./lib/Auth/common/country-dial-codes.js");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var PhoneField =
/** @class */
function (_super) {
  __extends(PhoneField, _super);

  function PhoneField(props) {
    var _this = _super.call(this, props) || this;

    _this.handleInputChange = _this.handleInputChange.bind(_this);
    _this.composePhoneNumber = _this.composePhoneNumber.bind(_this);
    _this.inputs = {
      dial_code: _this.props.defaultDialCode || '+1',
      phone_line_number: ''
    };
    return _this;
  }

  PhoneField.prototype.composePhoneNumber = function (dial_code, phone_line_number) {
    return "" + (dial_code || '+1') + phone_line_number.replace(/[-()]/g, '');
  };

  PhoneField.prototype.handleInputChange = function (evt) {
    var _a = evt.target,
        name = _a.name,
        value = _a.value;
    this.inputs[name] = value;

    if (this.props.onChangeText) {
      this.props.onChangeText(this.composePhoneNumber(this.inputs.dial_code, this.inputs.phone_line_number));
    }
  };

  PhoneField.prototype.render = function () {
    var _a = this.props,
        _b = _a.theme,
        theme = _b === void 0 ? Amplify_UI_Theme_1["default"] : _b,
        _c = _a.required,
        required = _c === void 0 ? true : _c,
        _d = _a.defaultDialCode,
        defaultDialCode = _d === void 0 ? '+1' : _d,
        _e = _a.label,
        label = _e === void 0 ? 'Phone Number' : _e,
        _f = _a.placeholder,
        placeholder = _f === void 0 ? 'Enter your phone number' : _f;
    return React.createElement(Amplify_UI_Components_React_1.FormField, {
      theme: theme,
      key: "phone_number"
    }, required ? React.createElement(Amplify_UI_Components_React_1.InputLabel, {
      theme: theme
    }, core_1.I18n.get(label), " *") : React.createElement(Amplify_UI_Components_React_1.InputLabel, {
      theme: theme
    }, core_1.I18n.get(label)), React.createElement(Amplify_UI_Components_React_1.SelectInput, {
      theme: theme
    }, React.createElement("select", {
      name: "dial_code",
      defaultValue: defaultDialCode,
      onChange: this.handleInputChange,
      "data-test": data_test_attributes_1.auth.genericAttrs.dialCodeSelect
    }, country_dial_codes_1["default"].map(function (dialCode) {
      return React.createElement("option", {
        key: dialCode,
        value: dialCode
      }, dialCode);
    })), React.createElement(Amplify_UI_Components_React_1.Input, {
      placeholder: core_1.I18n.get(placeholder),
      theme: theme,
      type: "tel",
      id: "phone_line_number",
      key: "phone_line_number",
      name: "phone_line_number",
      onChange: this.handleInputChange,
      "data-test": data_test_attributes_1.auth.genericAttrs.phoneNumberInput
    })));
  };

  return PhoneField;
}(React.Component);

exports.PhoneField = PhoneField;
exports["default"] = PhoneField;

/***/ }),

/***/ "./lib/Auth/Provider/index.js":
/*!************************************!*\
  !*** ./lib/Auth/Provider/index.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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

var __extends = this && this.__extends || function () {
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

var __assign = this && this.__assign || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var withGoogle_1 = __webpack_require__(/*! ./withGoogle */ "./lib/Auth/Provider/withGoogle.js");

var withFacebook_1 = __webpack_require__(/*! ./withFacebook */ "./lib/Auth/Provider/withFacebook.js");

var withAmazon_1 = __webpack_require__(/*! ./withAmazon */ "./lib/Auth/Provider/withAmazon.js");

var withOAuth_1 = __webpack_require__(/*! ./withOAuth */ "./lib/Auth/Provider/withOAuth.js");

var withAuth0_1 = __webpack_require__(/*! ./withAuth0 */ "./lib/Auth/Provider/withAuth0.js");

var withGoogle_2 = __webpack_require__(/*! ./withGoogle */ "./lib/Auth/Provider/withGoogle.js");

exports.withGoogle = withGoogle_2["default"];
exports.GoogleButton = withGoogle_2.GoogleButton;

var withFacebook_2 = __webpack_require__(/*! ./withFacebook */ "./lib/Auth/Provider/withFacebook.js");

exports.withFacebook = withFacebook_2["default"];
exports.FacebookButton = withFacebook_2.FacebookButton;

var withAmazon_2 = __webpack_require__(/*! ./withAmazon */ "./lib/Auth/Provider/withAmazon.js");

exports.withAmazon = withAmazon_2["default"];
exports.AmazonButton = withAmazon_2.AmazonButton;

var withOAuth_2 = __webpack_require__(/*! ./withOAuth */ "./lib/Auth/Provider/withOAuth.js");

exports.withOAuth = withOAuth_2["default"];
exports.OAuthButton = withOAuth_2.OAuthButton;

var withAuth0_2 = __webpack_require__(/*! ./withAuth0 */ "./lib/Auth/Provider/withAuth0.js");

exports.withAuth0 = withAuth0_2["default"];
exports.Auth0Button = withAuth0_2.Auth0Button;

function withFederated(Comp) {
  var Federated = withAuth0_1["default"](withOAuth_1["default"](withAmazon_1["default"](withGoogle_1["default"](withFacebook_1["default"](Comp)))));
  return (
    /** @class */
    function (_super) {
      __extends(class_1, _super);

      function class_1() {
        return _super !== null && _super.apply(this, arguments) || this;
      }

      class_1.prototype.render = function () {
        // @ts-ignore
        var federated = this.props.federated || {};
        return React.createElement(Federated, __assign({}, this.props, federated));
      };

      return class_1;
    }(React.Component)
  );
}

exports.withFederated = withFederated;

/***/ }),

/***/ "./lib/Auth/Provider/withAmazon.js":
/*!*****************************************!*\
  !*** ./lib/Auth/Provider/withAmazon.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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

var __extends = this && this.__extends || function () {
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

var __assign = this && this.__assign || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var ui_1 = __webpack_require__(/*! @aws-amplify/ui */ "@aws-amplify/ui");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var constants_1 = __webpack_require__(/*! ../common/constants */ "./lib/Auth/common/constants.js");

var logger = new core_1.ConsoleLogger('withAmazon');

function withAmazon(Comp) {
  return (
    /** @class */
    function (_super) {
      __extends(class_1, _super);

      function class_1(props) {
        var _this = _super.call(this, props) || this;

        _this.initAmazon = _this.initAmazon.bind(_this);
        _this.signIn = _this.signIn.bind(_this);
        _this.signOut = _this.signOut.bind(_this);
        _this.federatedSignIn = _this.federatedSignIn.bind(_this);
        _this.state = {};
        return _this;
      }

      class_1.prototype.signIn = function () {
        var _this = this;

        var amz = window.amazon;
        var options = {
          scope: 'profile'
        };
        amz.Login.authorize(options, function (response) {
          if (response.error) {
            logger.debug('Failed to login with amazon: ' + response.error);
            return;
          }

          var payload = {
            provider: constants_1["default"].AMAZON
          };

          try {
            localStorage.setItem(constants_1["default"].AUTH_SOURCE_KEY, JSON.stringify(payload));
          } catch (e) {
            logger.debug('Failed to cache auth source into localStorage', e);
          }

          _this.federatedSignIn(response);
        });
      };

      class_1.prototype.federatedSignIn = function (response) {
        var access_token = response.access_token,
            expires_in = response.expires_in;
        var onStateChange = this.props.onStateChange;
        var date = new Date();
        var expires_at = expires_in * 1000 + date.getTime();

        if (!access_token) {
          return;
        }

        var amz = window.amazon;
        amz.Login.retrieveProfile(function (userInfo) {
          if (!userInfo.success) {
            logger.debug('Get user Info failed');
            return;
          }

          var user = {
            name: userInfo.profile.Name,
            email: userInfo.profile.PrimaryEmail
          };

          if (!auth_1["default"] || typeof auth_1["default"].federatedSignIn !== 'function' || typeof auth_1["default"].currentAuthenticatedUser !== 'function') {
            throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
          }

          auth_1["default"].federatedSignIn('amazon', {
            token: access_token,
            expires_at: expires_at
          }, user).then(function (credentials) {
            return auth_1["default"].currentAuthenticatedUser();
          }).then(function (authUser) {
            if (onStateChange) {
              onStateChange('signedIn', authUser);
            }
          });
        });
      };

      class_1.prototype.signOut = function () {
        var amz = window.amazon;

        if (!amz) {
          logger.debug('Amazon Login sdk undefined');
          return Promise.resolve();
        }

        logger.debug('Amazon signing out');
        amz.Login.logout();
      };

      class_1.prototype.componentDidMount = function () {
        var amazon_client_id = this.props.amazon_client_id;
        if (amazon_client_id && !window.amazon) this.createScript();
      };

      class_1.prototype.createScript = function () {
        var script = document.createElement('script');
        script.src = 'https://api-cdn.amazon.com/sdk/login1.js';
        script.async = true;
        script.onload = this.initAmazon;
        document.body.appendChild(script);
      };

      class_1.prototype.initAmazon = function () {
        logger.debug('init amazon');
        var amazon_client_id = this.props.amazon_client_id;
        var amz = window.amazon;
        amz.Login.setClientId(amazon_client_id);
      };

      class_1.prototype.render = function () {
        var amz = window.amazon;
        return React.createElement(Comp, __assign({}, this.props, {
          amz: amz,
          amazonSignIn: this.signIn,
          amazonSignOut: this.signOut
        }));
      };

      return class_1;
    }(React.Component)
  );
}

exports["default"] = withAmazon;

var Button = function Button(props) {
  return React.createElement(Amplify_UI_Components_React_1.SignInButton, {
    id: ui_1.amazonSignInButton,
    onClick: props.amazonSignIn,
    theme: props.theme || Amplify_UI_Theme_1["default"],
    variant: 'amazonSignInButton'
  }, React.createElement(Amplify_UI_Components_React_1.SignInButtonIcon, {
    theme: props.theme || Amplify_UI_Theme_1["default"]
  }, React.createElement("svg", {
    viewBox: "0 0 248 268",
    xmlns: "http://www.w3.org/2000/svg"
  }, React.createElement("g", {
    id: "Artboard-Copy-2",
    fill: "none",
    fillRule: "evenodd"
  }, React.createElement("path", {
    d: "M139.056521,147.024612 C133.548808,156.744524 124.782731,162.726926 115.087401,162.726926 C101.790721,162.726926 93.9937779,152.612964 93.9937779,137.68681 C93.9937779,108.224571 120.447551,102.879017 145.533369,102.879017 L145.533369,110.365976 C145.533369,123.831358 145.876354,135.063787 139.056521,147.024612 M207.206992,162.579655 C209.400505,165.692256 209.887066,169.437725 207.063416,171.770186 C199.996315,177.653081 187.429476,188.590967 180.513926,194.716661 L180.46208,194.621133 C178.176838,196.663031 174.862638,196.810303 172.27828,195.445057 C160.780281,185.9162 158.686473,181.494078 152.405048,172.403055 C133.405233,191.751331 119.909143,197.534719 95.309886,197.534719 C66.1281801,197.534719 43.4791563,179.599451 43.4791563,143.669212 C43.4791563,115.616003 58.6782107,96.5105248 80.4019706,87.1727225 C99.2063636,78.9096034 125.464714,77.4528107 145.533369,75.1641337 L145.533369,70.694248 C145.533369,62.4749122 146.167493,52.7510201 141.297893,45.6541312 C137.110277,39.2856386 129.018206,36.6586354 121.859376,36.6586354 C108.658413,36.6586354 96.9171331,43.4171982 94.0416364,57.4199213 C93.4593582,60.532522 91.1701278,63.5933787 88.003492,63.7406501 L54.4387473,60.1424518 C51.6150972,59.5095829 48.4484614,57.2248862 49.2740201,52.8982915 C56.9712583,12.2553679 93.7983558,0 126.732964,0 C143.587124,0 165.606011,4.47386604 178.902691,17.2148315 C195.760839,32.917146 194.149604,53.8694866 194.149604,76.6726704 L194.149604,130.542157 C194.149604,146.734049 200.87372,153.830938 207.206992,162.579655 Z M233.826346,208.038962 C230.467669,203.683255 211.550709,205.9821 203.056405,206.998432 C200.470662,207.321077 200.076227,205.042397 202.406981,203.404973 C217.475208,192.664928 242.201125,195.766353 245.081698,199.363845 C247.966255,202.981502 244.336653,228.071183 230.172839,240.049379 C228.001452,241.888455 225.929671,240.904388 226.89783,238.468418 C230.077218,230.430525 237.204944,212.418868 233.826346,208.038962 Z M126.768855,264 C74.0234043,264 42.0764048,241.955028 17.7852554,217.541992 C12.9733903,212.705982 6.71799208,206.295994 3.31151296,200.690918 C1.90227474,198.372135 5.59096074,195.021875 8.0442063,196.84375 C38.2390146,219.267578 82.1011654,239.538304 125.529506,239.538304 C154.819967,239.538304 191.046475,227.469543 220.66851,214.867659 C225.146771,212.966167 225.146771,219.180222 224.511585,221.060516 C224.183264,222.03242 209.514625,236.221149 189.247207,247.047411 C170.304273,257.166172 146.397132,264 126.768855,264 Z",
    id: "Fill-6",
    fill: "#FFF"
  })))), React.createElement(Amplify_UI_Components_React_1.SignInButtonContent, {
    theme: props.theme || Amplify_UI_Theme_1["default"]
  }, core_1.I18n.get('Sign In with Amazon')));
};

exports.AmazonButton = withAmazon(Button);

/***/ }),

/***/ "./lib/Auth/Provider/withAuth0.js":
/*!****************************************!*\
  !*** ./lib/Auth/Provider/withAuth0.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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

var __extends = this && this.__extends || function () {
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

var __assign = this && this.__assign || function () {
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

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
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

var __generator = this && this.__generator || function (thisArg, body) {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js"); // import auth0 from 'auth0-js';


var ui_1 = __webpack_require__(/*! @aws-amplify/ui */ "@aws-amplify/ui");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var constants_1 = __webpack_require__(/*! ../common/constants */ "./lib/Auth/common/constants.js");

var logger = new core_1.ConsoleLogger('withAuth0');

function withAuth0(Comp, options) {
  return (
    /** @class */
    function (_super) {
      __extends(class_1, _super);

      function class_1(props) {
        var _this = _super.call(this, props) || this;

        _this._auth0 = null;
        _this.initialize = _this.initialize.bind(_this);
        _this.signIn = _this.signIn.bind(_this);
        _this.signOut = _this.signOut.bind(_this);
        return _this;
      }

      class_1.prototype.componentDidMount = function () {
        if (!window.auth0) {
          this.createScript();
        } else {
          this.initialize();
        }
      };

      class_1.prototype.createScript = function () {
        var script = document.createElement('script');
        script.src = 'https://cdn.auth0.com/js/auth0/9.8.1/auth0.min.js';
        script.async = true;
        script.onload = this.initialize;
        document.body.appendChild(script);
      };

      class_1.prototype.initialize = function () {
        var _this = this; // @ts-ignore


        var _a = auth_1["default"].configure().oauth,
            oauth = _a === void 0 ? {} : _a; // @ts-ignore

        var config = this.props.auth0 || options || oauth.auth0;
        var _b = this.props,
            onError = _b.onError,
            onStateChange = _b.onStateChange,
            authState = _b.authState;

        if (!config) {
          logger.debug('Auth0 is not configured');
          return;
        }

        logger.debug('withAuth0 configuration', config);

        if (!this._auth0) {
          this._auth0 = new window['auth0'].WebAuth(config);
          window.auth0_client = this._auth0;
        }

        if (authState !== 'signedIn') {
          this._auth0.parseHash(function (err, authResult) {
            if (err || !authResult) {
              logger.debug('Failed to parse the url for Auth0', err);
              return;
            }

            var payload = {
              provider: constants_1["default"].AUTH0,
              opts: {
                returnTo: config.returnTo,
                clientID: config.clientID,
                federated: config.federated
              }
            };

            try {
              localStorage.setItem(constants_1["default"].AUTH_SOURCE_KEY, JSON.stringify(payload));
            } catch (e) {
              logger.debug('Failed to cache auth source into localStorage', e);
            }

            _this._auth0.client.userInfo(authResult.accessToken, function (err, user) {
              var username = undefined;
              var email = undefined;

              if (err) {
                logger.debug('Failed to get the user info', err);
              } else {
                username = user.name;
                email = user.email;
              }

              auth_1["default"].federatedSignIn(config.domain, {
                token: authResult.idToken,
                expires_at: authResult.expiresIn * 1000 + new Date().getTime()
              }, {
                name: username,
                email: email
              }).then(function () {
                if (onStateChange) {
                  auth_1["default"].currentAuthenticatedUser().then(function (user) {
                    onStateChange('signedIn', user);
                  });
                }
              })["catch"](function (e) {
                logger.debug('Failed to get the aws credentials', e);
                if (onError) onError(e);
              });
            });
          });
        }
      };

      class_1.prototype.signIn = function () {
        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            if (this._auth0) this._auth0.authorize();else {
              throw new Error('the auth0 client is not configured');
            }
            return [2
            /*return*/
            ];
          });
        });
      };

      class_1.prototype.signOut = function (opts) {
        if (opts === void 0) {
          opts = {};
        }

        var auth0 = window.auth0_client; // @ts-ignore

        var returnTo = opts.returnTo,
            clientID = opts.clientID,
            federated = opts.federated;

        if (!auth0) {
          logger.debug('auth0 sdk undefined');
          return Promise.resolve();
        }

        auth0.logout({
          returnTo: returnTo,
          clientID: clientID,
          federated: federated
        });
      };

      class_1.prototype.render = function () {
        return React.createElement(Comp, __assign({}, this.props, {
          auth0: this._auth0,
          auth0SignIn: this.signIn,
          auth0SignOut: this.signOut
        }));
      };

      return class_1;
    }(React.Component)
  );
}

exports["default"] = withAuth0;

var Button = function Button(props) {
  return React.createElement(Amplify_UI_Components_React_1.SignInButton, {
    id: ui_1.auth0SignInButton,
    onClick: props.auth0SignIn,
    theme: props.theme || Amplify_UI_Theme_1["default"],
    variant: 'auth0SignInButton'
  }, React.createElement(Amplify_UI_Components_React_1.SignInButtonIcon, {
    theme: props.theme || Amplify_UI_Theme_1["default"]
  }, React.createElement("svg", {
    id: "artwork",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 193.7 216.6"
  }, React.createElement("path", {
    id: "NEW",
    className: "st0",
    d: "M189,66.9L167.2,0H96.8l21.8,66.9H189z M96.8,0H26.5L4.8,66.9h70.4L96.8,0z M4.8,66.9L4.8,66.9\tc-13,39.9,1.2,83.6,35.2,108.3l21.7-66.9L4.8,66.9z M189,66.9L189,66.9l-57,41.4l21.7,66.9l0,0C187.7,150.6,201.9,106.8,189,66.9\tL189,66.9z M39.9,175.2L39.9,175.2l56.9,41.4l56.9-41.4l-56.9-41.4L39.9,175.2z"
  }))), React.createElement(Amplify_UI_Components_React_1.SignInButtonContent, {
    theme: props.theme || Amplify_UI_Theme_1["default"]
  }, props.label || 'Sign In with Auth0'));
};

exports.Auth0Button = withAuth0(Button);

/***/ }),

/***/ "./lib/Auth/Provider/withFacebook.js":
/*!*******************************************!*\
  !*** ./lib/Auth/Provider/withFacebook.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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

var __extends = this && this.__extends || function () {
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

var __assign = this && this.__assign || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var ui_1 = __webpack_require__(/*! @aws-amplify/ui */ "@aws-amplify/ui");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var constants_1 = __webpack_require__(/*! ../common/constants */ "./lib/Auth/common/constants.js");

var logger = new core_1.ConsoleLogger('withFacebook');

function withFacebook(Comp) {
  return (
    /** @class */
    function (_super) {
      __extends(class_1, _super);

      function class_1(props) {
        var _this = _super.call(this, props) || this;

        _this.fbAsyncInit = _this.fbAsyncInit.bind(_this);
        _this.initFB = _this.initFB.bind(_this);
        _this.signIn = _this.signIn.bind(_this);
        _this.signOut = _this.signOut.bind(_this);
        _this.federatedSignIn = _this.federatedSignIn.bind(_this);
        _this.state = {};
        return _this;
      }

      class_1.prototype.signIn = function () {
        var _this = this;

        var fb = window.FB;
        fb.getLoginStatus(function (response) {
          var payload = {
            provider: constants_1["default"].FACEBOOK
          };

          try {
            localStorage.setItem(constants_1["default"].AUTH_SOURCE_KEY, JSON.stringify(payload));
          } catch (e) {
            logger.debug('Failed to cache auth source into localStorage', e);
          }

          if (response.status === 'connected') {
            _this.federatedSignIn(response.authResponse);
          } else {
            fb.login(function (response) {
              if (!response || !response.authResponse) {
                return;
              }

              _this.federatedSignIn(response.authResponse);
            }, {
              scope: 'public_profile,email'
            });
          }
        });
      };

      class_1.prototype.federatedSignIn = function (response) {
        logger.debug(response);
        var onStateChange = this.props.onStateChange;
        var accessToken = response.accessToken,
            expiresIn = response.expiresIn;
        var date = new Date();
        var expires_at = expiresIn * 1000 + date.getTime();

        if (!accessToken) {
          return;
        }

        var fb = window.FB;
        fb.api('/me', {
          fields: 'name,email'
        }, function (response) {
          var user = {
            name: response.name,
            email: response.email
          };

          if (!auth_1["default"] || typeof auth_1["default"].federatedSignIn !== 'function' || typeof auth_1["default"].currentAuthenticatedUser !== 'function') {
            throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
          }

          auth_1["default"].federatedSignIn('facebook', {
            token: accessToken,
            expires_at: expires_at
          }, user).then(function (credentials) {
            return auth_1["default"].currentAuthenticatedUser();
          }).then(function (authUser) {
            if (onStateChange) {
              onStateChange('signedIn', authUser);
            }
          });
        });
      };

      class_1.prototype.signOut = function () {
        var fb = window.FB;

        if (!fb) {
          logger.debug('FB sdk undefined');
          return Promise.resolve();
        }

        fb.getLoginStatus(function (response) {
          if (response.status === 'connected') {
            return new Promise(function (res, rej) {
              logger.debug('facebook signing out');
              fb.logout(function (response) {
                res(response);
              });
            });
          } else {
            return Promise.resolve();
          }
        });
      };

      class_1.prototype.componentDidMount = function () {
        var facebook_app_id = this.props.facebook_app_id;
        if (facebook_app_id && !window.FB) this.createScript();
      };

      class_1.prototype.fbAsyncInit = function () {
        logger.debug('init FB');
        var facebook_app_id = this.props.facebook_app_id;
        var fb = window.FB;
        fb.init({
          appId: facebook_app_id,
          cookie: true,
          xfbml: true,
          version: 'v2.11'
        });
        fb.getLoginStatus(function (response) {
          return logger.debug(response);
        });
      };

      class_1.prototype.initFB = function () {
        var fb = window.FB;
        logger.debug('FB inited');
      };

      class_1.prototype.createScript = function () {
        window.fbAsyncInit = this.fbAsyncInit;
        var script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.onload = this.initFB;
        document.body.appendChild(script);
      };

      class_1.prototype.render = function () {
        var fb = window.FB;
        return React.createElement(Comp, __assign({}, this.props, {
          fb: fb,
          facebookSignIn: this.signIn,
          facebookSignOut: this.signOut
        }));
      };

      return class_1;
    }(React.Component)
  );
}

exports["default"] = withFacebook;

var Button = function Button(props) {
  return React.createElement(Amplify_UI_Components_React_1.SignInButton, {
    id: ui_1.facebookSignInButton,
    onClick: props.facebookSignIn,
    theme: props.theme || Amplify_UI_Theme_1["default"],
    variant: 'facebookSignInButton'
  }, React.createElement(Amplify_UI_Components_React_1.SignInButtonIcon, {
    theme: props.theme || Amplify_UI_Theme_1["default"]
  }, React.createElement("svg", {
    viewBox: "0 0 279 538",
    xmlns: "http://www.w3.org/2000/svg"
  }, React.createElement("g", {
    id: "Page-1",
    fill: "none",
    fillRule: "evenodd"
  }, React.createElement("g", {
    id: "Artboard",
    fill: "#FFF"
  }, React.createElement("path", {
    d: "M82.3409742,538 L82.3409742,292.936652 L0,292.936652 L0,196.990154 L82.2410458,196.990154 L82.2410458,126.4295 C82.2410458,44.575144 132.205229,0 205.252865,0 C240.227794,0 270.306232,2.59855099 279,3.79788222 L279,89.2502322 L228.536175,89.2502322 C188.964542,89.2502322 181.270057,108.139699 181.270057,135.824262 L181.270057,196.89021 L276.202006,196.89021 L263.810888,292.836708 L181.16913,292.836708 L181.16913,538 L82.3409742,538 Z",
    id: "Fill-1"
  }))))), React.createElement(Amplify_UI_Components_React_1.SignInButtonContent, {
    theme: props.theme || Amplify_UI_Theme_1["default"]
  }, core_1.I18n.get('Sign In with Facebook')));
};

exports.FacebookButton = withFacebook(Button);

/***/ }),

/***/ "./lib/Auth/Provider/withGoogle.js":
/*!*****************************************!*\
  !*** ./lib/Auth/Provider/withGoogle.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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

var __extends = this && this.__extends || function () {
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

var __assign = this && this.__assign || function () {
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

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
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

var __generator = this && this.__generator || function (thisArg, body) {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var ui_1 = __webpack_require__(/*! @aws-amplify/ui */ "@aws-amplify/ui");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var constants_1 = __webpack_require__(/*! ../common/constants */ "./lib/Auth/common/constants.js");

var logger = new core_1.ConsoleLogger('withGoogle');

function withGoogle(Comp) {
  return (
    /** @class */
    function (_super) {
      __extends(class_1, _super);

      function class_1(props) {
        var _this = _super.call(this, props) || this;

        _this.initGapi = _this.initGapi.bind(_this);
        _this.signIn = _this.signIn.bind(_this);
        _this.signOut = _this.signOut.bind(_this);
        _this.federatedSignIn = _this.federatedSignIn.bind(_this);
        _this.state = {};
        return _this;
      }

      class_1.prototype.signIn = function () {
        var _this = this;

        var ga = window.gapi.auth2.getAuthInstance();
        var onError = this.props.onError;
        ga.signIn().then(function (googleUser) {
          _this.federatedSignIn(googleUser);

          var payload = {
            provider: constants_1["default"].GOOGLE
          };

          try {
            localStorage.setItem(constants_1["default"].AUTH_SOURCE_KEY, JSON.stringify(payload));
          } catch (e) {
            logger.debug('Failed to cache auth source into localStorage', e);
          }
        }, function (error) {
          if (onError) onError(error);else throw error;
        });
      };

      class_1.prototype.federatedSignIn = function (googleUser) {
        return __awaiter(this, void 0, void 0, function () {
          var _a, id_token, expires_at, profile, user, onStateChange;

          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                _a = googleUser.getAuthResponse(), id_token = _a.id_token, expires_at = _a.expires_at;
                profile = googleUser.getBasicProfile();
                user = {
                  email: profile.getEmail(),
                  name: profile.getName(),
                  picture: profile.getImageUrl()
                };
                onStateChange = this.props.onStateChange;

                if (!auth_1["default"] || typeof auth_1["default"].federatedSignIn !== 'function' || typeof auth_1["default"].currentAuthenticatedUser !== 'function') {
                  throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
                }

                return [4
                /*yield*/
                , auth_1["default"].federatedSignIn('google', {
                  token: id_token,
                  expires_at: expires_at
                }, user)];

              case 1:
                _b.sent();

                return [4
                /*yield*/
                , auth_1["default"].currentAuthenticatedUser()];

              case 2:
                user = _b.sent();

                if (onStateChange) {
                  onStateChange('signedIn', user);
                }

                return [2
                /*return*/
                ];
            }
          });
        });
      };

      class_1.prototype.signOut = function () {
        var authInstance = window.gapi && window.gapi.auth2 ? window.gapi.auth2.getAuthInstance() : null;

        if (!authInstance) {
          return Promise.resolve();
        }

        authInstance.then(function (googleAuth) {
          if (!googleAuth) {
            logger.debug('google Auth undefined');
            return Promise.resolve();
          }

          logger.debug('google signing out');
          return googleAuth.signOut();
        });
      };

      class_1.prototype.componentDidMount = function () {
        var google_client_id = this.props.google_client_id;
        var ga = window.gapi && window.gapi.auth2 ? window.gapi.auth2.getAuthInstance() : null;
        if (google_client_id && !ga) this.createScript();
      };

      class_1.prototype.createScript = function () {
        var script = document.createElement('script');
        script.src = 'https://apis.google.com/js/platform.js';
        script.async = true;
        script.onload = this.initGapi;
        document.body.appendChild(script);
      };

      class_1.prototype.initGapi = function () {
        logger.debug('init gapi');
        var that = this;
        var google_client_id = this.props.google_client_id;
        var g = window.gapi;
        g.load('auth2', function () {
          g.auth2.init({
            client_id: google_client_id,
            scope: 'profile email openid'
          });
        });
      };

      class_1.prototype.render = function () {
        var ga = window.gapi && window.gapi.auth2 ? window.gapi.auth2.getAuthInstance() : null;
        return React.createElement(Comp, __assign({}, this.props, {
          ga: ga,
          googleSignIn: this.signIn,
          googleSignOut: this.signOut
        }));
      };

      return class_1;
    }(React.Component)
  );
}

exports["default"] = withGoogle;

var Button = function Button(props) {
  return React.createElement(Amplify_UI_Components_React_1.SignInButton, {
    id: ui_1.googleSignInButton,
    onClick: props.googleSignIn,
    theme: props.theme || Amplify_UI_Theme_1["default"],
    variant: "googleSignInButton"
  }, React.createElement(Amplify_UI_Components_React_1.SignInButtonIcon, {
    theme: props.theme || Amplify_UI_Theme_1["default"]
  }, React.createElement("svg", {
    viewBox: "0 0 256 262",
    xmlns: "http://ww0w.w3.org/2000/svg",
    preserveAspectRatio: "xMidYMid"
  }, React.createElement("path", {
    d: "M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027",
    fill: "#4285F4"
  }), React.createElement("path", {
    d: "M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1",
    fill: "#34A853"
  }), React.createElement("path", {
    d: "M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782",
    fill: "#FBBC05"
  }), React.createElement("path", {
    d: "M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251",
    fill: "#EB4335"
  }))), React.createElement(Amplify_UI_Components_React_1.SignInButtonContent, {
    theme: props.theme || Amplify_UI_Theme_1["default"]
  }, core_1.I18n.get('Sign In with Google')));
};

exports.GoogleButton = withGoogle(Button);

/***/ }),

/***/ "./lib/Auth/Provider/withOAuth.js":
/*!****************************************!*\
  !*** ./lib/Auth/Provider/withOAuth.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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

var __extends = this && this.__extends || function () {
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

var __assign = this && this.__assign || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var ui_1 = __webpack_require__(/*! @aws-amplify/ui */ "@aws-amplify/ui");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

function withOAuth(Comp) {
  return (
    /** @class */
    function (_super) {
      __extends(class_1, _super);

      function class_1(props) {
        var _this = _super.call(this, props) || this;

        _this.signIn = _this.signIn.bind(_this);
        return _this;
      }

      class_1.prototype.signIn = function (_e, provider) {
        auth_1["default"].federatedSignIn({
          provider: provider
        });
      };

      class_1.prototype.render = function () {
        return React.createElement(Comp, __assign({}, this.props, {
          OAuthSignIn: this.signIn
        }));
      };

      return class_1;
    }(React.Component)
  );
}

exports["default"] = withOAuth;

var Button = function Button(props) {
  return React.createElement(Amplify_UI_Components_React_1.SignInButton, {
    id: ui_1.oAuthSignInButton,
    onClick: function onClick() {
      return props.OAuthSignIn();
    },
    theme: props.theme || Amplify_UI_Theme_1["default"],
    variant: 'oAuthSignInButton'
  }, React.createElement(Amplify_UI_Components_React_1.SignInButtonContent, {
    theme: props.theme || Amplify_UI_Theme_1["default"]
  }, core_1.I18n.get(props.label || 'Sign in with AWS')));
};

exports.OAuthButton = withOAuth(Button);

/***/ }),

/***/ "./lib/Auth/RequireNewPassword.js":
/*!****************************************!*\
  !*** ./lib/Auth/RequireNewPassword.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var AuthPiece_1 = __webpack_require__(/*! ./AuthPiece */ "./lib/Auth/AuthPiece.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var logger = new core_1.ConsoleLogger('RequireNewPassword');

var RequireNewPassword =
/** @class */
function (_super) {
  __extends(RequireNewPassword, _super);

  function RequireNewPassword(props) {
    var _this = _super.call(this, props) || this;

    _this._validAuthStates = ['requireNewPassword'];
    _this.change = _this.change.bind(_this);
    _this.checkContact = _this.checkContact.bind(_this);
    return _this;
  }

  RequireNewPassword.prototype.checkContact = function (user) {
    var _this = this;

    if (!auth_1["default"] || typeof auth_1["default"].verifiedContact !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].verifiedContact(user).then(function (data) {
      if (!core_1.JS.isEmpty(data.verified)) {
        _this.changeState('signedIn', user);
      } else {
        user = Object.assign(user, data);

        _this.changeState('verifyContact', user);
      }
    });
  };

  RequireNewPassword.prototype.change = function () {
    var _this = this;

    var user = this.props.authData;
    var password = this.inputs.password;
    var requiredAttributes = user.challengeParam.requiredAttributes;
    var attrs = objectWithProperties(this.inputs, requiredAttributes);

    if (!auth_1["default"] || typeof auth_1["default"].completeNewPassword !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].completeNewPassword(user, password, attrs).then(function (user) {
      logger.debug('complete new password', user);

      if (user.challengeName === 'SMS_MFA') {
        _this.changeState('confirmSignIn', user);
      } else if (user.challengeName === 'MFA_SETUP') {
        logger.debug('TOTP setup', user.challengeParam);

        _this.changeState('TOTPSetup', user);
      } else {
        _this.checkContact(user);
      }
    })["catch"](function (err) {
      return _this.error(err);
    });
  };

  RequireNewPassword.prototype.showComponent = function (theme) {
    var _this = this;

    var hide = this.props.hide;

    if (hide && hide.includes(RequireNewPassword)) {
      return null;
    }

    var user = this.props.authData;
    var requiredAttributes = user.challengeParam.requiredAttributes;
    return React.createElement(Amplify_UI_Components_React_1.FormSection, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.requireNewPassword.section
    }, React.createElement(Amplify_UI_Components_React_1.SectionHeader, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.requireNewPassword.headerSection
    }, core_1.I18n.get('Change Password')), React.createElement(Amplify_UI_Components_React_1.SectionBody, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.requireNewPassword.bodySection
    }, React.createElement(Amplify_UI_Components_React_1.Input, {
      autoFocus: true,
      placeholder: core_1.I18n.get('New Password'),
      theme: theme,
      key: "password",
      name: "password",
      type: "password",
      onChange: this.handleInputChange,
      "data-test": data_test_attributes_1.auth.requireNewPassword.newPasswordInput
    }), requiredAttributes.map(function (attribute) {
      return React.createElement(Amplify_UI_Components_React_1.Input, {
        placeholder: core_1.I18n.get(convertToPlaceholder(attribute)),
        theme: theme,
        key: attribute,
        name: attribute,
        type: "text",
        onChange: _this.handleInputChange
      });
    })), React.createElement(Amplify_UI_Components_React_1.SectionFooter, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.SectionFooterPrimaryContent, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.Button, {
      theme: theme,
      onClick: this.change
    }, core_1.I18n.get('Change'))), React.createElement(Amplify_UI_Components_React_1.SectionFooterSecondaryContent, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.Link, {
      theme: theme,
      onClick: function onClick() {
        return _this.changeState('signIn');
      },
      "data-test": data_test_attributes_1.auth.requireNewPassword.backToSignInLink
    }, core_1.I18n.get('Back to Sign In')))));
  };

  return RequireNewPassword;
}(AuthPiece_1["default"]);

exports["default"] = RequireNewPassword;

function convertToPlaceholder(str) {
  return str.split('_').map(function (part) {
    return part.charAt(0).toUpperCase() + part.substr(1).toLowerCase();
  }).join(' ');
}

function objectWithProperties(obj, keys) {
  var target = {};

  for (var key in obj) {
    if (keys.indexOf(key) === -1) {
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue;
    }

    target[key] = obj[key];
  }

  return target;
}

/***/ }),

/***/ "./lib/Auth/SignIn.js":
/*!****************************!*\
  !*** ./lib/Auth/SignIn.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
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

var __generator = this && this.__generator || function (thisArg, body) {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var AuthPiece_1 = __webpack_require__(/*! ./AuthPiece */ "./lib/Auth/AuthPiece.js");

var FederatedSignIn_1 = __webpack_require__(/*! ./FederatedSignIn */ "./lib/Auth/FederatedSignIn.js");

var SignUp_1 = __webpack_require__(/*! ./SignUp */ "./lib/Auth/SignUp.js");

var ForgotPassword_1 = __webpack_require__(/*! ./ForgotPassword */ "./lib/Auth/ForgotPassword.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var logger = new core_1.ConsoleLogger('SignIn');

var SignIn =
/** @class */
function (_super) {
  __extends(SignIn, _super);

  function SignIn(props) {
    var _this = _super.call(this, props) || this;

    _this.checkContact = _this.checkContact.bind(_this);
    _this.signIn = _this.signIn.bind(_this);
    _this._validAuthStates = ['signIn', 'signedOut', 'signedUp'];
    _this.state = {};
    return _this;
  }

  SignIn.prototype.checkContact = function (user) {
    var _this = this;

    if (!auth_1["default"] || typeof auth_1["default"].verifiedContact !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].verifiedContact(user).then(function (data) {
      if (!core_1.JS.isEmpty(data.verified)) {
        _this.changeState('signedIn', user);
      } else {
        user = Object.assign(user, data);

        _this.changeState('verifyContact', user);
      }
    });
  };

  SignIn.prototype.signIn = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var username, password, user, err_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // avoid submitting the form
            if (event) {
              event.preventDefault();
            }

            username = this.getUsernameFromInput() || '';
            password = this.inputs.password;

            if (!auth_1["default"] || typeof auth_1["default"].signIn !== 'function') {
              throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
            }

            this.setState({
              loading: true
            });
            _a.label = 1;

          case 1:
            _a.trys.push([1, 3, 4, 5]);

            return [4
            /*yield*/
            , auth_1["default"].signIn(username, password)];

          case 2:
            user = _a.sent();
            logger.debug(user);

            if (user.challengeName === 'SMS_MFA' || user.challengeName === 'SOFTWARE_TOKEN_MFA') {
              logger.debug('confirm user with ' + user.challengeName);
              this.changeState('confirmSignIn', user);
            } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
              logger.debug('require new password', user.challengeParam);
              this.changeState('requireNewPassword', user);
            } else if (user.challengeName === 'MFA_SETUP') {
              logger.debug('TOTP setup', user.challengeParam);
              this.changeState('TOTPSetup', user);
            } else if (user.challengeName === 'CUSTOM_CHALLENGE' && user.challengeParam && user.challengeParam.trigger === 'true') {
              logger.debug('custom challenge', user.challengeParam);
              this.changeState('customConfirmSignIn', user);
            } else {
              this.checkContact(user);
            }

            return [3
            /*break*/
            , 5];

          case 3:
            err_1 = _a.sent();

            if (err_1.code === 'UserNotConfirmedException') {
              logger.debug('the user is not confirmed');
              this.changeState('confirmSignUp', {
                username: username
              });
            } else if (err_1.code === 'PasswordResetRequiredException') {
              logger.debug('the user requires a new password');
              this.changeState('forgotPassword', {
                username: username
              });
            } else {
              this.error(err_1);
            }

            return [3
            /*break*/
            , 5];

          case 4:
            this.setState({
              loading: false
            });
            return [7
            /*endfinally*/
            ];

          case 5:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  SignIn.prototype.showComponent = function (theme) {
    var _this = this;

    var _a = this.props,
        authState = _a.authState,
        _b = _a.hide,
        hide = _b === void 0 ? [] : _b,
        federated = _a.federated,
        onStateChange = _a.onStateChange,
        onAuthEvent = _a.onAuthEvent,
        _c = _a.override,
        override = _c === void 0 ? [] : _c;

    if (hide && hide.includes(SignIn)) {
      return null;
    }

    var hideSignUp = !override.includes('SignUp') && hide.some(function (component) {
      return component === SignUp_1["default"];
    });
    var hideForgotPassword = !override.includes('ForgotPassword') && hide.some(function (component) {
      return component === ForgotPassword_1["default"];
    });
    return React.createElement(Amplify_UI_Components_React_1.FormSection, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.signIn.section
    }, React.createElement(Amplify_UI_Components_React_1.SectionHeader, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.signIn.headerSection
    }, core_1.I18n.get('Sign in to your account')), React.createElement(FederatedSignIn_1.FederatedButtons, {
      federated: federated,
      theme: theme,
      authState: authState,
      onStateChange: onStateChange,
      onAuthEvent: onAuthEvent
    }), React.createElement("form", {
      onSubmit: this.signIn
    }, React.createElement(Amplify_UI_Components_React_1.SectionBody, {
      theme: theme
    }, this.renderUsernameField(theme), React.createElement(Amplify_UI_Components_React_1.FormField, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.InputLabel, {
      theme: theme
    }, core_1.I18n.get('Password'), " *"), React.createElement(Amplify_UI_Components_React_1.Input, {
      placeholder: core_1.I18n.get('Enter your password'),
      theme: theme,
      key: "password",
      type: "password",
      name: "password",
      onChange: this.handleInputChange,
      "data-test": data_test_attributes_1.auth.signIn.passwordInput
    }), !hideForgotPassword && React.createElement(Amplify_UI_Components_React_1.Hint, {
      theme: theme
    }, core_1.I18n.get('Forget your password? '), React.createElement(Amplify_UI_Components_React_1.Link, {
      theme: theme,
      onClick: function onClick() {
        return _this.changeState('forgotPassword');
      },
      "data-test": data_test_attributes_1.auth.signIn.forgotPasswordLink
    }, core_1.I18n.get('Reset password'))))), React.createElement(Amplify_UI_Components_React_1.SectionFooter, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.signIn.footerSection
    }, React.createElement(Amplify_UI_Components_React_1.SectionFooterPrimaryContent, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.Button, {
      theme: theme,
      type: "submit",
      disabled: this.state.loading,
      "data-test": data_test_attributes_1.auth.signIn.signInButton
    }, core_1.I18n.get('Sign In'))), !hideSignUp && React.createElement(Amplify_UI_Components_React_1.SectionFooterSecondaryContent, {
      theme: theme
    }, core_1.I18n.get('No account? '), React.createElement(Amplify_UI_Components_React_1.Link, {
      theme: theme,
      onClick: function onClick() {
        return _this.changeState('signUp');
      },
      "data-test": data_test_attributes_1.auth.signIn.createAccountLink
    }, core_1.I18n.get('Create account'))))));
  };

  return SignIn;
}(AuthPiece_1["default"]);

exports["default"] = SignIn;

/***/ }),

/***/ "./lib/Auth/SignOut.js":
/*!*****************************!*\
  !*** ./lib/Auth/SignOut.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var AuthPiece_1 = __webpack_require__(/*! ./AuthPiece */ "./lib/Auth/AuthPiece.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var constants_1 = __webpack_require__(/*! ./common/constants */ "./lib/Auth/common/constants.js");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var logger = new core_1.ConsoleLogger('SignOut');

var SignOut =
/** @class */
function (_super) {
  __extends(SignOut, _super);

  function SignOut(props) {
    var _this = _super.call(this, props) || this;

    _this.signOut = _this.signOut.bind(_this);
    _this.onHubCapsule = _this.onHubCapsule.bind(_this);
    core_1.Hub.listen('auth', _this.onHubCapsule);
    _this.state = {};
    return _this;
  }

  SignOut.prototype.componentDidMount = function () {
    this._isMounted = true;
    this.findState();
  };

  SignOut.prototype.componentWillUnmount = function () {
    this._isMounted = false;
  };

  SignOut.prototype.findState = function () {
    var _this = this;

    if (!this.props.authState && !this.props.authData) {
      auth_1["default"].currentAuthenticatedUser().then(function (user) {
        _this.setState({
          authState: 'signedIn',
          authData: user,
          stateFromStorage: true
        });
      })["catch"](function (err) {
        return logger.error(err);
      });
    } else if (this.props.stateFromStorage) {
      this.setState({
        stateFromStorage: true
      });
    }
  };

  SignOut.prototype.onHubCapsule = function (capsule) {
    if (this._isMounted) {
      var channel = capsule.channel,
          payload = capsule.payload,
          source = capsule.source;

      if (channel === 'auth' && payload.event === 'signIn') {
        this.setState({
          authState: 'signedIn',
          authData: payload.data
        });
      } else if (channel === 'auth' && payload.event === 'signOut' && !this.props.authState) {
        this.setState({
          authState: 'signIn'
        });
      }

      if (channel === 'auth' && payload.event === 'signIn' && !this.props.authState) {
        this.setState({
          stateFromStorage: true
        });
      }
    }
  };

  SignOut.prototype.signOut = function () {
    var _this = this;

    var payload = {};

    try {
      payload = JSON.parse(localStorage.getItem(constants_1["default"].AUTH_SOURCE_KEY)) || {};
      localStorage.removeItem(constants_1["default"].AUTH_SOURCE_KEY);
    } catch (e) {
      logger.debug("Failed to parse the info from " + constants_1["default"].AUTH_SOURCE_KEY + " from localStorage with " + e);
    }

    logger.debug('sign out from the source', payload);
    var _a = this.props,
        googleSignOut = _a.googleSignOut,
        facebookSignOut = _a.facebookSignOut,
        amazonSignOut = _a.amazonSignOut,
        auth0SignOut = _a.auth0SignOut; // @ts-ignore

    switch (payload.provider) {
      case constants_1["default"].GOOGLE:
        if (googleSignOut) googleSignOut();else logger.debug('No Google signout method provided');
        break;

      case constants_1["default"].FACEBOOK:
        if (facebookSignOut) facebookSignOut();else logger.debug('No Facebook signout method provided');
        break;

      case constants_1["default"].AMAZON:
        if (amazonSignOut) amazonSignOut();else logger.debug('No Amazon signout method provided');
        break;

      case constants_1["default"].AUTH0:
        // @ts-ignore
        if (auth0SignOut) auth0SignOut(payload.opts);else logger.debug('No Auth0 signout method provided');
        break;

      default:
        break;
    }

    if (!auth_1["default"] || typeof auth_1["default"].signOut !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].signOut().then(function () {
      if (!_this.state.stateFromStorage) {
        _this.changeState('signedOut');
      }
    })["catch"](function (err) {
      logger.debug(err);

      _this.error(err);
    });
  };

  SignOut.prototype.render = function () {
    var hide = this.props.hide;

    if (hide && hide.includes(SignOut)) {
      return null;
    }

    var authState = this.props.authState || this.state.authState;
    var signedIn = authState === 'signedIn';
    var theme = this.props.theme || Amplify_UI_Theme_1["default"];

    if (!signedIn) {
      return null;
    }

    return React.createElement(Amplify_UI_Components_React_1.NavButton, {
      theme: theme,
      onClick: this.signOut,
      "data-test": data_test_attributes_1.auth.signOut.button
    }, core_1.I18n.get('Sign Out'));
  };

  return SignOut;
}(AuthPiece_1["default"]);

exports["default"] = SignOut;

/***/ }),

/***/ "./lib/Auth/SignUp.js":
/*!****************************!*\
  !*** ./lib/Auth/SignUp.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var AuthPiece_1 = __webpack_require__(/*! ./AuthPiece */ "./lib/Auth/AuthPiece.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var country_dial_codes_1 = __webpack_require__(/*! ./common/country-dial-codes */ "./lib/Auth/common/country-dial-codes.js");

var default_sign_up_fields_1 = __webpack_require__(/*! ./common/default-sign-up-fields */ "./lib/Auth/common/default-sign-up-fields.js");

var types_1 = __webpack_require__(/*! ./common/types */ "./lib/Auth/common/types.js");

var PhoneField_1 = __webpack_require__(/*! ./PhoneField */ "./lib/Auth/PhoneField.js");

var logger = new core_1.ConsoleLogger('SignUp');

var SignUp =
/** @class */
function (_super) {
  __extends(SignUp, _super);

  function SignUp(props) {
    var _this = _super.call(this, props) || this;

    _this.state = {
      requestPending: false
    };
    _this._validAuthStates = ['signUp'];
    _this.signUp = _this.signUp.bind(_this);
    _this.sortFields = _this.sortFields.bind(_this);
    _this.getDefaultDialCode = _this.getDefaultDialCode.bind(_this);
    _this.checkCustomSignUpFields = _this.checkCustomSignUpFields.bind(_this);
    _this.needPrefix = _this.needPrefix.bind(_this);
    _this.header = _this.props && _this.props.signUpConfig && _this.props.signUpConfig.header ? _this.props.signUpConfig.header : 'Create a new account';
    var _a = (_this.props || {}).usernameAttributes,
        usernameAttributes = _a === void 0 ? types_1.UsernameAttributes.USERNAME : _a;

    if (usernameAttributes === types_1.UsernameAttributes.EMAIL) {
      _this.defaultSignUpFields = default_sign_up_fields_1.signUpWithEmailFields;
    } else if (usernameAttributes === types_1.UsernameAttributes.PHONE_NUMBER) {
      _this.defaultSignUpFields = default_sign_up_fields_1.signUpWithPhoneNumberFields;
    } else {
      _this.defaultSignUpFields = default_sign_up_fields_1["default"];
    }

    return _this;
  }

  SignUp.prototype.validate = function () {
    var _this = this;

    var invalids = [];
    this.signUpFields.map(function (el) {
      if (el.key !== 'phone_number') {
        if (el.required && !_this.inputs[el.key]) {
          el.invalid = true;
          invalids.push(el.label);
        } else {
          el.invalid = false;
        }
      } else {
        if (el.required && !_this.phone_number) {
          el.invalid = true;
          invalids.push(el.label);
        } else {
          el.invalid = false;
        }
      }
    });
    return invalids;
  };

  SignUp.prototype.sortFields = function () {
    var _this = this;

    if (this.props.signUpConfig && this.props.signUpConfig.hiddenDefaults && this.props.signUpConfig.hiddenDefaults.length > 0) {
      this.defaultSignUpFields = this.defaultSignUpFields.filter(function (d) {
        return !_this.props.signUpConfig.hiddenDefaults.includes(d.key);
      });
    }

    if (this.checkCustomSignUpFields()) {
      if (!this.props.signUpConfig || !this.props.signUpConfig.hideAllDefaults) {
        // see if fields passed to component should override defaults
        this.defaultSignUpFields.forEach(function (f) {
          var matchKey = _this.signUpFields.findIndex(function (d) {
            return d.key === f.key;
          });

          if (matchKey === -1) {
            _this.signUpFields.push(f);
          }
        });
      }
      /*
      sort fields based on following rules:
      1. Fields with displayOrder are sorted before those without displayOrder
      2. Fields with conflicting displayOrder are sorted alphabetically by key
      3. Fields without displayOrder are sorted alphabetically by key
      */


      this.signUpFields.sort(function (a, b) {
        if (a.displayOrder && b.displayOrder) {
          if (a.displayOrder < b.displayOrder) {
            return -1;
          } else if (a.displayOrder > b.displayOrder) {
            return 1;
          } else {
            if (a.key < b.key) {
              return -1;
            } else {
              return 1;
            }
          }
        } else if (!a.displayOrder && b.displayOrder) {
          return 1;
        } else if (a.displayOrder && !b.displayOrder) {
          return -1;
        } else if (!a.displayOrder && !b.displayOrder) {
          if (a.key < b.key) {
            return -1;
          } else {
            return 1;
          }
        }
      });
    } else {
      this.signUpFields = this.defaultSignUpFields;
    }
  };

  SignUp.prototype.needPrefix = function (key) {
    var field = this.signUpFields.find(function (e) {
      return e.key === key;
    });

    if (key.indexOf('custom:') !== 0) {
      return field.custom;
    } else if (key.indexOf('custom:') === 0 && field.custom === false) {
      logger.warn('Custom prefix prepended to key but custom field flag is set to false; retaining manually entered prefix');
    }

    return null;
  };

  SignUp.prototype.getDefaultDialCode = function () {
    return this.props.signUpConfig && this.props.signUpConfig.defaultCountryCode && country_dial_codes_1["default"].indexOf("+" + this.props.signUpConfig.defaultCountryCode) !== -1 ? "+" + this.props.signUpConfig.defaultCountryCode : '+1';
  };

  SignUp.prototype.checkCustomSignUpFields = function () {
    return this.props.signUpConfig && this.props.signUpConfig.signUpFields && this.props.signUpConfig.signUpFields.length > 0;
  };

  SignUp.prototype.signUp = function () {
    var _this = this;

    this.setState({
      requestPending: true
    });

    if (!this.inputs.dial_code) {
      this.inputs.dial_code = this.getDefaultDialCode();
    }

    var validation = this.validate();

    if (validation && validation.length > 0) {
      this.setState({
        requestPending: false
      });
      return this.error("The following fields need to be filled out: " + validation.join(', '));
    }

    if (!auth_1["default"] || typeof auth_1["default"].signUp !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    var signup_info = {
      username: this.inputs.username,
      password: this.inputs.password,
      attributes: {}
    };
    var inputKeys = Object.keys(this.inputs);
    var inputVals = Object.values(this.inputs);
    inputKeys.forEach(function (key, index) {
      if (!['username', 'password', 'checkedValue', 'dial_code'].includes(key)) {
        if (key !== 'phone_line_number' && key !== 'dial_code' && key !== 'error') {
          var newKey = "" + (_this.needPrefix(key) ? 'custom:' : '') + key;
          signup_info.attributes[newKey] = inputVals[index];
        }
      }
    });
    if (this.phone_number) signup_info.attributes['phone_number'] = this.phone_number;
    var labelCheck = false;
    this.signUpFields.forEach(function (field) {
      if (field.label === _this.getUsernameLabel()) {
        logger.debug("Changing the username to the value of " + field.label);
        signup_info.username = signup_info.attributes[field.key] || signup_info.username;
        labelCheck = true;
      }
    });

    if (!labelCheck && !signup_info.username) {
      // if the customer customized the username field in the sign up form
      // He needs to either set the key of that field to 'username'
      // Or make the label of the field the same as the 'usernameAttributes'
      throw new Error("Couldn't find the label: " + this.getUsernameLabel() + ", in sign up fields according to usernameAttributes!");
    }

    auth_1["default"].signUp(signup_info).then(function (data) {
      _this.setState({
        requestPending: false
      }); // @ts-ignore


      _this.changeState('confirmSignUp', data.user.username);
    })["catch"](function (err) {
      _this.setState({
        requestPending: false
      });

      return _this.error(err);
    });
  };

  SignUp.prototype.showComponent = function (theme) {
    var _this = this;

    var hide = this.props.hide;

    if (hide && hide.includes(SignUp)) {
      return null;
    }

    if (this.checkCustomSignUpFields()) {
      this.signUpFields = this.props.signUpConfig.signUpFields;
    }

    this.sortFields();
    return React.createElement(Amplify_UI_Components_React_1.FormSection, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.signUp.section
    }, React.createElement(Amplify_UI_Components_React_1.SectionHeader, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.signUp.headerSection
    }, core_1.I18n.get(this.header)), React.createElement(Amplify_UI_Components_React_1.SectionBody, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.signUp.bodySection
    }, this.signUpFields.map(function (field) {
      return field.key !== 'phone_number' ? React.createElement(Amplify_UI_Components_React_1.FormField, {
        theme: theme,
        key: field.key
      }, field.required ? React.createElement(Amplify_UI_Components_React_1.InputLabel, {
        theme: theme
      }, core_1.I18n.get(field.label), " *") : React.createElement(Amplify_UI_Components_React_1.InputLabel, {
        theme: theme
      }, core_1.I18n.get(field.label)), React.createElement(Amplify_UI_Components_React_1.Input, {
        autoFocus: _this.signUpFields.findIndex(function (f) {
          return f.key === field.key;
        }) === 0 ? true : false,
        placeholder: core_1.I18n.get(field.placeholder),
        theme: theme,
        type: field.type,
        name: field.key,
        key: field.key,
        onChange: _this.handleInputChange,
        "data-test": data_test_attributes_1.auth.signUp.nonPhoneNumberInput
      })) : React.createElement(PhoneField_1.PhoneField, {
        theme: theme,
        required: field.required,
        defaultDialCode: _this.getDefaultDialCode(),
        label: field.label,
        placeholder: field.placeholder,
        onChangeText: _this.onPhoneNumberChanged,
        key: "phone_number"
      });
    })), React.createElement(Amplify_UI_Components_React_1.SectionFooter, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.signUp.footerSection
    }, React.createElement(Amplify_UI_Components_React_1.SectionFooterPrimaryContent, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.Button, {
      disabled: this.state.requestPending,
      onClick: this.signUp,
      theme: theme,
      "data-test": data_test_attributes_1.auth.signUp.createAccountButton
    }, core_1.I18n.get('Create Account'))), React.createElement(Amplify_UI_Components_React_1.SectionFooterSecondaryContent, {
      theme: theme
    }, core_1.I18n.get('Have an account? '), React.createElement(Amplify_UI_Components_React_1.Link, {
      theme: theme,
      onClick: function onClick() {
        return _this.changeState('signIn');
      },
      "data-test": data_test_attributes_1.auth.signUp.signInLink
    }, core_1.I18n.get('Sign in')))));
  };

  return SignUp;
}(AuthPiece_1["default"]);

exports["default"] = SignUp;

/***/ }),

/***/ "./lib/Auth/TOTPSetup.js":
/*!*******************************!*\
  !*** ./lib/Auth/TOTPSetup.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

var __assign = this && this.__assign || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var AuthPiece_1 = __webpack_require__(/*! ./AuthPiece */ "./lib/Auth/AuthPiece.js");

var TOTPSetupComp_1 = __webpack_require__(/*! ../Widget/TOTPSetupComp */ "./lib/Widget/TOTPSetupComp.js");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var logger = new core_1.ConsoleLogger('TOTPSetup');

var TOTPSetup =
/** @class */
function (_super) {
  __extends(TOTPSetup, _super);

  function TOTPSetup(props) {
    var _this = _super.call(this, props) || this;

    _this._validAuthStates = ['TOTPSetup'];
    _this.onTOTPEvent = _this.onTOTPEvent.bind(_this);
    _this.checkContact = _this.checkContact.bind(_this);
    return _this;
  }

  TOTPSetup.prototype.checkContact = function (user) {
    var _this = this;

    if (!auth_1["default"] || typeof auth_1["default"].verifiedContact !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].verifiedContact(user).then(function (data) {
      if (!core_1.JS.isEmpty(data.verified)) {
        _this.changeState('signedIn', user);
      } else {
        var newUser = Object.assign(user, data);

        _this.changeState('verifyContact', newUser);
      }
    });
  };

  TOTPSetup.prototype.onTOTPEvent = function (event, data, user) {
    logger.debug('on totp event', event, data); // const user = this.props.authData;

    if (event === 'Setup TOTP') {
      if (data === 'SUCCESS') {
        this.checkContact(user);
      }
    }
  };

  TOTPSetup.prototype.showComponent = function (theme) {
    var hide = this.props.hide;

    if (hide && hide.includes(TOTPSetup)) {
      return null;
    }

    return React.createElement(TOTPSetupComp_1["default"], __assign({}, this.props, {
      onTOTPEvent: this.onTOTPEvent,
      "data-test": data_test_attributes_1.auth.TOTPSetup.component
    }));
  };

  return TOTPSetup;
}(AuthPiece_1["default"]);

exports["default"] = TOTPSetup;

/***/ }),

/***/ "./lib/Auth/VerifyContact.js":
/*!***********************************!*\
  !*** ./lib/Auth/VerifyContact.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var AuthPiece_1 = __webpack_require__(/*! ./AuthPiece */ "./lib/Auth/AuthPiece.js");

var AmplifyTheme_1 = __webpack_require__(/*! ../AmplifyTheme */ "./lib/AmplifyTheme.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var logger = new core_1.ConsoleLogger('VerifyContact');

var VerifyContact =
/** @class */
function (_super) {
  __extends(VerifyContact, _super);

  function VerifyContact(props) {
    var _this = _super.call(this, props) || this;

    _this._validAuthStates = ['verifyContact'];
    _this.verify = _this.verify.bind(_this);
    _this.submit = _this.submit.bind(_this);
    _this.state = {
      verifyAttr: null
    };
    return _this;
  }

  VerifyContact.prototype.verify = function () {
    var _this = this;

    var _a = this.inputs,
        contact = _a.contact,
        checkedValue = _a.checkedValue;

    if (!contact) {
      this.error('Neither Email nor Phone Number selected');
      return;
    }

    if (!auth_1["default"] || typeof auth_1["default"].verifyCurrentUserAttribute !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].verifyCurrentUserAttribute(checkedValue).then(function (data) {
      logger.debug(data);

      _this.setState({
        verifyAttr: checkedValue
      });
    })["catch"](function (err) {
      return _this.error(err);
    });
  };

  VerifyContact.prototype.submit = function () {
    var _this = this;

    var attr = this.state.verifyAttr;
    var code = this.inputs.code;

    if (!auth_1["default"] || typeof auth_1["default"].verifyCurrentUserAttributeSubmit !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].verifyCurrentUserAttributeSubmit(attr, code).then(function (data) {
      logger.debug(data);

      _this.changeState('signedIn', _this.props.authData);

      _this.setState({
        verifyAttr: null
      });
    })["catch"](function (err) {
      return _this.error(err);
    });
  };

  VerifyContact.prototype.verifyView = function () {
    var user = this.props.authData;

    if (!user) {
      logger.debug('no user for verify');
      return null;
    }

    var unverified = user.unverified;

    if (!unverified) {
      logger.debug('no unverified on user');
      return null;
    }

    var email = unverified.email,
        phone_number = unverified.phone_number;
    var theme = this.props.theme || AmplifyTheme_1["default"];
    return React.createElement("div", null, email ? React.createElement(Amplify_UI_Components_React_1.RadioRow, {
      placeholder: core_1.I18n.get('Email'),
      theme: theme,
      key: "email",
      name: "contact",
      value: "email",
      onChange: this.handleInputChange
    }) : null, phone_number ? React.createElement(Amplify_UI_Components_React_1.RadioRow, {
      placeholder: core_1.I18n.get('Phone Number'),
      theme: theme,
      key: "phone_number",
      name: "contact",
      value: "phone_number",
      onChange: this.handleInputChange
    }) : null);
  };

  VerifyContact.prototype.submitView = function () {
    var theme = this.props.theme || AmplifyTheme_1["default"];
    return React.createElement("div", null, React.createElement(Amplify_UI_Components_React_1.Input, {
      placeholder: core_1.I18n.get('Code'),
      theme: theme,
      key: "code",
      name: "code",
      autoComplete: "off",
      onChange: this.handleInputChange
    }));
  };

  VerifyContact.prototype.showComponent = function (theme) {
    var _this = this;

    var _a = this.props,
        authData = _a.authData,
        hide = _a.hide;

    if (hide && hide.includes(VerifyContact)) {
      return null;
    }

    return React.createElement(Amplify_UI_Components_React_1.FormSection, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.verifyContact.section
    }, React.createElement(Amplify_UI_Components_React_1.SectionHeader, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.verifyContact.headerSection
    }, core_1.I18n.get('Account recovery requires verified contact information')), React.createElement(Amplify_UI_Components_React_1.SectionBody, {
      theme: theme,
      "data-test": data_test_attributes_1.auth.verifyContact.bodySection
    }, this.state.verifyAttr ? this.submitView() : this.verifyView()), React.createElement(Amplify_UI_Components_React_1.SectionFooter, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.SectionFooterPrimaryContent, {
      theme: theme
    }, this.state.verifyAttr ? React.createElement(Amplify_UI_Components_React_1.Button, {
      theme: theme,
      onClick: this.submit,
      "data-test": data_test_attributes_1.auth.verifyContact.submitButton
    }, core_1.I18n.get('Submit')) : React.createElement(Amplify_UI_Components_React_1.Button, {
      theme: theme,
      onClick: this.verify,
      "data-test": data_test_attributes_1.auth.verifyContact.verifyButton
    }, core_1.I18n.get('Verify'))), React.createElement(Amplify_UI_Components_React_1.SectionFooterSecondaryContent, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.Link, {
      theme: theme,
      onClick: function onClick() {
        return _this.changeState('signedIn', authData);
      },
      "data-test": data_test_attributes_1.auth.verifyContact.skipLink
    }, core_1.I18n.get('Skip')))));
  };

  return VerifyContact;
}(AuthPiece_1["default"]);

exports["default"] = VerifyContact;

/***/ }),

/***/ "./lib/Auth/common/constants.js":
/*!**************************************!*\
  !*** ./lib/Auth/common/constants.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var constants = {
  AUTH_SOURCE_KEY: 'amplify-react-auth-source',
  AUTH0: 'auth0',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  AMAZON: 'amazon',
  REDIRECTED_FROM_HOSTED_UI: 'amplify-redirected-from-hosted-ui'
};
exports["default"] = constants;

/***/ }),

/***/ "./lib/Auth/common/country-dial-codes.js":
/*!***********************************************!*\
  !*** ./lib/Auth/common/country-dial-codes.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = ['+1', '+7', '+20', '+27', '+30', '+31', '+32', '+33', '+34', '+36', '+39', '+40', '+41', '+43', '+44', '+45', '+46', '+47', '+48', '+49', '+51', '+52', '+53', '+54', '+55', '+56', '+57', '+58', '+60', '+61', '+62', '+63', '+64', '+65', '+66', '+81', '+82', '+84', '+86', '+90', '+91', '+92', '+93', '+94', '+95', '+98', '+212', '+213', '+216', '+218', '+220', '+221', '+222', '+223', '+224', '+225', '+226', '+227', '+228', '+229', '+230', '+231', '+232', '+233', '+234', '+235', '+236', '+237', '+238', '+239', '+240', '+241', '+242', '+243', '+244', '+245', '+246', '+248', '+249', '+250', '+251', '+252', '+253', '+254', '+255', '+256', '+257', '+258', '+260', '+261', '+262', '+263', '+264', '+265', '+266', '+267', '+268', '+269', '+290', '+291', '+297', '+298', '+299', '+345', '+350', '+351', '+352', '+353', '+354', '+355', '+356', '+357', '+358', '+359', '+370', '+371', '+372', '+373', '+374', '+375', '+376', '+377', '+378', '+379', '+380', '+381', '+382', '+385', '+386', '+387', '+389', '+420', '+421', '+423', '+500', '+501', '+502', '+503', '+504', '+505', '+506', '+507', '+508', '+509', '+537', '+590', '+591', '+593', '+594', '+595', '+596', '+597', '+598', '+599', '+670', '+672', '+673', '+674', '+675', '+676', '+677', '+678', '+679', '+680', '+681', '+682', '+683', '+685', '+686', '+687', '+688', '+689', '+690', '+691', '+692', '+850', '+852', '+853', '+855', '+856', '+872', '+880', '+886', '+960', '+961', '+962', '+963', '+964', '+965', '+966', '+967', '+968', '+970', '+971', '+972', '+973', '+974', '+975', '+976', '+977', '+992', '+993', '+994', '+995', '+996', '+998'];

/***/ }),

/***/ "./lib/Auth/common/default-sign-up-fields.js":
/*!***************************************************!*\
  !*** ./lib/Auth/common/default-sign-up-fields.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = [{
  label: 'Username',
  key: 'username',
  required: true,
  placeholder: 'Username',
  displayOrder: 1
}, {
  label: 'Password',
  key: 'password',
  required: true,
  placeholder: 'Password',
  type: 'password',
  displayOrder: 2
}, {
  label: 'Email',
  key: 'email',
  required: true,
  placeholder: 'Email',
  type: 'email',
  displayOrder: 3
}, {
  label: 'Phone Number',
  key: 'phone_number',
  placeholder: 'Phone Number',
  required: true,
  displayOrder: 4
}];
exports.signUpWithEmailFields = [{
  label: 'Email',
  key: 'email',
  required: true,
  placeholder: 'Email',
  type: 'email',
  displayOrder: 1
}, {
  label: 'Password',
  key: 'password',
  required: true,
  placeholder: 'Password',
  type: 'password',
  displayOrder: 2
}, {
  label: 'Phone Number',
  key: 'phone_number',
  placeholder: 'Phone Number',
  required: true,
  displayOrder: 3
}];
exports.signUpWithPhoneNumberFields = [{
  label: 'Phone Number',
  key: 'phone_number',
  placeholder: 'Phone Number',
  required: true,
  displayOrder: 1
}, {
  label: 'Password',
  key: 'password',
  required: true,
  placeholder: 'Password',
  type: 'password',
  displayOrder: 2
}, {
  label: 'Email',
  key: 'email',
  required: true,
  placeholder: 'Email',
  type: 'email',
  displayOrder: 3
}];

/***/ }),

/***/ "./lib/Auth/common/types.js":
/*!**********************************!*\
  !*** ./lib/Auth/common/types.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var UsernameAttributes;

(function (UsernameAttributes) {
  UsernameAttributes["EMAIL"] = "email";
  UsernameAttributes["PHONE_NUMBER"] = "phone_number";
  UsernameAttributes["USERNAME"] = "username";
})(UsernameAttributes = exports.UsernameAttributes || (exports.UsernameAttributes = {}));

/***/ }),

/***/ "./lib/Auth/index.js":
/*!***************************!*\
  !*** ./lib/Auth/index.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

var __extends = this && this.__extends || function () {
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

var __assign = this && this.__assign || function () {
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

function __export(m) {
  for (var p in m) {
    if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var Authenticator_1 = __webpack_require__(/*! ./Authenticator */ "./lib/Auth/Authenticator.js");

var Authenticator_2 = __webpack_require__(/*! ./Authenticator */ "./lib/Auth/Authenticator.js");

exports.Authenticator = Authenticator_2["default"];

var AuthPiece_1 = __webpack_require__(/*! ./AuthPiece */ "./lib/Auth/AuthPiece.js");

exports.AuthPiece = AuthPiece_1["default"];

var SignIn_1 = __webpack_require__(/*! ./SignIn */ "./lib/Auth/SignIn.js");

exports.SignIn = SignIn_1["default"];

var ConfirmSignIn_1 = __webpack_require__(/*! ./ConfirmSignIn */ "./lib/Auth/ConfirmSignIn.js");

exports.ConfirmSignIn = ConfirmSignIn_1["default"];

var SignOut_1 = __webpack_require__(/*! ./SignOut */ "./lib/Auth/SignOut.js");

exports.SignOut = SignOut_1["default"];

var RequireNewPassword_1 = __webpack_require__(/*! ./RequireNewPassword */ "./lib/Auth/RequireNewPassword.js");

exports.RequireNewPassword = RequireNewPassword_1["default"];

var SignUp_1 = __webpack_require__(/*! ./SignUp */ "./lib/Auth/SignUp.js");

exports.SignUp = SignUp_1["default"];

var ConfirmSignUp_1 = __webpack_require__(/*! ./ConfirmSignUp */ "./lib/Auth/ConfirmSignUp.js");

exports.ConfirmSignUp = ConfirmSignUp_1["default"];

var VerifyContact_1 = __webpack_require__(/*! ./VerifyContact */ "./lib/Auth/VerifyContact.js");

exports.VerifyContact = VerifyContact_1["default"];

var ForgotPassword_1 = __webpack_require__(/*! ./ForgotPassword */ "./lib/Auth/ForgotPassword.js");

exports.ForgotPassword = ForgotPassword_1["default"];

var Greetings_1 = __webpack_require__(/*! ./Greetings */ "./lib/Auth/Greetings.js");

exports.Greetings = Greetings_1["default"];

var FederatedSignIn_1 = __webpack_require__(/*! ./FederatedSignIn */ "./lib/Auth/FederatedSignIn.js");

exports.FederatedSignIn = FederatedSignIn_1["default"];
exports.FederatedButtons = FederatedSignIn_1.FederatedButtons;

var TOTPSetup_1 = __webpack_require__(/*! ./TOTPSetup */ "./lib/Auth/TOTPSetup.js");

exports.TOTPSetup = TOTPSetup_1["default"];

var Loading_1 = __webpack_require__(/*! ./Loading */ "./lib/Auth/Loading.js");

exports.Loading = Loading_1["default"];

__export(__webpack_require__(/*! ./Provider */ "./lib/Auth/Provider/index.js"));

function withAuthenticator(Comp, includeGreetings, authenticatorComponents, federated, theme, signUpConfig) {
  if (includeGreetings === void 0) {
    includeGreetings = false;
  }

  if (authenticatorComponents === void 0) {
    authenticatorComponents = [];
  }

  if (federated === void 0) {
    federated = null;
  }

  if (theme === void 0) {
    theme = null;
  }

  if (signUpConfig === void 0) {
    signUpConfig = {};
  }

  return (
    /** @class */
    function (_super) {
      __extends(class_1, _super);

      function class_1(props) {
        var _this = _super.call(this, props) || this;

        _this.handleAuthStateChange = _this.handleAuthStateChange.bind(_this);
        _this.state = {
          authState: props.authState || null,
          authData: props.authData || null
        };
        _this.authConfig = {};

        if (_typeof(includeGreetings) === 'object' && includeGreetings !== null) {
          _this.authConfig = Object.assign(_this.authConfig, includeGreetings);
        } else {
          _this.authConfig = {
            includeGreetings: includeGreetings,
            authenticatorComponents: authenticatorComponents,
            federated: federated,
            theme: theme,
            signUpConfig: signUpConfig
          };
        }

        return _this;
      }

      class_1.prototype.handleAuthStateChange = function (state, data) {
        this.setState({
          authState: state,
          authData: data
        });
      };

      class_1.prototype.render = function () {
        var _a = this.state,
            authState = _a.authState,
            authData = _a.authData;
        var signedIn = authState === 'signedIn';

        if (signedIn) {
          return React.createElement(React.Fragment, null, this.authConfig.includeGreetings ? React.createElement(Authenticator_1["default"], __assign({}, this.props, {
            theme: this.authConfig.theme,
            federated: this.authConfig.federated || this.props.federated,
            hideDefault: this.authConfig.authenticatorComponents && this.authConfig.authenticatorComponents.length > 0,
            signUpConfig: this.authConfig.signUpConfig,
            usernameAttributes: this.authConfig.usernameAttributes,
            onStateChange: this.handleAuthStateChange,
            children: this.authConfig.authenticatorComponents || []
          })) : null, React.createElement(Comp, __assign({}, this.props, {
            authState: authState,
            authData: authData,
            onStateChange: this.handleAuthStateChange
          })));
        }

        return React.createElement(Authenticator_1["default"], __assign({}, this.props, {
          theme: this.authConfig.theme,
          federated: this.authConfig.federated || this.props.federated,
          hideDefault: this.authConfig.authenticatorComponents && this.authConfig.authenticatorComponents.length > 0,
          signUpConfig: this.authConfig.signUpConfig,
          usernameAttributes: this.authConfig.usernameAttributes,
          onStateChange: this.handleAuthStateChange,
          children: this.authConfig.authenticatorComponents || []
        }));
      };

      return class_1;
    }(React.Component)
  );
}

exports.withAuthenticator = withAuthenticator;

var AuthenticatorWrapper =
/** @class */
function (_super) {
  __extends(AuthenticatorWrapper, _super);

  function AuthenticatorWrapper(props) {
    var _this = _super.call(this, props) || this;

    _this.state = {
      auth: 'init'
    };
    _this.handleAuthState = _this.handleAuthState.bind(_this);
    _this.renderChildren = _this.renderChildren.bind(_this);
    return _this;
  }

  AuthenticatorWrapper.prototype.handleAuthState = function (state, data) {
    this.setState({
      auth: state,
      authData: data
    });
  };

  AuthenticatorWrapper.prototype.renderChildren = function () {
    // @ts-ignore
    return this.props.children(this.state.auth);
  };

  AuthenticatorWrapper.prototype.render = function () {
    return React.createElement("div", null, React.createElement(Authenticator_1["default"], __assign({}, this.props, {
      onStateChange: this.handleAuthState
    })), this.renderChildren());
  };

  return AuthenticatorWrapper;
}(React.Component);

exports.AuthenticatorWrapper = AuthenticatorWrapper;

/***/ }),

/***/ "./lib/Interactions/ChatBot.js":
/*!*************************************!*\
  !*** ./lib/Interactions/ChatBot.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

var __extends = this && this.__extends || function () {
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

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
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

var __generator = this && this.__generator || function (thisArg, body) {
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

var __spreadArrays = this && this.__spreadArrays || function () {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) {
    s += arguments[i].length;
  }

  for (var r = Array(s), k = 0, i = 0; i < il; i++) {
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) {
      r[k] = a[j];
    }
  }

  return r;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var react_1 = __webpack_require__(/*! react */ "react");

var AmplifyUI_1 = __webpack_require__(/*! ../AmplifyUI */ "./lib/AmplifyUI.js");

var AmplifyTheme_1 = __webpack_require__(/*! ../AmplifyTheme */ "./lib/AmplifyTheme.js");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var interactions_1 = __webpack_require__(/*! @aws-amplify/interactions */ "@aws-amplify/interactions");

var core_2 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var logger = new core_2.ConsoleLogger('ChatBot'); // @ts-ignore

var styles = {
  itemMe: {
    padding: 10,
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
    textAlign: 'right'
  },
  itemBot: {
    fontSize: 12,
    textAlign: 'left'
  },
  list: {
    height: '300px',
    overflow: 'auto'
  },
  textInput: Object.assign({}, AmplifyTheme_1.Input, {
    display: 'inline-block',
    width: 'calc(100% - 90px - 15px)'
  }),
  // @ts-ignore
  button: Object.assign({}, AmplifyTheme_1.Button, {
    width: '60px',
    "float": 'right'
  }),
  // @ts-ignore
  mic: Object.assign({}, AmplifyTheme_1.Button, {
    width: '40px',
    "float": 'right'
  })
};
var STATES = {
  INITIAL: {
    MESSAGE: 'Type your message or click  🎤',
    ICON: '🎤'
  },
  LISTENING: {
    MESSAGE: 'Listening... click 🔴 again to cancel',
    ICON: '🔴'
  },
  SENDING: {
    MESSAGE: 'Please wait...',
    ICON: '🔊'
  },
  SPEAKING: {
    MESSAGE: 'Speaking...',
    ICON: '...'
  }
};
var defaultVoiceConfig = {
  silenceDetectionConfig: {
    time: 2000,
    amplitude: 0.2
  }
};
var audioControl;

var ChatBot =
/** @class */
function (_super) {
  __extends(ChatBot, _super);

  function ChatBot(props) {
    var _this = _super.call(this, props) || this;

    if (_this.props.voiceEnabled) {
      __webpack_require__(/*! ./aws-lex-audio */ "./lib/Interactions/aws-lex-audio.js"); // @ts-ignore


      audioControl = new global.LexAudio.audioControl();
    }

    if (!_this.props.textEnabled && _this.props.voiceEnabled) {
      STATES.INITIAL.MESSAGE = 'Click the mic button';
      styles.textInput = Object.assign({}, AmplifyTheme_1.Input, {
        display: 'inline-block',
        width: 'calc(100% - 40px - 15px)'
      });
    }

    if (_this.props.textEnabled && !_this.props.voiceEnabled) {
      STATES.INITIAL.MESSAGE = 'Type a message';
      styles.textInput = Object.assign({}, AmplifyTheme_1.Input, {
        display: 'inline-block',
        width: 'calc(100% - 60px - 15px)'
      });
    }

    if (!_this.props.voiceConfig.silenceDetectionConfig) {
      throw new Error('voiceConfig prop is missing silenceDetectionConfig');
    }

    _this.state = {
      dialog: [{
        message: _this.props.welcomeMessage || 'Welcome to Lex',
        from: 'system'
      }],
      inputText: '',
      currentVoiceState: STATES.INITIAL,
      inputDisabled: false,
      micText: STATES.INITIAL.ICON,
      continueConversation: false,
      micButtonDisabled: false
    };
    _this.micButtonHandler = _this.micButtonHandler.bind(_this);
    _this.changeInputText = _this.changeInputText.bind(_this);
    _this.listItems = _this.listItems.bind(_this);
    _this.submit = _this.submit.bind(_this); // @ts-ignore

    _this.listItemsRef = React.createRef();
    _this.onSilenceHandler = _this.onSilenceHandler.bind(_this);
    _this.doneSpeakingHandler = _this.doneSpeakingHandler.bind(_this);
    _this.lexResponseHandler = _this.lexResponseHandler.bind(_this);
    return _this;
  }

  ChatBot.prototype.micButtonHandler = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;

      return __generator(this, function (_a) {
        if (this.state.continueConversation) {
          this.reset();
        } else {
          this.setState({
            inputDisabled: true,
            continueConversation: true,
            currentVoiceState: STATES.LISTENING,
            micText: STATES.LISTENING.ICON,
            micButtonDisabled: false
          }, function () {
            audioControl.startRecording(_this.onSilenceHandler, null, _this.props.voiceConfig.silenceDetectionConfig);
          });
        }

        return [2
        /*return*/
        ];
      });
    });
  };

  ChatBot.prototype.onSilenceHandler = function () {
    var _this = this;

    audioControl.stopRecording();

    if (!this.state.continueConversation) {
      return;
    }

    audioControl.exportWAV(function (blob) {
      _this.setState({
        currentVoiceState: STATES.SENDING,
        audioInput: blob,
        micText: STATES.SENDING.ICON,
        micButtonDisabled: true
      }, function () {
        _this.lexResponseHandler();
      });
    });
  };

  ChatBot.prototype.lexResponseHandler = function () {
    return __awaiter(this, void 0, void 0, function () {
      var interactionsMessage, response;

      var _this = this;

      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!interactions_1["default"] || typeof interactions_1["default"].send !== 'function') {
              throw new Error('No Interactions module found, please ensure @aws-amplify/interactions is imported');
            }

            if (!this.state.continueConversation) {
              return [2
              /*return*/
              ];
            }

            interactionsMessage = {
              content: this.state.audioInput,
              options: {
                messageType: 'voice'
              }
            };
            return [4
            /*yield*/
            , interactions_1["default"].send(this.props.botName, interactionsMessage)];

          case 1:
            response = _a.sent();
            this.setState({
              lexResponse: response,
              currentVoiceState: STATES.SPEAKING,
              micText: STATES.SPEAKING.ICON,
              micButtonDisabled: true,
              dialog: __spreadArrays(this.state.dialog, [// @ts-ignore
              {
                message: response.inputTranscript,
                from: 'me'
              }, // @ts-ignore
              response && {
                from: 'bot',
                message: response.message
              }]),
              inputText: ''
            }, function () {
              _this.doneSpeakingHandler();
            });
            this.listItemsRef.current.scrollTop = this.listItemsRef.current.scrollHeight;
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  ChatBot.prototype.doneSpeakingHandler = function () {
    var _this = this;

    if (!this.state.continueConversation) {
      return;
    }

    if (this.state.lexResponse.contentType === 'audio/mpeg') {
      audioControl.play(this.state.lexResponse.audioStream, function () {
        if (_this.state.lexResponse.dialogState === 'ReadyForFulfillment' || _this.state.lexResponse.dialogState === 'Fulfilled' || _this.state.lexResponse.dialogState === 'Failed' || !_this.props.conversationModeOn) {
          _this.setState({
            inputDisabled: false,
            currentVoiceState: STATES.INITIAL,
            micText: STATES.INITIAL.ICON,
            micButtonDisabled: false,
            continueConversation: false
          });
        } else {
          _this.setState({
            currentVoiceState: STATES.LISTENING,
            micText: STATES.LISTENING.ICON,
            micButtonDisabled: false
          }, function () {
            audioControl.startRecording(_this.onSilenceHandler, null, _this.props.voiceConfig.silenceDetectionConfig);
          });
        }
      });
    } else {
      this.setState({
        inputDisabled: false,
        currentVoiceState: STATES.INITIAL,
        micText: STATES.INITIAL.ICON,
        micButtonDisabled: false,
        continueConversation: false
      });
    }
  };

  ChatBot.prototype.reset = function () {
    this.setState({
      inputText: '',
      currentVoiceState: STATES.INITIAL,
      inputDisabled: false,
      micText: STATES.INITIAL.ICON,
      continueConversation: false,
      micButtonDisabled: false
    }, function () {
      audioControl.clear();
    });
  };

  ChatBot.prototype.listItems = function () {
    return this.state.dialog.map(function (m, i) {
      if (m.from === 'me') {
        return React.createElement("div", {
          key: i,
          style: styles.itemMe
        }, m.message);
      } else if (m.from === 'system') {
        return React.createElement("div", {
          key: i,
          style: styles.itemBot
        }, m.message);
      } else {
        return React.createElement("div", {
          key: i,
          style: styles.itemBot
        }, m.message);
      }
    });
  };

  ChatBot.prototype.submit = function (e) {
    return __awaiter(this, void 0, void 0, function () {
      var response;

      var _this = this;

      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            e.preventDefault();

            if (!this.state.inputText) {
              return [2
              /*return*/
              ];
            }

            return [4
            /*yield*/
            , new Promise(function (resolve) {
              return _this.setState({
                dialog: __spreadArrays(_this.state.dialog, [{
                  message: _this.state.inputText,
                  from: 'me'
                }])
              }, resolve);
            })];

          case 1:
            _a.sent();

            if (!interactions_1["default"] || typeof interactions_1["default"].send !== 'function') {
              throw new Error('No Interactions module found, please ensure @aws-amplify/interactions is imported');
            }

            return [4
            /*yield*/
            , interactions_1["default"].send(this.props.botName, this.state.inputText)];

          case 2:
            response = _a.sent();
            this.setState({
              // @ts-ignore
              dialog: __spreadArrays(this.state.dialog, [// @ts-ignore
              response && {
                from: 'bot',
                message: response.message
              }]),
              inputText: ''
            });
            this.listItemsRef.current.scrollTop = this.listItemsRef.current.scrollHeight;
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  ChatBot.prototype.changeInputText = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , this.setState({
              inputText: event.target.value
            })];

          case 1:
            _a.sent();

            return [2
            /*return*/
            ];
        }
      });
    });
  };

  ChatBot.prototype.getOnComplete = function (fn) {
    var _this = this;

    return function () {
      var args = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }

      var clearOnComplete = _this.props.clearOnComplete;
      var message = fn.apply(void 0, args);

      _this.setState({
        dialog: __spreadArrays(!clearOnComplete && _this.state.dialog, [message && {
          from: 'bot',
          message: message
        }]).filter(Boolean)
      }, function () {
        _this.listItemsRef.current.scrollTop = _this.listItemsRef.current.scrollHeight;
      });
    };
  };

  ChatBot.prototype.componentDidMount = function () {
    var _a = this.props,
        onComplete = _a.onComplete,
        botName = _a.botName;

    if (onComplete && botName) {
      if (!interactions_1["default"] || typeof interactions_1["default"].onComplete !== 'function') {
        throw new Error('No Interactions module found, please ensure @aws-amplify/interactions is imported');
      } // @ts-ignore


      interactions_1["default"].onComplete(botName, this.getOnComplete(onComplete, this));
    }
  };

  ChatBot.prototype.componentDidUpdate = function (prevProps) {
    var _a = this.props,
        onComplete = _a.onComplete,
        botName = _a.botName;

    if (botName && this.props.onComplete !== prevProps.onComplete) {
      if (!interactions_1["default"] || typeof interactions_1["default"].onComplete !== 'function') {
        throw new Error('No Interactions module found, please ensure @aws-amplify/interactions is imported');
      } // @ts-ignore


      interactions_1["default"].onComplete(botName, this.getOnComplete(onComplete, this));
    }
  };

  ChatBot.prototype.render = function () {
    var _a = this.props,
        title = _a.title,
        theme = _a.theme,
        onComplete = _a.onComplete;
    return React.createElement(AmplifyUI_1.FormSection, {
      theme: theme
    }, title && React.createElement(AmplifyUI_1.SectionHeader, {
      theme: theme
    }, core_1.I18n.get(title)), React.createElement(AmplifyUI_1.SectionBody, {
      theme: theme
    }, React.createElement("div", {
      ref: this.listItemsRef,
      style: styles.list
    }, this.listItems())), React.createElement(AmplifyUI_1.SectionFooter, {
      theme: theme
    }, React.createElement(ChatBotInputs, {
      micText: this.state.micText,
      voiceEnabled: this.props.voiceEnabled,
      textEnabled: this.props.textEnabled,
      styles: styles,
      onChange: this.changeInputText,
      inputText: this.state.inputText,
      onSubmit: this.submit,
      inputDisabled: this.state.inputDisabled,
      micButtonDisabled: this.state.micButtonDisabled,
      handleMicButton: this.micButtonHandler,
      currentVoiceState: this.state.currentVoiceState
    })));
  };

  return ChatBot;
}(react_1.Component);

exports.ChatBot = ChatBot;

function ChatBotTextInput(props) {
  var styles = props.styles;
  var onChange = props.onChange;
  var inputText = props.inputText;
  var inputDisabled = props.inputDisabled;
  var currentVoiceState = props.currentVoiceState;
  return React.createElement("input", {
    style: styles.textInput,
    type: "text",
    placeholder: core_1.I18n.get(currentVoiceState.MESSAGE),
    onChange: onChange,
    value: inputText,
    disabled: inputDisabled
  });
}

function ChatBotMicButton(props) {
  var voiceEnabled = props.voiceEnabled;
  var styles = props.styles;
  var micButtonDisabled = props.micButtonDisabled;
  var handleMicButton = props.handleMicButton;
  var micText = props.micText;

  if (!voiceEnabled) {
    return null;
  }

  return React.createElement("button", {
    style: styles.mic,
    disabled: micButtonDisabled,
    onClick: handleMicButton
  }, micText);
}

function ChatBotTextButton(props) {
  var textEnabled = props.textEnabled;
  var styles = props.styles;
  var inputDisabled = props.inputDisabled;

  if (!textEnabled) {
    return null;
  }

  return React.createElement("button", {
    type: "submit",
    style: styles.button,
    disabled: inputDisabled
  }, core_1.I18n.get('Send'));
}

function ChatBotInputs(props) {
  var voiceEnabled = props.voiceEnabled;
  var textEnabled = props.textEnabled;
  var styles = props.styles;
  var onChange = props.onChange;
  var inputDisabled = props.inputDisabled;
  var micButtonDisabled = props.micButtonDisabled;
  var inputText = props.inputText;
  var onSubmit = props.onSubmit;
  var handleMicButton = props.handleMicButton;
  var micText = props.micText;
  var currentVoiceState = props.currentVoiceState;

  if (voiceEnabled && !textEnabled) {
    inputDisabled = true;
  }

  if (!voiceEnabled && !textEnabled) {
    return React.createElement("div", null, "No Chatbot inputs enabled. Set at least one of voiceEnabled or textEnabled in the props.", ' ');
  }

  return React.createElement("form", {
    onSubmit: onSubmit
  }, React.createElement(ChatBotTextInput, {
    onSubmit: onSubmit,
    styles: styles,
    type: "text",
    currentVoiceState: currentVoiceState,
    onChange: onChange,
    inputText: inputText,
    inputDisabled: inputDisabled
  }), React.createElement(ChatBotTextButton, {
    onSubmit: onSubmit,
    type: "submit",
    styles: styles,
    inputDisabled: inputDisabled,
    textEnabled: textEnabled
  }), React.createElement(ChatBotMicButton, {
    styles: styles,
    micButtonDisabled: micButtonDisabled,
    handleMicButton: handleMicButton,
    micText: micText,
    voiceEnabled: voiceEnabled
  }));
} // @ts-ignore


ChatBot.defaultProps = {
  title: '',
  botName: '',
  onComplete: undefined,
  clearOnComplete: false,
  voiceConfig: defaultVoiceConfig,
  conversationModeOn: false,
  voiceEnabled: false,
  textEnabled: true
};
exports["default"] = ChatBot;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../node_modules/webpack/buildin/global.js */ "../../node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./lib/Interactions/aws-lex-audio.js":
/*!*******************************************!*\
  !*** ./lib/Interactions/aws-lex-audio.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var require;var require;// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// @ts-ignore
(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == 'function' && require; // @ts-ignore

        if (!u && a) return require(o, !0); // @ts-ignore

        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'"); // @ts-ignore

        throw f.code = 'MODULE_NOT_FOUND', f;
      }

      var l = n[o] = {
        exports: {}
      };
      t[o][0].call(l.exports, function (e) {
        var n = t[o][1][e]; // @ts-ignore

        return s(n ? n : e);
      }, l, l.exports, e, t, n, r);
    }

    return n[o].exports;
  }

  var i = typeof require == 'function' && require; // @ts-ignore

  for (var o = 0; o < r.length; o++) {
    s(r[o]);
  }

  return s;
})({
  1: [function (require, module, exports) {
    (function () {
      'use strict';

      var rec = require('./recorder.js');

      var recorder,
          audioRecorder,
          checkAudioSupport,
          audioSupported,
          playbackSource,
          UNSUPPORTED = 'Audio is not supported.';
      /**
       * Represents an audio control that can start and stop recording,
       * export captured audio, play an audio buffer, and check if audio
       * is supported.
       */

      exports.audioControl = function (options) {
        options = options || {};
        this.checkAudioSupport = options.checkAudioSupport !== false;
        /**
         * This callback type is called `onSilenceCallback`.
         *
         * @callback onSilenceCallback
         */

        /**
         * Visualize callback: `visualizerCallback`.
         *
         * @callback visualizerCallback
         * @param {Uint8Array} dataArray
         * @param {number} bufferLength
         */

        /**
         * Clears the previous buffer and starts buffering audio.
         *
         * @param {?onSilenceCallback} onSilence - Called when silence is detected.
         * @param {?visualizerCallback} visualizer - Can be used to visualize the captured buffer.
         * @param {silenceDetectionConfig} - Specify custom silence detection values.
         * @throws {Error} If audio is not supported.
         */

        var startRecording = function startRecording(onSilence, visualizer, silenceDetectionConfig) {
          onSilence = onSilence || function () {
            /* no op */
          };

          visualizer = visualizer || function () {
            /* no op */
          };

          audioSupported = audioSupported !== false;

          if (!audioSupported) {
            throw new Error(UNSUPPORTED);
          }

          recorder = audioRecorder.createRecorder(silenceDetectionConfig);
          recorder.record(onSilence, visualizer);
        };
        /**
         * Stops buffering audio.
         *
         * @throws {Error} If audio is not supported.
         */


        var stopRecording = function stopRecording() {
          audioSupported = audioSupported !== false;

          if (!audioSupported) {
            throw new Error(UNSUPPORTED);
          }

          recorder.stop();
        };
        /**
         * On export complete callback: `onExportComplete`.
         *
         * @callback onExportComplete
         * @param {Blob} blob The exported audio as a Blob.
         */

        /**
         * Exports the captured audio buffer.
         *
         * @param {onExportComplete} callback - Called when the export is complete.
         * @param {sampleRate} The sample rate to use in the export.
         * @throws {Error} If audio is not supported.
         */


        var exportWAV = function exportWAV(callback, sampleRate) {
          audioSupported = audioSupported !== false;

          if (!audioSupported) {
            throw new Error(UNSUPPORTED);
          }

          if (!(callback && typeof callback === 'function')) {
            throw new Error('You must pass a callback function to export.');
          }

          sampleRate = typeof sampleRate !== 'undefined' ? sampleRate : 16000;
          recorder.exportWAV(callback, sampleRate);
          recorder.clear();
        };
        /**
         * On playback complete callback: `onPlaybackComplete`.
         *
         * @callback onPlaybackComplete
         */

        /**
         * Plays the audio buffer with an HTML5 audio tag.
         * @param {Uint8Array} buffer - The audio buffer to play.
         * @param {?onPlaybackComplete} callback - Called when audio playback is complete.
         */


        var playHtmlAudioElement = function playHtmlAudioElement(buffer, callback) {
          if (typeof buffer === 'undefined') {
            return;
          }

          var myBlob = new Blob([buffer]);
          var audio = document.createElement('audio');
          var objectUrl = window.URL.createObjectURL(myBlob);
          audio.src = objectUrl;
          audio.addEventListener('ended', function () {
            audio.currentTime = 0;

            if (typeof callback === 'function') {
              callback();
            }
          });
          audio.play();
        };
        /**
         * On playback complete callback: `onPlaybackComplete`.
         *
         * @callback onPlaybackComplete
         */

        /**
         * Plays the audio buffer with a WebAudio AudioBufferSourceNode.
         * @param {Uint8Array} buffer - The audio buffer to play.
         * @param {?onPlaybackComplete} callback - Called when audio playback is complete.
         */


        var play = function play(buffer, callback) {
          if (typeof buffer === 'undefined') {
            return;
          }

          var myBlob = new Blob([buffer]); // We'll use a FileReader to create and ArrayBuffer out of the audio response.

          var fileReader = new FileReader();

          fileReader.onload = function () {
            // Once we have an ArrayBuffer we can create our BufferSource and decode the result as an AudioBuffer.
            playbackSource = audioRecorder.audioContext().createBufferSource();
            audioRecorder.audioContext().decodeAudioData(this.result, function (buf) {
              // Set the source buffer as our new AudioBuffer.
              playbackSource.buffer = buf; // Set the destination (the actual audio-rendering device--your device's speakers).

              playbackSource.connect(audioRecorder.audioContext().destination); // Add an "on ended" callback.

              playbackSource.onended = function (event) {
                if (typeof callback === 'function') {
                  callback();
                }
              }; // Start the playback.


              playbackSource.start(0);
            });
          };

          fileReader.readAsArrayBuffer(myBlob);
        };
        /**
         * Stops the playback source (created by the play method) if it exists. The `onPlaybackComplete`
         * callback will be called.
         */


        var stop = function stop() {
          if (typeof playbackSource === 'undefined') {
            return;
          }

          playbackSource.stop();
        };
        /**
         * Clear the recording buffer.
         */


        var clear = function clear() {
          recorder.clear();
        };
        /**
         * On audio supported callback: `onAudioSupported`.
         *
         * @callback onAudioSupported
         * @param {boolean}
         */

        /**
         * Checks that getUserMedia is supported and the user has given us access to the mic.
         * @param {onAudioSupported} callback - Called with the result.
         */


        var supportsAudio = function supportsAudio(callback) {
          callback = callback || function () {
            /* no op */
          };

          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            audioRecorder = rec.audioRecorder();
            audioRecorder.requestDevice().then(function (stream) {
              audioSupported = true;
              callback(audioSupported);
            })["catch"](function (error) {
              audioSupported = false;
              callback(audioSupported);
            });
          } else {
            audioSupported = false;
            callback(audioSupported);
          }
        };

        if (this.checkAudioSupport) {
          // @ts-ignore
          supportsAudio();
        }

        return {
          startRecording: startRecording,
          stopRecording: stopRecording,
          exportWAV: exportWAV,
          play: play,
          stop: stop,
          clear: clear,
          playHtmlAudioElement: playHtmlAudioElement,
          supportsAudio: supportsAudio
        };
      };
    })();
  }, {
    './recorder.js': 5
  }],
  2: [function (require, module, exports) {
    (function () {
      'use strict';

      var AudioControl = require('./control.js').audioControl;

      var DEFAULT_LATEST = '$LATEST';
      var DEFAULT_CONTENT_TYPE = 'audio/x-l16; sample-rate=16000';
      var DEFAULT_USER_ID = 'userId';
      var DEFAULT_ACCEPT_HEADER_VALUE = 'audio/mpeg';
      var MESSAGES = Object.freeze({
        PASSIVE: 'Passive',
        LISTENING: 'Listening',
        SENDING: 'Sending',
        SPEAKING: 'Speaking'
      });
      var lexruntime,
          audioControl = new AudioControl({
        checkAudioSupport: false
      });

      exports.conversation = function (config, onStateChange, onSuccess, onError, onAudioData) {
        var currentState; // Apply default values.

        this.config = applyDefaults(config);
        this.lexConfig = this.config.lexConfig;
        this.messages = MESSAGES;

        onStateChange = onStateChange || function () {
          /* no op */
        };

        this.onSuccess = onSuccess || function () {
          /* no op */
        };

        this.onError = onError || function () {
          /* no op */
        };

        this.onAudioData = onAudioData || function () {
          /* no op */
        }; // Validate input.


        if (!this.config.lexConfig.botName) {
          this.onError('A Bot name must be provided.');
          return;
        } // @ts-ignore


        if (!AWS.config.credentials) {
          this.onError('AWS Credentials must be provided.');
          return;
        } // @ts-ignore


        if (!AWS.config.region) {
          this.onError('A Region value must be provided.');
          return;
        } // @ts-ignore


        lexruntime = new AWS.LexRuntime();

        this.onSilence = function () {
          if (config.silenceDetection) {
            audioControl.stopRecording();
            currentState.advanceConversation();
          }
        };

        this.transition = function (conversation) {
          currentState = conversation;
          var state = currentState.state;
          onStateChange(state.message); // If we are transitioning into SENDING or SPEAKING we want to immediately advance the conversation state
          // to start the service call or playback.

          if (state.message === state.messages.SENDING || state.message === state.messages.SPEAKING) {
            currentState.advanceConversation();
          } // If we are transitioning in to sending and we are not detecting silence (this was a manual state change)
          // we need to do some cleanup: stop recording, and stop rendering.


          if (state.message === state.messages.SENDING && !this.config.silenceDetection) {
            audioControl.stopRecording();
          }
        };

        this.advanceConversation = function () {
          audioControl.supportsAudio(function (supported) {
            if (supported) {
              currentState.advanceConversation();
            } else {
              onError('Audio is not supported.');
            }
          });
        };

        this.updateConfig = function (newValue) {
          this.config = applyDefaults(newValue);
          this.lexConfig = this.config.lexConfig;
        };

        this.reset = function () {
          audioControl.clear();
          currentState = new Initial(currentState.state);
        };

        currentState = new Initial(this);
        return {
          advanceConversation: this.advanceConversation,
          updateConfig: this.updateConfig,
          reset: this.reset
        };
      };

      var Initial = function Initial(state) {
        this.state = state;
        state.message = state.messages.PASSIVE;

        this.advanceConversation = function () {
          audioControl.startRecording(state.onSilence, state.onAudioData, state.config.silenceDetectionConfig);
          state.transition(new Listening(state));
        };
      };

      var Listening = function Listening(state) {
        this.state = state;
        state.message = state.messages.LISTENING;

        this.advanceConversation = function () {
          audioControl.exportWAV(function (blob) {
            state.audioInput = blob;
            state.transition(new Sending(state));
          });
        };
      };

      var Sending = function Sending(state) {
        this.state = state;
        state.message = state.messages.SENDING;

        this.advanceConversation = function () {
          state.lexConfig.inputStream = state.audioInput;
          lexruntime.postContent(state.lexConfig, function (err, data) {
            if (err) {
              state.onError(err);
              state.transition(new Initial(state));
            } else {
              state.audioOutput = data;
              state.transition(new Speaking(state));
              state.onSuccess(data);
            }
          });
        };
      };

      var Speaking = function Speaking(state) {
        this.state = state;
        state.message = state.messages.SPEAKING;

        this.advanceConversation = function () {
          if (state.audioOutput.contentType === 'audio/mpeg') {
            audioControl.play(state.audioOutput.audioStream, function () {
              if (state.audioOutput.dialogState === 'ReadyForFulfillment' || state.audioOutput.dialogState === 'Fulfilled' || state.audioOutput.dialogState === 'Failed' || !state.config.silenceDetection) {
                state.transition(new Initial(state));
              } else {
                audioControl.startRecording(state.onSilence, state.onAudioData, state.config.silenceDetectionConfig);
                state.transition(new Listening(state));
              }
            });
          } else {
            state.transition(new Initial(state));
          }
        };
      };

      var applyDefaults = function applyDefaults(config) {
        config = config || {};
        config.silenceDetection = config.hasOwnProperty('silenceDetection') ? config.silenceDetection : true;
        var lexConfig = config.lexConfig || {};
        lexConfig.botAlias = lexConfig.hasOwnProperty('botAlias') ? lexConfig.botAlias : DEFAULT_LATEST;
        lexConfig.botName = lexConfig.hasOwnProperty('botName') ? lexConfig.botName : '';
        lexConfig.contentType = lexConfig.hasOwnProperty('contentType') ? lexConfig.contentType : DEFAULT_CONTENT_TYPE;
        lexConfig.userId = lexConfig.hasOwnProperty('userId') ? lexConfig.userId : DEFAULT_USER_ID;
        lexConfig.accept = lexConfig.hasOwnProperty('accept') ? lexConfig.accept : DEFAULT_ACCEPT_HEADER_VALUE;
        config.lexConfig = lexConfig;
        return config;
      };
    })();
  }, {
    './control.js': 1
  }],
  3: [function (require, module, exports) {
    (function (global) {
      /**
       * @module LexAudio
       * @description The global namespace for Amazon Lex Audio
       */
      global.LexAudio = global.LexAudio || {};
      global.LexAudio.audioControl = require('./control.js').audioControl;
      global.LexAudio.conversation = require('./conversation.js').conversation;
      module.exports = global.LexAudio;
    }).call(this, typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {});
  }, {
    './control.js': 1,
    './conversation.js': 2
  }],
  4: [function (require, module, exports) {
    var bundleFn = arguments[3];
    var sources = arguments[4];
    var cache = arguments[5];
    var stringify = JSON.stringify;

    module.exports = function (fn, options) {
      var wkey;
      var cacheKeys = Object.keys(cache);

      for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        var exp = cache[key].exports; // Using babel as a transpiler to use esmodule, the export will always
        // be an object with the default export as a property of it. To ensure
        // the existing api and babel esmodule exports are both supported we
        // check for both

        if (exp === fn || exp && exp["default"] === fn) {
          wkey = key;
          break;
        }
      }

      if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};

        for (var i = 0, l = cacheKeys.length; i < l; i++) {
          var key = cacheKeys[i];
          wcache[key] = key;
        }

        sources[wkey] = [// @ts-ignore
        Function(['require', 'module', 'exports'], '(' + fn + ')(self)'), wcache];
      }

      var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
      var scache = {};
      scache[wkey] = wkey;
      sources[skey] = [// @ts-ignore
      Function( // @ts-ignore
      ['require'], // try to call default if defined to also support babel esmodule
      // exports
      'var f = require(' + stringify(wkey) + ');' + '(f.default ? f.default : f)(self);'), scache];
      var workerSources = {};
      resolveSources(skey);

      function resolveSources(key) {
        workerSources[key] = true;

        for (var depPath in sources[key][1]) {
          var depKey = sources[key][1][depPath];

          if (!workerSources[depKey]) {
            resolveSources(depKey);
          }
        }
      }

      var src = '(' + bundleFn + ')({' + Object.keys(workerSources).map(function (key) {
        return stringify(key) + ':[' + sources[key][0] + ',' + stringify(sources[key][1]) + ']';
      }).join(',') + '},{},[' + stringify(skey) + '])'; // @ts-ignore

      var URL = // @ts-ignore
      window.URL || window.webkitURL || window.mozURL || window.msURL;
      var blob = new Blob([src], {
        type: 'text/javascript'
      });

      if (options && options.bare) {
        return blob;
      }

      var workerUrl = URL.createObjectURL(blob);
      var worker = new Worker(workerUrl); // @ts-ignore

      worker.objectURL = workerUrl;
      return worker;
    };
  }, {}],
  5: [function (require, module, exports) {
    (function () {
      'use strict';

      var work = require('webworkify');

      var worker = work(require('./worker.js'));
      var audio_context, audio_stream;
      /**
       * The Recorder object. Sets up the onaudioprocess callback and communicates
       * with the web worker to perform audio actions.
       */

      var recorder = function recorder(source, silenceDetectionConfig) {
        silenceDetectionConfig = silenceDetectionConfig || {};
        silenceDetectionConfig.time = silenceDetectionConfig.hasOwnProperty('time') ? silenceDetectionConfig.time : 1500;
        silenceDetectionConfig.amplitude = silenceDetectionConfig.hasOwnProperty('amplitude') ? silenceDetectionConfig.amplitude : 0.2;
        var recording = false,
            currCallback,
            start,
            silenceCallback,
            visualizationCallback; // Create a ScriptProcessorNode with a bufferSize of 4096 and a single input and output channel

        var node = source.context.createScriptProcessor(4096, 1, 1);

        worker.onmessage = function (message) {
          var blob = message.data;
          currCallback(blob);
        };

        worker.postMessage({
          command: 'init',
          config: {
            sampleRate: source.context.sampleRate
          }
        });
        /**
         * Sets the silence and viz callbacks, resets the silence start time, and sets recording to true.
         * @param {?onSilenceCallback} onSilence - Called when silence is detected.
         * @param {?visualizerCallback} visualizer - Can be used to visualize the captured buffer.
         */

        var record = function record(onSilence, visualizer) {
          silenceCallback = onSilence;
          visualizationCallback = visualizer;
          start = Date.now();
          recording = true;
        };
        /**
         * Sets recording to false.
         */


        var stop = function stop() {
          recording = false;
        };
        /**
         * Posts "clear" message to the worker.
         */


        var clear = function clear() {
          stop();
          worker.postMessage({
            command: 'clear'
          });
        };
        /**
         * Sets the export callback and posts an "export" message to the worker.
         * @param {onExportComplete} callback - Called when the export is complete.
         * @param {sampleRate} The sample rate to use in the export.
         */


        var exportWAV = function exportWAV(callback, sampleRate) {
          currCallback = callback;
          worker.postMessage({
            command: 'export',
            sampleRate: sampleRate
          });
        };
        /**
         * Checks the time domain data to see if the amplitude of the audio waveform is more than
         * the silence threshold. If it is, "noise" has been detected and it resets the start time.
         * If the elapsed time reaches the time threshold the silence callback is called. If there is a
         * visualizationCallback it invokes the visualization callback with the time domain data.
         */


        var analyse = function analyse() {
          analyser.fftSize = 2048;
          var bufferLength = analyser.fftSize;
          var dataArray = new Uint8Array(bufferLength);
          var amplitude = silenceDetectionConfig.amplitude;
          var time = silenceDetectionConfig.time;
          analyser.getByteTimeDomainData(dataArray);

          if (typeof visualizationCallback === 'function') {
            visualizationCallback(dataArray, bufferLength);
          }

          for (var i = 0; i < bufferLength; i++) {
            // Normalize between -1 and 1.
            var curr_value_time = dataArray[i] / 128 - 1.0;

            if (curr_value_time > amplitude || curr_value_time < -1 * amplitude) {
              start = Date.now();
            }
          }

          var newtime = Date.now();
          var elapsedTime = newtime - start;

          if (elapsedTime > time) {
            silenceCallback();
          }
        };
        /**
         * The onaudioprocess event handler of the ScriptProcessorNode interface. It is the EventHandler to be
         * called for the audioprocess event that is dispatched to ScriptProcessorNode node types.
         * @param {AudioProcessingEvent} audioProcessingEvent - The audio processing event.
         */


        node.onaudioprocess = function (audioProcessingEvent) {
          if (!recording) {
            return;
          }

          worker.postMessage({
            command: 'record',
            buffer: [audioProcessingEvent.inputBuffer.getChannelData(0)]
          });
          analyse();
        };

        var analyser = source.context.createAnalyser();
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        analyser.smoothingTimeConstant = 0.85;
        source.connect(analyser);
        analyser.connect(node);
        node.connect(source.context.destination);
        return {
          record: record,
          stop: stop,
          clear: clear,
          exportWAV: exportWAV
        };
      };
      /**
       * Audio recorder object. Handles setting up the audio context,
       * accessing the mike, and creating the Recorder object.
       */


      exports.audioRecorder = function () {
        /**
         * Creates an audio context and calls getUserMedia to request the mic (audio).
         */
        var requestDevice = function requestDevice() {
          if (typeof audio_context === 'undefined') {
            // @ts-ignore
            window.AudioContext = // @ts-ignore
            window.AudioContext || window.webkitAudioContext;
            audio_context = new AudioContext();
          }

          return navigator.mediaDevices.getUserMedia({
            audio: true
          }).then(function (stream) {
            audio_stream = stream;
          });
        };

        var createRecorder = function createRecorder(silenceDetectionConfig) {
          return recorder(audio_context.createMediaStreamSource(audio_stream), silenceDetectionConfig);
        };

        var audioContext = function audioContext() {
          return audio_context;
        };

        return {
          requestDevice: requestDevice,
          createRecorder: createRecorder,
          audioContext: audioContext
        };
      };
    })();
  }, {
    './worker.js': 6,
    webworkify: 4
  }],
  6: [function (require, module, exports) {
    module.exports = function (self) {
      'use strict';

      var recLength = 0,
          recBuffer = [],
          recordSampleRate;
      self.addEventListener('message', function (e) {
        switch (e.data.command) {
          case 'init':
            init(e.data.config);
            break;

          case 'record':
            record(e.data.buffer);
            break;

          case 'export':
            exportBuffer(e.data.sampleRate);
            break;

          case 'clear':
            clear();
            break;
        }
      });

      function init(config) {
        recordSampleRate = config.sampleRate;
      }

      function record(inputBuffer) {
        recBuffer.push(inputBuffer[0]);
        recLength += inputBuffer[0].length;
      }

      function exportBuffer(exportSampleRate) {
        var mergedBuffers = mergeBuffers(recBuffer, recLength);
        var downsampledBuffer = downsampleBuffer(mergedBuffers, exportSampleRate);
        var encodedWav = encodeWAV(downsampledBuffer);
        var audioBlob = new Blob([encodedWav], {
          type: 'application/octet-stream'
        }); // @ts-ignore

        postMessage(audioBlob);
      }

      function clear() {
        recLength = 0;
        recBuffer = [];
      }

      function downsampleBuffer(buffer, exportSampleRate) {
        if (exportSampleRate === recordSampleRate) {
          return buffer;
        }

        var sampleRateRatio = recordSampleRate / exportSampleRate;
        var newLength = Math.round(buffer.length / sampleRateRatio);
        var result = new Float32Array(newLength);
        var offsetResult = 0;
        var offsetBuffer = 0;

        while (offsetResult < result.length) {
          var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
          var accum = 0,
              count = 0;

          for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
          }

          result[offsetResult] = accum / count;
          offsetResult++;
          offsetBuffer = nextOffsetBuffer;
        }

        return result;
      }

      function mergeBuffers(bufferArray, recLength) {
        var result = new Float32Array(recLength);
        var offset = 0;

        for (var i = 0; i < bufferArray.length; i++) {
          result.set(bufferArray[i], offset);
          offset += bufferArray[i].length;
        }

        return result;
      }

      function floatTo16BitPCM(output, offset, input) {
        for (var i = 0; i < input.length; i++, offset += 2) {
          var s = Math.max(-1, Math.min(1, input[i]));
          output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        }
      }

      function writeString(view, offset, string) {
        for (var i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      }

      function encodeWAV(samples) {
        var buffer = new ArrayBuffer(44 + samples.length * 2);
        var view = new DataView(buffer);
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 32 + samples.length * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, recordSampleRate, true);
        view.setUint32(28, recordSampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);
        floatTo16BitPCM(view, 44, samples);
        return view;
      }
    };
  }, {}]
}, {}, [3]);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../node_modules/webpack/buildin/global.js */ "../../node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./lib/Interactions/index.js":
/*!***********************************!*\
  !*** ./lib/Interactions/index.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function __export(m) {
  for (var p in m) {
    if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

__export(__webpack_require__(/*! ./ChatBot */ "./lib/Interactions/ChatBot.js"));

/***/ }),

/***/ "./lib/Storage/Common.js":
/*!*******************************!*\
  !*** ./lib/Storage/Common.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

function calcKey(file, fileToKey) {
  var name = file.name,
      size = file.size,
      type = file.type;
  var key = encodeURI(name);

  if (fileToKey) {
    var callback_type = _typeof(fileToKey);

    if (callback_type === 'string') {
      key = fileToKey;
    } else if (callback_type === 'function') {
      key = fileToKey({
        name: name,
        size: size,
        type: type
      });
    } else {
      key = encodeURI(JSON.stringify(fileToKey));
    }

    if (!key) {
      key = 'empty_key';
    }
  }

  return key.replace(/\s/g, '_');
}

exports.calcKey = calcKey;

/***/ }),

/***/ "./lib/Storage/S3Album.js":
/*!********************************!*\
  !*** ./lib/Storage/S3Album.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var react_1 = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var storage_1 = __webpack_require__(/*! @aws-amplify/storage */ "@aws-amplify/storage");

var Picker_1 = __webpack_require__(/*! ../Widget/Picker */ "./lib/Widget/Picker.js");

var AmplifyTheme_1 = __webpack_require__(/*! ../AmplifyTheme */ "./lib/AmplifyTheme.js");

var S3Image_1 = __webpack_require__(/*! ./S3Image */ "./lib/Storage/S3Image.js");

var S3Text_1 = __webpack_require__(/*! ./S3Text */ "./lib/Storage/S3Text.js");

var logger = new core_1.ConsoleLogger('Storage.S3Album');

var S3Album =
/** @class */
function (_super) {
  __extends(S3Album, _super);

  function S3Album(props) {
    var _this = _super.call(this, props) || this;

    _this._isMounted = false;
    _this.handlePick = _this.handlePick.bind(_this);
    _this.handleClick = _this.handleClick.bind(_this);
    _this.list = _this.list.bind(_this);
    _this.marshal = _this.marshal.bind(_this);
    _this.state = {
      items: [],
      ts: new Date().getTime()
    };
    return _this;
  }

  S3Album.prototype.getKey = function (file) {
    var fileToKey = this.props.fileToKey;
    var name = file.name,
        size = file.size,
        type = file.type;
    var key = encodeURI(name);

    if (fileToKey) {
      var callback_type = _typeof(fileToKey);

      if (callback_type === 'string') {
        key = fileToKey;
      } else if (callback_type === 'function') {
        key = fileToKey({
          name: name,
          size: size,
          type: type
        });
      } else {
        key = encodeURI(JSON.stringify(fileToKey));
      }

      if (!key) {
        logger.debug('key is empty');
        key = 'empty_key';
      }
    }

    return key.replace(/\s/g, '_');
  };

  S3Album.prototype.handlePick = function (data) {
    var _this = this;

    var _a = this.props,
        onPick = _a.onPick,
        onLoad = _a.onLoad,
        onError = _a.onError,
        track = _a.track,
        level = _a.level;

    if (onPick) {
      onPick(data);
    }

    var path = this.props.path || '';
    var file = data.file,
        name = data.name,
        size = data.size,
        type = data.type;
    var key = path + this.getKey(data);

    if (!storage_1["default"] || typeof storage_1["default"].put !== 'function') {
      throw new Error('No Storage module found, please ensure @aws-amplify/storage is imported');
    }

    storage_1["default"].put(key, file, {
      level: level ? level : 'public',
      contentType: type,
      track: track
    }).then(function (data) {
      logger.debug('handle pick data', data);
      var items = _this.state.items;

      if (items.filter(function (item) {
        return item.key === key;
      }).length === 0) {
        var list = items.concat(data);

        _this.marshal(list);
      } else {
        logger.debug('update an item');
      }

      if (onLoad) {
        onLoad(data);
      }
    })["catch"](function (err) {
      logger.debug('handle pick error', err);

      if (onError) {
        onError(err);
      }
    });

    if (this._isMounted) {
      this.setState({
        ts: new Date().getTime()
      });
    }
  };

  S3Album.prototype.handleClick = function (item) {
    var _a = this.props,
        onClickItem = _a.onClickItem,
        select = _a.select,
        onSelect = _a.onSelect;

    if (onClickItem) {
      onClickItem(item);
    }

    if (!select) {
      return;
    }

    item.selected = !item.selected;

    if (this._isMounted) {
      this.setState({
        items: this.state.items.slice()
      });
    }

    if (!onSelect) {
      return;
    }

    var selected_items = this.state.items.filter(function (item) {
      return item.selected;
    });
    onSelect(item, selected_items);
  };

  S3Album.prototype.componentDidMount = function () {
    this._isMounted = true;
    this.list();
  };

  S3Album.prototype.componentWillUnmount = function () {
    this._isMounted = false;
  };

  S3Album.prototype.componentDidUpdate = function (prevProps, prevState) {
    if (this.props.path === prevProps.path && this.props.ts === prevProps.ts && this.props.select === prevProps.select) {
      return;
    }

    if (!this.props.select) {
      this.state.items.forEach(function (item) {
        return item.selected = false;
      });
    }

    if (this.props.onSelect) {
      this.props.onSelect(null, []);
    }

    this.list();
  };

  S3Album.prototype.list = function () {
    var _this = this;

    var _a = this.props,
        path = _a.path,
        level = _a.level,
        track = _a.track,
        identityId = _a.identityId;
    logger.debug('Album path: ' + path);

    if (!storage_1["default"] || typeof storage_1["default"].list !== 'function') {
      throw new Error('No Storage module found, please ensure @aws-amplify/storage is imported');
    }

    return storage_1["default"].list(path, {
      level: level ? level : 'public',
      track: track,
      identityId: identityId
    }).then(function (data) {
      logger.debug('album list', data);

      _this.marshal(data);
    })["catch"](function (err) {
      logger.warn(err);
      return [];
    });
  };

  S3Album.prototype.contentType = function (item) {
    return core_1.JS.filenameToContentType(item.key, 'image/*');
  };

  S3Album.prototype.marshal = function (list) {
    var _this = this;

    var contentType = this.props.contentType || '';
    list.forEach(function (item) {
      if (item.contentType) {
        return;
      }

      var isString = typeof contentType === 'string';
      item.contentType = isString ? contentType : contentType(item);

      if (!item.contentType) {
        item.contentType = _this.contentType(item);
      }
    });
    var items = this.filter(list);
    items = this.sort(items);

    if (this._isMounted) {
      this.setState({
        items: items
      });
    }
  };

  S3Album.prototype.filter = function (list) {
    var filter = this.props.filter;
    return filter ? filter(list) : list;
  };

  S3Album.prototype.sort = function (list) {
    var sort = this.props.sort;

    var typeof_sort = _typeof(sort);

    if (typeof_sort === 'function') {
      return sort(list);
    } // @ts-ignore


    if (['string', 'undefined'].includes(typeof_sort)) {
      var sort_str = sort ? sort : 'lastModified';
      var parts = sort_str.split(/\s+/);
      var field = parts[0];
      var dir = parts.length > 1 ? parts[1] : '';

      if (field === 'lastModified') {
        dir = dir === 'asc' ? 'asc' : 'desc';
      } else {
        dir = dir === 'desc' ? 'desc' : 'asc';
      }

      core_1.JS.sortByField(list, field, dir);
      return list;
    }

    logger.warn('invalid sort. done nothing. should be a string or function');
    return list;
  };

  S3Album.prototype.render = function () {
    var _this = this;

    var _a = this.props,
        picker = _a.picker,
        translateItem = _a.translateItem,
        level = _a.level,
        identityId = _a.identityId;
    var _b = this.state,
        items = _b.items,
        ts = _b.ts;
    var pickerTitle = this.props.pickerTitle || 'Pick';
    var theme = this.props.theme || AmplifyTheme_1["default"];
    var list = items.map(function (item) {
      var isText = item.contentType && core_1.JS.isTextFile(item.contentType);
      return isText ? React.createElement(S3Text_1["default"], {
        key: item.key,
        textKey: item.key,
        theme: theme,
        style: theme.albumText,
        selected: item.selected,
        translate: translateItem,
        level: level,
        identityId: identityId,
        onClick: function onClick() {
          return _this.handleClick(item);
        }
      }) : React.createElement(S3Image_1["default"], {
        key: item.key,
        imgKey: item.key,
        theme: theme,
        style: theme.albumPhoto,
        selected: item.selected,
        translate: translateItem,
        level: level,
        identityId: identityId,
        onClick: function onClick() {
          return _this.handleClick(item);
        }
      });
    });
    return React.createElement("div", null, React.createElement("div", {
      style: theme.album
    }, list), picker ? React.createElement(Picker_1["default"], {
      key: ts,
      title: pickerTitle,
      accept: "image/*, text/*",
      onPick: this.handlePick,
      theme: theme
    }) : null);
  };

  return S3Album;
}(react_1.Component);

exports["default"] = S3Album;

/***/ }),

/***/ "./lib/Storage/S3Image.js":
/*!********************************!*\
  !*** ./lib/Storage/S3Image.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var react_1 = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var storage_1 = __webpack_require__(/*! @aws-amplify/storage */ "@aws-amplify/storage");

var AmplifyTheme_1 = __webpack_require__(/*! ../AmplifyTheme */ "./lib/AmplifyTheme.js");

var AmplifyUI_1 = __webpack_require__(/*! ../AmplifyUI */ "./lib/AmplifyUI.js");

var PhotoPicker_1 = __webpack_require__(/*! ../Widget/PhotoPicker */ "./lib/Widget/PhotoPicker.js");

var Common_1 = __webpack_require__(/*! ./Common */ "./lib/Storage/Common.js");

var logger = new core_1.ConsoleLogger('Storage.S3Image');

var S3Image =
/** @class */
function (_super) {
  __extends(S3Image, _super);

  function S3Image(props) {
    var _this = _super.call(this, props) || this;

    _this._isMounted = false;
    _this.handleOnLoad = _this.handleOnLoad.bind(_this);
    _this.handleOnError = _this.handleOnError.bind(_this);
    _this.handlePick = _this.handlePick.bind(_this);
    _this.handleClick = _this.handleClick.bind(_this);
    var initSrc = _this.props.src || AmplifyUI_1.transparent1X1;
    _this.state = {
      src: initSrc
    };
    return _this;
  }

  S3Image.prototype.getImageSource = function (key, level, track, identityId) {
    var _this = this;

    if (!storage_1["default"] || typeof storage_1["default"].get !== 'function') {
      throw new Error('No Storage module found, please ensure @aws-amplify/storage is imported');
    }

    storage_1["default"].get(key, {
      level: level ? level : 'public',
      track: track,
      identityId: identityId
    }).then(function (url) {
      if (_this._isMounted) {
        _this.setState({
          src: url
        });
      }
    })["catch"](function (err) {
      return logger.debug(err);
    });
  };

  S3Image.prototype.load = function () {
    var _a = this.props,
        imgKey = _a.imgKey,
        path = _a.path,
        body = _a.body,
        contentType = _a.contentType,
        level = _a.level,
        track = _a.track,
        identityId = _a.identityId;

    if (!imgKey && !path) {
      logger.debug('empty imgKey and path');
      return;
    }

    var that = this;
    var key = imgKey || path;
    logger.debug('loading ' + key + '...');

    if (body) {
      var type = contentType || 'binary/octet-stream';

      if (!storage_1["default"] || typeof storage_1["default"].put !== 'function') {
        throw new Error('No Storage module found, please ensure @aws-amplify/storage is imported');
      }

      var ret = storage_1["default"].put(key, body, {
        contentType: type,
        level: level ? level : 'public',
        track: track
      });
      ret.then(function (data) {
        logger.debug(data);
        that.getImageSource(key, level, track, identityId);
      })["catch"](function (err) {
        return logger.debug(err);
      });
    } else {
      that.getImageSource(key, level, track, identityId);
    }
  };

  S3Image.prototype.handleOnLoad = function (evt) {
    var onLoad = this.props.onLoad;

    if (onLoad) {
      onLoad(this.state.src);
    }
  };

  S3Image.prototype.handleOnError = function (evt) {
    var onError = this.props.onError;

    if (onError) {
      onError(this.state.src);
    }
  };

  S3Image.prototype.handlePick = function (data) {
    var that = this;
    var path = this.props.path || '';
    var _a = this.props,
        imgKey = _a.imgKey,
        level = _a.level,
        fileToKey = _a.fileToKey,
        track = _a.track,
        identityId = _a.identityId;
    var file = data.file,
        name = data.name,
        size = data.size,
        type = data.type;
    var key = imgKey || path + Common_1.calcKey(data, fileToKey);

    if (!storage_1["default"] || typeof storage_1["default"].put !== 'function') {
      throw new Error('No Storage module found, please ensure @aws-amplify/storage is imported');
    }

    storage_1["default"].put(key, file, {
      level: level ? level : 'public',
      contentType: type,
      track: track
    }).then(function (data) {
      logger.debug('handle pick data', data);
      that.getImageSource(key, level, track, identityId);
    })["catch"](function (err) {
      return logger.debug('handle pick error', err);
    });
  };

  S3Image.prototype.handleClick = function (evt) {
    var onClick = this.props.onClick;

    if (onClick) {
      onClick(evt);
    }
  };

  S3Image.prototype.componentDidMount = function () {
    this._isMounted = true;
    this.load();
  };

  S3Image.prototype.componentWillUnmount = function () {
    this._isMounted = false;
  };

  S3Image.prototype.componentDidUpdate = function (prevProps) {
    var update = prevProps.path !== this.props.path || prevProps.imgKey !== this.props.imgKey || prevProps.body !== this.props.body || prevProps.level !== this.props.level;

    if (update) {
      this.load();
    }
  };

  S3Image.prototype.imageEl = function (src, theme) {
    if (!src) {
      return null;
    }

    var _a = this.props,
        className = _a.className,
        selected = _a.selected;
    var containerStyle = {
      position: 'relative'
    };
    return React.createElement("div", {
      style: containerStyle,
      onClick: this.handleClick
    }, React.createElement("img", {
      className: className,
      style: theme.photoImg,
      src: src,
      onLoad: this.handleOnLoad,
      onError: this.handleOnError
    }), React.createElement("div", {
      style: selected ? theme.overlaySelected : theme.overlay
    }));
  };

  S3Image.prototype.render = function () {
    var _a = this.props,
        hidden = _a.hidden,
        style = _a.style,
        picker = _a.picker,
        translate = _a.translate,
        imgKey = _a.imgKey;
    var src = this.state.src;

    if (translate) {
      src = typeof translate === 'string' ? translate : translate({
        type: 'image',
        key: imgKey,
        content: src
      });
    }

    if (!src && !picker) {
      return null;
    }

    var theme = this.props.theme || AmplifyTheme_1["default"];
    var photoStyle = hidden ? AmplifyTheme_1["default"].hidden : Object.assign({}, theme.photo, style);
    return React.createElement("div", {
      style: photoStyle
    }, photoStyle ? this.imageEl(src, theme) : null, picker ? React.createElement("div", null, React.createElement(PhotoPicker_1["default"], {
      key: "picker",
      onPick: this.handlePick,
      theme: theme
    })) : null);
  };

  return S3Image;
}(react_1.Component);

exports["default"] = S3Image;

/***/ }),

/***/ "./lib/Storage/S3Text.js":
/*!*******************************!*\
  !*** ./lib/Storage/S3Text.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var react_1 = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var storage_1 = __webpack_require__(/*! @aws-amplify/storage */ "@aws-amplify/storage");

var AmplifyTheme_1 = __webpack_require__(/*! ../AmplifyTheme */ "./lib/AmplifyTheme.js");

var TextPicker_1 = __webpack_require__(/*! ../Widget/TextPicker */ "./lib/Widget/TextPicker.js");

var Common_1 = __webpack_require__(/*! ./Common */ "./lib/Storage/Common.js");

var logger = new core_1.ConsoleLogger('Storage.S3Text');

var S3Text =
/** @class */
function (_super) {
  __extends(S3Text, _super);

  function S3Text(props) {
    var _this = _super.call(this, props) || this;

    _this._isMounted = false;
    _this.handleOnLoad = _this.handleOnLoad.bind(_this);
    _this.handleOnError = _this.handleOnError.bind(_this);
    _this.handlePick = _this.handlePick.bind(_this);
    _this.handleClick = _this.handleClick.bind(_this);
    var text = props.text,
        textKey = props.textKey;
    _this.state = {
      text: text || '',
      textKey: textKey || ''
    };
    return _this;
  }

  S3Text.prototype.getText = function (key, level, track, identityId) {
    var _this = this;

    if (!storage_1["default"] || typeof storage_1["default"].get !== 'function') {
      throw new Error('No Storage module found, please ensure @aws-amplify/storage is imported');
    }

    storage_1["default"].get(key, {
      download: true,
      level: level ? level : 'public',
      track: track,
      identityId: identityId
    }).then(function (data) {
      logger.debug(data); // @ts-ignore

      var text = data.Body.toString('utf8');

      if (_this._isMounted) {
        _this.setState({
          text: text
        });
      }

      _this.handleOnLoad(text);
    })["catch"](function (err) {
      logger.debug(err);

      _this.handleOnError(err);
    });
  };

  S3Text.prototype.load = function () {
    var _a = this.props,
        path = _a.path,
        textKey = _a.textKey,
        body = _a.body,
        contentType = _a.contentType,
        level = _a.level,
        track = _a.track,
        identityId = _a.identityId;

    if (!textKey && !path) {
      logger.debug('empty textKey and path');
      return;
    }

    var that = this;
    var key = textKey || path;
    logger.debug('loading ' + key + '...');

    if (body) {
      var type = contentType || 'text/*';

      if (!storage_1["default"] || typeof storage_1["default"].put !== 'function') {
        throw new Error('No Storage module found, please ensure @aws-amplify/storage is imported');
      }

      var ret = storage_1["default"].put(key, body, {
        contentType: type,
        level: level ? level : 'public',
        track: track
      });
      ret.then(function (data) {
        logger.debug(data);
        that.getText(key, level, track, identityId);
      })["catch"](function (err) {
        return logger.debug(err);
      });
    } else {
      that.getText(key, level, track, identityId);
    }
  };

  S3Text.prototype.handleOnLoad = function (text) {
    var onLoad = this.props.onLoad;

    if (onLoad) {
      onLoad(text);
    }
  };

  S3Text.prototype.handleOnError = function (err) {
    var onError = this.props.onError;

    if (onError) {
      onError(err);
    }
  };

  S3Text.prototype.handlePick = function (data) {
    var that = this;
    var path = this.props.path || '';
    var _a = this.props,
        textKey = _a.textKey,
        level = _a.level,
        fileToKey = _a.fileToKey,
        track = _a.track,
        identityId = _a.identityId;
    var file = data.file,
        name = data.name,
        size = data.size,
        type = data.type;
    var key = textKey || path + Common_1.calcKey(data, fileToKey);

    if (!storage_1["default"] || typeof storage_1["default"].put !== 'function') {
      throw new Error('No Storage module found, please ensure @aws-amplify/storage is imported');
    }

    storage_1["default"].put(key, file, {
      level: level ? level : 'public',
      contentType: type,
      track: track
    }).then(function (data) {
      logger.debug('handle pick data', data);
      that.getText(key, level, track, identityId);
    })["catch"](function (err) {
      return logger.debug('handle pick error', err);
    });
  };

  S3Text.prototype.handleClick = function (evt) {
    var onClick = this.props.onClick;

    if (onClick) {
      onClick(evt);
    }
  };

  S3Text.prototype.componentDidMount = function () {
    this._isMounted = true;
    this.load();
  };

  S3Text.prototype.componentWillUnmount = function () {
    this._isMounted = false;
  };

  S3Text.prototype.componentDidUpdate = function (prevProps) {
    var update = prevProps.path !== this.props.path || prevProps.textKey !== this.props.textKey || prevProps.body !== this.props.body;

    if (update) {
      this.load();
    }
  };

  S3Text.prototype.textEl = function (text, theme) {
    if (!text) {
      return null;
    }

    var selected = this.props.selected;
    var containerStyle = {
      position: 'relative'
    };
    return React.createElement("div", {
      style: containerStyle,
      onClick: this.handleClick
    }, React.createElement("pre", {
      style: theme.pre
    }, text), React.createElement("div", {
      style: selected ? theme.overlaySelected : theme.overlay
    }));
  };

  S3Text.prototype.render = function () {
    var _a = this.props,
        hidden = _a.hidden,
        style = _a.style,
        picker = _a.picker,
        translate = _a.translate,
        textKey = _a.textKey;
    var text = this.state.text;

    if (translate) {
      text = typeof translate === 'string' ? translate : translate({
        type: 'text',
        key: textKey,
        content: text
      });
    }

    if (!text && !picker) {
      return null;
    }

    var theme = this.props.theme || AmplifyTheme_1["default"];
    var textStyle = hidden ? AmplifyTheme_1["default"].hidden : Object.assign({}, theme.text, style);
    return React.createElement("div", {
      style: textStyle
    }, textStyle ? this.textEl(text, theme) : null, picker ? React.createElement("div", null, React.createElement(TextPicker_1["default"], {
      key: "picker",
      onPick: this.handlePick,
      theme: theme
    })) : null);
  };

  return S3Text;
}(react_1.Component);

exports["default"] = S3Text;

/***/ }),

/***/ "./lib/Storage/index.js":
/*!******************************!*\
  !*** ./lib/Storage/index.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var S3Album_1 = __webpack_require__(/*! ./S3Album */ "./lib/Storage/S3Album.js");

exports.S3Album = S3Album_1["default"];

var S3Image_1 = __webpack_require__(/*! ./S3Image */ "./lib/Storage/S3Image.js");

exports.S3Image = S3Image_1["default"];

var S3Text_1 = __webpack_require__(/*! ./S3Text */ "./lib/Storage/S3Text.js");

exports.S3Text = S3Text_1["default"];

/***/ }),

/***/ "./lib/Widget/PhotoPicker.js":
/*!***********************************!*\
  !*** ./lib/Widget/PhotoPicker.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var react_1 = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var Picker_1 = __webpack_require__(/*! ./Picker */ "./lib/Widget/Picker.js");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var PickerPreview = {
  maxWidth: '100%'
};
var logger = new core_1.ConsoleLogger('PhotoPicker');

var PhotoPicker =
/** @class */
function (_super) {
  __extends(PhotoPicker, _super);

  function PhotoPicker(props) {
    var _this = _super.call(this, props) || this;

    _this.handlePick = _this.handlePick.bind(_this);
    _this.state = {
      previewSrc: props.previewSrc
    };
    return _this;
  }

  PhotoPicker.prototype.handlePick = function (data) {
    var that = this;
    var file = data.file,
        name = data.name,
        size = data.size,
        type = data.type;
    var _a = this.props,
        preview = _a.preview,
        onPick = _a.onPick,
        onLoad = _a.onLoad;

    if (onPick) {
      onPick(data);
    }

    if (preview) {
      var reader = new FileReader();

      reader.onload = function (e) {
        var url = e.target.result; // @ts-ignore

        that.setState({
          previewSrc: url
        });

        if (onLoad) {
          onLoad(url);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  PhotoPicker.prototype.render = function () {
    var preview = this.props.preview;
    var previewSrc = this.state.previewSrc;
    var headerText = this.props.headerText || 'Photos';
    var headerHint = this.props.headerHint || 'Add your photos by clicking below';
    var title = this.props.title || 'Select a Photo';
    var theme = this.props.theme || Amplify_UI_Theme_1["default"];
    var previewStyle = Object.assign({}, PickerPreview, theme.pickerPreview);
    var previewHidden = !(preview && preview !== 'hidden');
    return React.createElement(Amplify_UI_Components_React_1.FormSection, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.SectionHeader, {
      theme: theme,
      hint: headerHint
    }, core_1.I18n.get(headerText)), React.createElement(Amplify_UI_Components_React_1.SectionBody, {
      theme: theme
    }, previewSrc ? previewHidden ? 'The image has been selected' : React.createElement("img", {
      src: previewSrc,
      style: previewStyle
    }) : React.createElement(Amplify_UI_Components_React_1.PhotoPlaceholder, {
      theme: theme
    })), React.createElement(Picker_1["default"], {
      title: title,
      accept: "image/*",
      theme: theme,
      onPick: this.handlePick
    }));
  };

  return PhotoPicker;
}(react_1.Component);

exports["default"] = PhotoPicker;

/***/ }),

/***/ "./lib/Widget/Picker.js":
/*!******************************!*\
  !*** ./lib/Widget/Picker.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var react_1 = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var PickerInput = {
  width: '100%',
  height: '100%',
  display: 'inline-block',
  position: 'absolute',
  left: 0,
  top: 0,
  opacity: 0,
  cursor: 'pointer'
};
var logger = new core_1.ConsoleLogger('Picker');

var Picker =
/** @class */
function (_super) {
  __extends(Picker, _super);

  function Picker() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  Picker.prototype.handleInput = function (e) {
    var that = this;
    var file = e.target.files[0];

    if (!file) {
      return;
    }

    var name = file.name,
        size = file.size,
        type = file.type;
    logger.debug(file);
    var onPick = this.props.onPick;

    if (onPick) {
      onPick({
        file: file,
        name: name,
        size: size,
        type: type
      });
    }
  };

  Picker.prototype.render = function () {
    var _this = this;

    var title = this.props.title || 'Pick a File';
    var accept = this.props.accept || '*/*';
    var theme = this.props.theme || Amplify_UI_Theme_1["default"];
    var pickerStyle = Object.assign({}, {
      position: 'relative'
    }, theme.pickerPicker);
    var inputStyle = Object.assign({}, PickerInput, theme.pickerInput);
    return React.createElement("div", {
      style: pickerStyle
    }, React.createElement(Amplify_UI_Components_React_1.PhotoPickerButton, {
      theme: theme
    }, core_1.I18n.get(title)), React.createElement("input", {
      title: core_1.I18n.get(title),
      type: "file",
      accept: accept,
      style: inputStyle,
      onChange: function onChange(e) {
        return _this.handleInput(e);
      }
    }));
  };

  return Picker;
}(react_1.Component);

exports["default"] = Picker;

/***/ }),

/***/ "./lib/Widget/SelectMFAType.js":
/*!*************************************!*\
  !*** ./lib/Widget/SelectMFAType.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

var __assign = this && this.__assign || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var react_1 = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var TOTPSetupComp_1 = __webpack_require__(/*! ./TOTPSetupComp */ "./lib/Widget/TOTPSetupComp.js");

var logger = new core_1.ConsoleLogger('SelectMFAType');

var SelectMFAType =
/** @class */
function (_super) {
  __extends(SelectMFAType, _super);

  function SelectMFAType(props) {
    var _this = _super.call(this, props) || this;

    _this.verify = _this.verify.bind(_this);
    _this.handleInputChange = _this.handleInputChange.bind(_this);
    _this.state = {
      TOTPSetup: false,
      selectMessage: null
    };
    return _this;
  }

  SelectMFAType.prototype.handleInputChange = function (evt) {
    // clear current state
    this.setState({
      TOTPSetup: false,
      selectMessage: null
    });
    this.inputs = {};
    var _a = evt.target,
        name = _a.name,
        value = _a.value,
        type = _a.type,
        checked = _a.checked; // @ts-ignore

    var check_type = ['radio', 'checkbox'].includes(type);
    this.inputs[value] = check_type ? checked : value;
  };

  SelectMFAType.prototype.verify = function () {
    var _this = this;

    logger.debug('mfatypes inputs', this.inputs);

    if (!this.inputs) {
      logger.debug('No mfa type selected');
      return;
    }

    var _a = this.inputs,
        TOTP = _a.TOTP,
        SMS = _a.SMS,
        NOMFA = _a.NOMFA;
    var mfaMethod = null;

    if (TOTP) {
      mfaMethod = 'TOTP';
    } else if (SMS) {
      mfaMethod = 'SMS';
    } else if (NOMFA) {
      mfaMethod = 'NOMFA';
    }

    var user = this.props.authData;

    if (!auth_1["default"] || typeof auth_1["default"].setPreferredMFA !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].setPreferredMFA(user, mfaMethod).then(function (data) {
      logger.debug('set preferred mfa success', data);

      _this.setState({
        selectMessage: 'Success! Your MFA Type is now: ' + mfaMethod,
        showToast: true
      });
    })["catch"](function (err) {
      var message = err.message;

      if (message === 'User has not set up software token mfa' || message === 'User has not verified software token mfa') {
        _this.setState({
          TOTPSetup: true,
          selectMessage: 'You need to setup TOTP',
          showToast: true
        });
      } else {
        logger.debug('set preferred mfa failed', err);

        _this.setState({
          selectMessage: 'Failed! You cannot select MFA Type for now!',
          showToast: true
        });
      }
    });
  };

  SelectMFAType.prototype.selectView = function (theme) {
    var _this = this;

    var MFATypes = this.props.MFATypes;

    if (!MFATypes || Object.keys(MFATypes).length < 2) {
      logger.debug('less than 2 mfa types available');
      return React.createElement("div", null, React.createElement("a", null, "less than 2 mfa types available"));
    }

    var SMS = MFATypes.SMS,
        TOTP = MFATypes.TOTP,
        Optional = MFATypes.Optional;
    return React.createElement(Amplify_UI_Components_React_1.FormSection, {
      theme: theme
    }, this.state.showToast && this.state.selectMessage && React.createElement(Amplify_UI_Components_React_1.Toast, {
      theme: theme,
      onClose: function onClose() {
        return _this.setState({
          showToast: false
        });
      }
    }, core_1.I18n.get(this.state.selectMessage)), React.createElement(Amplify_UI_Components_React_1.SectionHeader, {
      theme: theme
    }, core_1.I18n.get('Select MFA Type')), React.createElement(Amplify_UI_Components_React_1.SectionBody, {
      theme: theme
    }, React.createElement("div", null, SMS ? React.createElement(Amplify_UI_Components_React_1.RadioRow, {
      placeholder: core_1.I18n.get('SMS'),
      theme: theme,
      key: "sms",
      name: "MFAType",
      value: "SMS",
      onChange: this.handleInputChange
    }) : null, TOTP ? React.createElement(Amplify_UI_Components_React_1.RadioRow, {
      placeholder: core_1.I18n.get('TOTP'),
      theme: theme,
      key: "totp",
      name: "MFAType",
      value: "TOTP",
      onChange: this.handleInputChange
    }) : null, Optional ? React.createElement(Amplify_UI_Components_React_1.RadioRow, {
      placeholder: core_1.I18n.get('No MFA'),
      theme: theme,
      key: "noMFA",
      name: "MFAType",
      value: "NOMFA",
      onChange: this.handleInputChange
    }) : null)), React.createElement(Amplify_UI_Components_React_1.SectionFooter, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.Button, {
      theme: theme,
      onClick: this.verify
    }, core_1.I18n.get('Verify'))));
  };

  SelectMFAType.prototype.render = function () {
    var theme = this.props.theme ? this.props.theme : Amplify_UI_Theme_1["default"];
    return React.createElement("div", null, this.selectView(theme), this.state.TOTPSetup ? React.createElement(TOTPSetupComp_1["default"], __assign({}, this.props)) : null);
  };

  return SelectMFAType;
}(react_1.Component);

exports["default"] = SelectMFAType;

/***/ }),

/***/ "./lib/Widget/TOTPSetupComp.js":
/*!*************************************!*\
  !*** ./lib/Widget/TOTPSetupComp.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var react_1 = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var auth_1 = __webpack_require__(/*! @aws-amplify/auth */ "@aws-amplify/auth");

var Amplify_UI_Theme_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Theme */ "./lib/Amplify-UI/Amplify-UI-Theme.js");

var Amplify_UI_Components_React_1 = __webpack_require__(/*! ../Amplify-UI/Amplify-UI-Components-React */ "./lib/Amplify-UI/Amplify-UI-Components-React.js");

var ui_1 = __webpack_require__(/*! @aws-amplify/ui */ "@aws-amplify/ui");

var QRCode = __webpack_require__(/*! qrcode.react */ "../../node_modules/qrcode.react/lib/index.js");

var logger = new core_1.ConsoleLogger('TOTPSetupComp');

var TOTPSetupComp =
/** @class */
function (_super) {
  __extends(TOTPSetupComp, _super);

  function TOTPSetupComp(props) {
    var _this = _super.call(this, props) || this;

    _this.setup = _this.setup.bind(_this);
    _this.showSecretCode = _this.showSecretCode.bind(_this);
    _this.verifyTotpToken = _this.verifyTotpToken.bind(_this);
    _this.handleInputChange = _this.handleInputChange.bind(_this);
    _this.triggerTOTPEvent = _this.triggerTOTPEvent.bind(_this);
    _this.state = {
      code: null,
      setupMessage: null
    };
    return _this;
  }

  TOTPSetupComp.prototype.componentDidMount = function () {
    this.setup();
  };

  TOTPSetupComp.prototype.triggerTOTPEvent = function (event, data, user) {
    if (this.props.onTOTPEvent) {
      this.props.onTOTPEvent(event, data, user);
    }
  };

  TOTPSetupComp.prototype.handleInputChange = function (evt) {
    this.setState({
      setupMessage: null
    });
    this.inputs = {};
    var _a = evt.target,
        name = _a.name,
        value = _a.value,
        type = _a.type,
        checked = _a.checked; // @ts-ignore

    var check_type = ['radio', 'checkbox'].includes(type);
    this.inputs[name] = check_type ? checked : value;
  };

  TOTPSetupComp.prototype.setup = function () {
    var _this = this;

    this.setState({
      setupMessage: null
    });
    var user = this.props.authData;
    var issuer = encodeURI(core_1.I18n.get('AWSCognito'));

    if (!auth_1["default"] || typeof auth_1["default"].setupTOTP !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    auth_1["default"].setupTOTP(user).then(function (data) {
      logger.debug('secret key', data);
      var code = 'otpauth://totp/' + issuer + ':' + user.username + '?secret=' + data + '&issuer=' + issuer;

      _this.setState({
        code: code
      });
    })["catch"](function (err) {
      return logger.debug('totp setup failed', err);
    });
  };

  TOTPSetupComp.prototype.verifyTotpToken = function () {
    var _this = this;

    if (!this.inputs) {
      logger.debug('no input');
      return;
    }

    var user = this.props.authData;
    var totpCode = this.inputs.totpCode;

    if (!auth_1["default"] || typeof auth_1["default"].verifyTotpToken !== 'function' || typeof auth_1["default"].setPreferredMFA !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    return auth_1["default"].verifyTotpToken(user, totpCode).then(function () {
      // set it to preferred mfa
      return auth_1["default"].setPreferredMFA(user, 'TOTP').then(function () {
        _this.setState({
          setupMessage: 'Setup TOTP successfully!'
        });

        logger.debug('set up totp success!');

        _this.triggerTOTPEvent('Setup TOTP', 'SUCCESS', user);
      })["catch"](function (err) {
        _this.setState({
          setupMessage: 'Setup TOTP failed!'
        });

        logger.error(err);
      });
    })["catch"](function (err) {
      _this.setState({
        setupMessage: 'Setup TOTP failed!'
      });

      logger.error(err);
    });
  };

  TOTPSetupComp.prototype.showSecretCode = function (code, theme) {
    if (!code) return null;
    return React.createElement("div", null, React.createElement("div", {
      className: ui_1.totpQrcode
    }, React.createElement(QRCode, {
      value: code
    })), React.createElement(Amplify_UI_Components_React_1.InputLabel, {
      theme: theme
    }, core_1.I18n.get('Enter Security Code:')), React.createElement(Amplify_UI_Components_React_1.Input, {
      autoFocus: true,
      theme: theme,
      key: "totpCode",
      name: "totpCode",
      onChange: this.handleInputChange
    }));
  };

  TOTPSetupComp.prototype.render = function () {
    var theme = this.props.theme ? this.props.theme : Amplify_UI_Theme_1["default"];
    var code = this.state.code;
    return React.createElement(Amplify_UI_Components_React_1.FormSection, {
      theme: theme
    }, this.state.setupMessage && React.createElement(Amplify_UI_Components_React_1.Toast, null, core_1.I18n.get(this.state.setupMessage)), React.createElement(Amplify_UI_Components_React_1.SectionHeader, {
      theme: theme
    }, core_1.I18n.get('Scan then enter verification code')), React.createElement(Amplify_UI_Components_React_1.SectionBody, {
      theme: theme
    }, this.showSecretCode(code, theme), this.state.setupMessage && core_1.I18n.get(this.state.setupMessage)), React.createElement(Amplify_UI_Components_React_1.SectionFooter, {
      theme: theme
    }, React.createElement(Amplify_UI_Components_React_1.Button, {
      theme: theme,
      onClick: this.verifyTotpToken,
      style: {
        width: '100%'
      }
    }, core_1.I18n.get('Verify Security Token'))));
  };

  return TOTPSetupComp;
}(react_1.Component);

exports["default"] = TOTPSetupComp;

/***/ }),

/***/ "./lib/Widget/TextPicker.js":
/*!**********************************!*\
  !*** ./lib/Widget/TextPicker.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var __extends = this && this.__extends || function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = __webpack_require__(/*! react */ "react");

var react_1 = __webpack_require__(/*! react */ "react");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var AmplifyTheme_1 = __webpack_require__(/*! ../AmplifyTheme */ "./lib/AmplifyTheme.js");

var Picker_1 = __webpack_require__(/*! ./Picker */ "./lib/Widget/Picker.js");

var Container = {};
var PickerPreview = {
  maxWidth: '100%'
};
var logger = new core_1.ConsoleLogger('TextPicker');

var TextPicker =
/** @class */
function (_super) {
  __extends(TextPicker, _super);

  function TextPicker(props) {
    var _this = _super.call(this, props) || this;

    _this.handlePick = _this.handlePick.bind(_this);
    _this.state = {
      previewText: props.previewText
    };
    return _this;
  }

  TextPicker.prototype.handlePick = function (data) {
    var that = this;
    var file = data.file,
        name = data.name,
        size = data.size,
        type = data.type;
    var _a = this.props,
        preview = _a.preview,
        onPick = _a.onPick,
        onLoad = _a.onLoad;

    if (onPick) {
      onPick(data);
    }

    if (preview) {
      var reader = new FileReader();

      reader.onload = function (e) {
        var text = e.target.result; // @ts-ignore

        that.setState({
          previewText: text
        });

        if (onLoad) {
          onLoad(text);
        }
      };

      reader.readAsText(file);
    }
  };

  TextPicker.prototype.render = function () {
    var preview = this.props.preview;
    var previewText = this.state.previewText;
    var title = this.props.title || 'Pick a File';
    var theme = this.props.theme || AmplifyTheme_1["default"];
    var containerStyle = Object.assign({}, Container, theme.picker);
    var previewStyle = Object.assign({}, PickerPreview, theme.pickerPreview, theme.halfHeight, preview && preview !== 'hidden' ? {} : AmplifyTheme_1["default"].hidden);
    return React.createElement("div", {
      style: containerStyle
    }, previewText ? React.createElement("div", {
      style: previewStyle
    }, React.createElement("pre", {
      style: theme.pre
    }, previewText)) : null, React.createElement(Picker_1["default"], {
      title: title,
      accept: "text/*",
      theme: theme,
      onPick: this.handlePick
    }));
  };

  return TextPicker;
}(react_1.Component);

exports["default"] = TextPicker;

/***/ }),

/***/ "./lib/Widget/index.js":
/*!*****************************!*\
  !*** ./lib/Widget/index.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var Picker_1 = __webpack_require__(/*! ./Picker */ "./lib/Widget/Picker.js");

exports.Picker = Picker_1["default"];

var PhotoPicker_1 = __webpack_require__(/*! ./PhotoPicker */ "./lib/Widget/PhotoPicker.js");

exports.PhotoPicker = PhotoPicker_1["default"];

var TextPicker_1 = __webpack_require__(/*! ./TextPicker */ "./lib/Widget/TextPicker.js");

exports.TextPicker = TextPicker_1["default"];

var SelectMFAType_1 = __webpack_require__(/*! ./SelectMFAType */ "./lib/Widget/SelectMFAType.js");

exports.SelectMFAType = SelectMFAType_1["default"];

var TOTPSetupComp_1 = __webpack_require__(/*! ./TOTPSetupComp */ "./lib/Widget/TOTPSetupComp.js");

exports.TOTPSetupComp = TOTPSetupComp_1["default"];

/***/ }),

/***/ "./lib/XR/IconButton.js":
/*!******************************!*\
  !*** ./lib/XR/IconButton.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var React = __webpack_require__(/*! react */ "react");

var Tooltip_1 = __webpack_require__(/*! ./Tooltip */ "./lib/XR/Tooltip.js");

var AmplifyUI = __webpack_require__(/*! @aws-amplify/ui */ "@aws-amplify/ui");

var IconButton = function IconButton(props) {
  var buttonIcon;

  switch (props.variant) {
    case 'sound-mute':
      buttonIcon = React.createElement("svg", {
        width: "19",
        height: "19",
        viewBox: "0 0 19 19",
        xmlns: "http://www.w3.org/2000/svg"
      }, React.createElement("g", {
        id: "icons/minis/volumeOff",
        fill: "none",
        fillRule: "evenodd"
      }, React.createElement("path", {
        d: "M3.48026899,12.9630494 C3.63825091,12.9630494 3.79237961,13.0108921 3.92264322,13.1003479 L8.77467683,16.8113609 C9.29423971,17.1679383 10,16.7950396 10,16.1637406 L10,3.78619489 C10,3.15489596 9.29423971,2.78199725 8.77467683,3.13857463 L3.92264322,6.84545211 C3.79237961,6.93490793 3.63825091,6.9827506 3.48026899,6.9827506 L1.78294894,6.9827506 C1.3505185,6.9827506 1,7.33409518 1,7.76754476 L1,12.1781306 C1,12.6117048 1.3505185,12.9630494 1.78294894,12.9630494 L3.48026899,12.9630494 Z M17.2118156,7 L15.0918385,9.11997713 L12.9718614,7 L12,7.97174685 L14.1200917,10.091724 L12,12.2118156 L12.9718614,13.1835625 L15.0918385,11.0635854 L17.2118156,13.1835625 L18.1835625,12.2118156 L16.0635854,10.091724 L18.1835625,7.97174685 L17.2118156,7 Z",
        id: "Fill-2",
        fill: "#FFF"
      })));
      break;

    case 'sound':
      buttonIcon = React.createElement("svg", {
        width: "19",
        height: "19",
        viewBox: "0 0 19 19",
        xmlns: "http://www.w3.org/2000/svg"
      }, React.createElement("g", {
        id: "icons/minis/volumeOn",
        fill: "none",
        fillRule: "evenodd"
      }, React.createElement("path", {
        d: "M3.48026899,12.9630494 L1.78294894,12.9630494 C1.3505185,12.9630494 1,12.6117048 1,12.1781306 L1,7.76754476 C1,7.33409518 1.3505185,6.9827506 1.78294894,6.9827506 L3.48026899,6.9827506 C3.63825091,6.9827506 3.79237961,6.93490793 3.92264322,6.84545211 L8.77467683,3.13857463 C9.29423971,2.78199725 10,3.15489596 10,3.78619489 L10,16.1637406 C10,16.7950396 9.29423971,17.1679383 8.77467683,16.8113609 L3.92264322,13.1003479 C3.79237961,13.0108921 3.63825091,12.9630494 3.48026899,12.9630494 Z M14.9270376,3.03232286 C15.1729267,3.03232286 15.4040399,3.12815658 15.5777627,3.3022351 C17.3699891,5.09889099 18.3570052,7.48235058 18.3570052,10.0135053 C18.3570052,12.54466 17.3699891,14.9281196 15.5777627,16.7247755 C15.4041045,16.898854 15.1729914,16.9947524 14.9270052,16.9947524 C14.6820861,16.9947524 14.4515549,16.899436 14.2777674,16.7263598 C13.9192316,16.3684383 13.9185203,15.7852882 14.2762477,15.4264291 C15.7222893,13.9769926 16.5186727,12.0545954 16.5186727,10.0135053 C16.5186727,7.97241524 15.7222893,6.05001801 14.2762154,4.60058152 C13.9184879,4.24175473 13.9191992,3.65857229 14.277832,3.30065081 C14.4514256,3.1275746 14.6819567,3.03232286 14.9270376,3.03232286 Z M13.5730665,6.11570485 C14.6133991,7.15574642 15.1862998,8.54003279 15.1862998,10.0134924 C15.1862998,11.4892799 14.6113945,12.8741159 13.5675376,13.9128965 C13.3942351,14.0855848 13.1639626,14.1806425 12.9191727,14.1806425 C12.6727016,14.1806425 12.4412975,14.0844531 12.2677039,13.9097926 C12.0944984,13.7358111 11.9994406,13.5047303 11.9999903,13.2592291 C12.0005723,13.0136956 12.096794,12.7831644 12.2708079,12.6100882 C12.9654406,11.9185917 13.3479995,10.996467 13.3479995,10.0134924 C13.3479995,9.03119677 12.966346,8.1086194 12.2733298,7.4157649 C11.9150203,7.05745543 11.9149233,6.47436998 12.2731358,6.11589885 C12.4467617,5.94224065 12.6775838,5.84666559 12.923085,5.84666559 C13.1685538,5.84666559 13.3993436,5.94220831 13.5730665,6.11570485 Z",
        id: "Fill-2",
        fill: "#FFF"
      })));
      break;

    case 'maximize':
      buttonIcon = React.createElement("svg", {
        width: "19",
        height: "19",
        viewBox: "0 0 19 19",
        xmlns: "http://www.w3.org/2000/svg"
      }, React.createElement("g", {
        id: "icons/minis/screenfull",
        fill: "none",
        fillRule: "evenodd"
      }, React.createElement("path", {
        d: "M2.04162598,3 L2.04162598,16 L17.0147705,16 L17.0147705,3 L2.04162598,3 Z M1,2 L18,2 L18,17 L1,17 L1,2 Z M3,4 L16,4 L16,15 L3,15 L3,4 Z",
        id: "Rectangle-Copy",
        fill: "#FFF",
        fillRule: "nonzero"
      })));
      break;

    case 'minimize':
      buttonIcon = React.createElement("svg", {
        width: "19",
        height: "19",
        viewBox: "0 0 19 19",
        xmlns: "http://www.w3.org/2000/svg"
      }, React.createElement("g", {
        id: "icons/minis/screensmall",
        fill: "none",
        fillRule: "evenodd"
      }, React.createElement("path", {
        d: "M11,16 L17.0147705,16 L17.0147705,3 L2.04162598,3 L2.04162598,10 L11,10 L11,16 Z M1,2 L18,2 L18,17 L1,17 L1,2 Z",
        id: "Rectangle",
        fill: "#FFF",
        fillRule: "nonzero"
      })));
      break;

    case 'enter-vr':
      buttonIcon = React.createElement("svg", {
        width: "19",
        height: "19",
        viewBox: "0 0 17 10",
        xmlns: "http://www.w3.org/2000/svg"
      }, React.createElement("g", {
        id: "Page-1",
        fill: "none",
        fillRule: "evenodd"
      }, React.createElement("g", {
        id: "VRon",
        fill: "#FFF",
        fillRule: "nonzero"
      }, React.createElement("path", {
        d: "M15.7856977,0.02395184 L15.8915734,0.02395184 C16.5037405,0.02395184 17,0.520211324 17,1.13237842 L17,1.54663675 L17,8.8915038 C17,9.5034193 16.4560011,10 15.7856977,10 L12.0095825,10 C9.98324439,7.1593807 8.80676009,5.741338 8.48012959,5.74587199 C8.16206045,5.75028714 7.01003321,7.1683298 5.02404785,10 L1.21426911,10 C0.543965735,10 3.32031236e-05,9.5034193 3.32031236e-05,8.8915038 L3.32031236e-05,1.54663675 L3.32031236e-05,1.13237842 L3.32031236e-05,1.13237842 C3.32031236e-05,0.520211324 0.496292687,0.02395184 1.10845978,0.02395184 L1.21426911,0.02395184 L15.7856977,0.02395184 Z M4.5,6 C5.32842712,6 6,5.32842712 6,4.5 C6,3.67157288 5.32842712,3 4.5,3 C3.67157288,3 3,3.67157288 3,4.5 C3,5.32842712 3.67157288,6 4.5,6 Z M12.5,6 C13.3284271,6 14,5.32842712 14,4.5 C14,3.67157288 13.3284271,3 12.5,3 C11.6715729,3 11,3.67157288 11,4.5 C11,5.32842712 11.6715729,6 12.5,6 Z",
        id: "Fill-1"
      }))));
      break;

    case 'exit-vr':
      buttonIcon = React.createElement("svg", {
        width: "19",
        height: "19",
        viewBox: "0 0 19 19",
        xmlns: "http://www.w3.org/2000/svg"
      }, React.createElement("g", {
        id: "icons/minis/VRon-Copy",
        fill: "none",
        fillRule: "evenodd"
      }, React.createElement("g", {
        id: "Group-7-Copy",
        transform: "translate(1 3)",
        fill: "#FFF"
      }, React.createElement("path", {
        d: "M15.7856977,3.02395184 L17,3.02395184 L17,4.13237842 L17,4.54663675 L17,11.8915038 C17,12.5034193 16.4560011,13 15.7856977,13 L12.0095825,13 C9.98324439,10.1593807 8.80676009,8.741338 8.48012959,8.74587199 C8.16206045,8.75028714 7.01003321,10.1683298 5.02404785,13 L1.21426911,13 C0.543965735,13 3.32031236e-05,12.5034193 3.32031236e-05,11.8915038 L3.32031236e-05,4.54663675 L3.32031236e-05,4.13237842 L3.32031236e-05,3.02395184 L1.21426911,3.02395184 L15.7856977,3.02395184 Z M4.5,9 C5.32842712,9 6,8.32842712 6,7.5 C6,6.67157288 5.32842712,6 4.5,6 C3.67157288,6 3,6.67157288 3,7.5 C3,8.32842712 3.67157288,9 4.5,9 Z M12.5,9 C13.3284271,9 14,8.32842712 14,7.5 C14,6.67157288 13.3284271,6 12.5,6 C11.6715729,6 11,6.67157288 11,7.5 C11,8.32842712 11.6715729,9 12.5,9 Z M2.5486669,0 L14.420089,0 C14.7977406,0 15.1613805,0.149260956 15.4374308,0.417695511 L16.9999668,2.00634766 L0,2.00634766 L1.58537972,0.395493117 C1.84682061,0.141306827 2.19106994,0 2.5486669,0 Z",
        id: "Fill-1"
      }))));
      break;

    default:
      buttonIcon = null;
      break;
  }

  return React.createElement(Tooltip_1["default"], {
    text: props.tooltip,
    autoShowTooltip: props.autoShowTooltip
  }, React.createElement("button", {
    className: AmplifyUI.actionButton,
    onClick: props.onClick
  }, buttonIcon));
};

exports["default"] = IconButton;

/***/ }),

/***/ "./lib/XR/Loading.js":
/*!***************************!*\
  !*** ./lib/XR/Loading.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var React = __webpack_require__(/*! react */ "react");

var AmplifyUI = __webpack_require__(/*! @aws-amplify/ui */ "@aws-amplify/ui");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var Loading = function Loading(props) {
  return React.createElement("div", {
    className: AmplifyUI.loadingOverlay,
    "data-test": data_test_attributes_1.sumerianScene.loading
  }, React.createElement("div", {
    className: AmplifyUI.loadingContainer
  }, React.createElement("div", {
    className: AmplifyUI.loadingLogo,
    "data-test": data_test_attributes_1.sumerianScene.loadingLogo
  }, React.createElement("svg", {
    viewBox: "0 0 800 481",
    xmlns: "http://www.w3.org/2000/svg"
  }, React.createElement("g", {
    id: "Page-1",
    fillRule: "evenodd"
  }, React.createElement("g", {
    id: "AWS_logo_RGB-(1)",
    transform: "translate(-16 -17)",
    fillRule: "nonzero"
  }, React.createElement("path", {
    d: "M241.371,190.172 C241.371,197.487 241.371,204.801 245.028,212.115 C245.028,219.43 248.685,226.744 252.343,234.058 C252.343,234.058 252.343,237.715 256,241.373 C256,245.03 252.343,248.688 252.343,248.688 L234.058,256.002 C230.401,256.002 230.401,259.659 226.743,259.659 C223.085,259.659 219.428,259.659 219.428,256.002 C219.428,252.345 212.113,248.687 208.457,245.031 C208.457,237.716 204.8,234.06 201.142,226.745 C182.856,248.688 153.599,263.317 124.342,263.317 C106.057,263.317 84.114,256.002 69.485,245.031 C54.856,230.402 51.2,212.116 51.2,193.831 C51.2,171.888 58.515,153.603 73.143,138.974 C91.428,124.345 113.371,117.031 138.972,117.031 C149.943,117.031 157.258,117.031 168.229,120.688 C179.2,120.688 186.515,124.345 197.486,128.003 L197.486,106.06 C197.486,91.431 193.829,76.803 186.515,62.174 C171.886,54.859 157.258,51.203 142.629,51.203 C131.658,51.203 124.344,51.203 113.372,54.86 C102.4,58.517 95.087,62.175 84.115,65.832 C80.458,65.832 76.801,69.489 73.143,69.489 L69.486,69.489 C65.829,69.489 62.171,65.832 62.171,62.174 L62.171,47.545 C62.171,43.888 62.171,40.23 65.828,36.574 C69.485,36.574 73.142,32.917 73.142,32.917 C84.114,29.26 95.085,25.603 109.714,21.946 C124.343,18.289 138.971,18.289 149.942,18.289 C175.542,14.632 201.142,21.946 219.428,36.574 C234.057,54.859 245.028,76.802 241.371,102.403 L241.371,190.175 L241.371,190.172 Z M131.657,230.4 C142.628,230.4 149.942,230.4 160.914,226.743 C171.886,223.086 179.199,215.772 186.514,208.457 C190.171,204.8 193.829,197.486 193.829,193.828 C197.486,182.857 197.486,175.543 197.486,168.228 L197.486,157.257 C190.171,157.257 182.857,153.6 171.886,153.6 C164.571,153.6 153.6,153.6 146.286,153.6 C135.315,149.943 120.686,153.6 109.714,160.915 C98.742,168.23 95.085,179.2 95.085,190.172 C95.085,201.143 98.742,212.115 106.057,219.429 C113.372,226.743 124.342,230.4 131.657,230.4 Z M347.428,259.657 C343.771,259.657 340.113,259.657 336.457,256 C332.801,252.343 332.8,248.685 332.8,245.029 L270.629,40.229 C270.629,36.572 266.972,32.914 266.972,29.258 C266.972,29.258 266.972,25.601 266.972,25.601 C266.972,25.601 270.629,21.944 270.629,25.601 L296.229,25.601 C299.886,25.601 303.544,25.601 307.2,29.258 C310.857,29.258 314.515,32.915 314.515,36.573 L358.4,212.116 L402.285,36.573 C402.285,32.916 405.942,29.259 405.942,25.602 C409.599,21.945 413.257,21.945 416.913,21.945 L438.856,21.945 C442.513,21.945 446.171,21.945 449.827,25.602 C453.483,29.259 453.484,32.917 453.484,36.573 L493.712,215.773 L541.255,36.573 C541.255,32.916 544.912,29.259 544.912,25.602 C548.569,21.945 552.226,21.945 555.883,21.945 L581.483,21.945 C581.483,21.945 585.14,21.945 585.14,21.945 C585.14,21.945 588.797,25.602 585.14,25.602 C585.14,25.602 585.14,29.259 585.14,29.259 C585.14,32.916 585.14,32.916 581.483,36.573 L515.655,241.373 C515.655,245.03 511.998,248.688 508.34,252.344 C504.682,256 501.025,256.001 497.369,256.001 L475.426,256.001 C471.769,256.001 468.111,256.001 464.455,252.344 C460.799,248.687 460.798,245.029 460.798,241.373 L427.884,73.145 L387.656,245.031 C387.656,248.688 383.999,252.346 383.999,256.002 C380.342,259.659 376.684,259.659 373.028,259.659 L347.428,259.659 L347.428,259.657 Z M687.543,266.971 C672.914,266.971 658.286,266.971 647.314,263.314 C636.342,259.657 625.371,255.999 618.057,252.343 C610.743,248.686 607.086,245.028 607.086,237.714 L607.086,223.085 C607.086,215.77 610.743,215.77 614.4,215.77 C614.4,215.77 618.057,215.77 618.057,215.77 L625.371,219.427 C636.342,223.084 643.656,226.742 654.628,230.398 C665.6,234.054 676.571,234.055 687.542,234.055 C702.171,234.055 713.142,230.398 727.771,226.74 C735.085,223.083 742.4,212.111 742.4,201.14 C742.4,193.825 738.743,186.511 735.086,182.855 C727.772,175.54 716.801,171.884 705.829,168.226 L665.6,157.255 C650.971,153.598 636.343,142.626 625.372,131.655 C618.058,120.683 610.743,106.055 610.743,91.427 C610.743,80.455 614.4,69.484 618.057,62.17 C621.714,54.856 629.028,47.541 636.342,40.227 C643.656,32.912 654.627,29.256 661.942,25.598 C672.913,21.941 683.885,21.941 694.856,21.941 C702.17,21.941 705.827,21.941 713.141,21.941 C720.455,21.941 724.112,21.941 731.426,25.598 C735.083,25.598 742.397,29.255 746.055,29.255 C749.713,29.255 753.369,32.912 757.026,32.912 C760.683,32.912 764.34,36.569 764.34,40.227 C767.997,36.57 767.997,40.227 767.997,43.884 L767.997,54.855 C767.997,62.17 764.34,62.17 760.683,62.17 C757.026,62.17 753.369,62.17 749.712,58.513 C735.083,51.198 716.798,47.542 698.512,47.542 C687.541,47.542 672.912,51.199 661.94,54.857 C658.283,65.829 654.626,73.142 654.626,84.114 C654.626,91.428 658.283,98.743 661.94,102.399 C669.254,109.713 680.225,113.371 691.197,117.028 L727.769,128 C742.398,131.657 757.026,142.629 767.997,153.6 C775.311,164.571 782.626,179.2 778.968,193.828 C778.968,204.799 775.311,215.771 771.654,223.085 C767.997,234.056 760.683,241.37 753.369,245.028 C746.055,252.343 735.084,255.999 724.112,259.656 C713.14,263.313 702.169,266.971 687.54,266.971 L687.543,266.971 Z",
    id: "Shape"
  }), React.createElement("path", {
    d: "M738.743,398.628 C650.972,464.457 522.972,497.371 416.914,497.371 C270.628,497.371 128,446.171 21.943,347.428 C10.971,336.457 18.286,329.142 29.257,332.8 C149.943,402.286 285.257,438.857 424.228,438.857 C526.628,438.857 629.028,416.914 727.771,376.686 C742.4,369.371 753.371,387.657 738.742,398.629 L738.743,398.628 Z",
    id: "Shape"
  }), React.createElement("path", {
    d: "M775.314,354.743 C764.343,340.115 702.171,347.428 672.914,351.086 C665.6,351.086 661.943,343.771 669.257,340.115 C720.457,303.543 800.914,314.515 811.886,325.487 C822.858,336.459 808.229,420.572 760.686,460.802 C753.372,468.117 746.057,464.459 749.715,457.145 C764.344,427.888 786.287,369.373 775.315,354.745 L775.314,354.743 Z",
    id: "Shape"
  }))))), React.createElement("div", {
    className: AmplifyUI.loadingSceneName,
    "data-test": data_test_attributes_1.sumerianScene.loadingSceneName
  }, props.sceneName), props.sceneError ? React.createElement("div", {
    className: AmplifyUI.sceneErrorText,
    "data-test": data_test_attributes_1.sumerianScene.errorText
  }, props.sceneError.displayText) : React.createElement("div", {
    className: AmplifyUI.loadingBar,
    "data-test": data_test_attributes_1.sumerianScene.loadingBar
  }, React.createElement("div", {
    className: AmplifyUI.loadingBarFill,
    style: {
      width: props.percentage + "%"
    }
  }))));
};

exports["default"] = Loading;

/***/ }),

/***/ "./lib/XR/SumerianScene.js":
/*!*********************************!*\
  !*** ./lib/XR/SumerianScene.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __extends = this && this.__extends || function () {
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

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
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

var __generator = this && this.__generator || function (thisArg, body) {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var React = __webpack_require__(/*! react */ "react");

var xr_1 = __webpack_require__(/*! @aws-amplify/xr */ "@aws-amplify/xr");

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var IconButton_1 = __webpack_require__(/*! ./IconButton */ "./lib/XR/IconButton.js");

var Loading_1 = __webpack_require__(/*! ./Loading */ "./lib/XR/Loading.js");

var AmplifyUI = __webpack_require__(/*! @aws-amplify/ui */ "@aws-amplify/ui");

var data_test_attributes_1 = __webpack_require__(/*! ../Amplify-UI/data-test-attributes */ "./lib/Amplify-UI/data-test-attributes.js");

var SCENE_CONTAINER_DOM_ID = 'scene-container-dom-id';
var SCENE_DOM_ID = 'scene-dom-id';
var logger = new core_1.ConsoleLogger('SumerianScene');

var SumerianScene =
/** @class */
function (_super) {
  __extends(SumerianScene, _super);

  function SumerianScene(props) {
    var _this = _super.call(this, props) || this;

    _this.state = {
      showEnableAudio: false,
      muted: false,
      loading: true,
      percentage: 0,
      isFullscreen: false,
      sceneError: null,
      isVRPresentationActive: false
    };
    return _this;
  }

  SumerianScene.prototype.setStateAsync = function (state) {
    var _this = this;

    return new Promise(function (resolve) {
      _this.setState(state, resolve);
    });
  };

  SumerianScene.prototype.componentDidMount = function () {
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('mozfullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('MSFullscreenChange', this.onFullscreenChange.bind(this));
    this.loadAndSetupScene(this.props.sceneName, SCENE_DOM_ID);
  };

  SumerianScene.prototype.componentWillUnmount = function () {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('mozfullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('MSFullscreenChange', this.onFullscreenChange.bind(this));
  };

  SumerianScene.prototype.loadAndSetupScene = function (sceneName, sceneDomId) {
    return __awaiter(this, void 0, void 0, function () {
      var sceneOptions, e_1, sceneError;

      var _this = this;

      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.setStateAsync({
              loading: true
            });
            sceneOptions = {
              progressCallback: function progressCallback(progress) {
                var percentage = progress * 100;

                _this.setState({
                  percentage: percentage
                });
              }
            };
            _a.label = 1;

          case 1:
            _a.trys.push([1, 3,, 4]);

            return [4
            /*yield*/
            , xr_1["default"].loadScene(sceneName, sceneDomId, sceneOptions)];

          case 2:
            _a.sent();

            return [3
            /*break*/
            , 4];

          case 3:
            e_1 = _a.sent();
            sceneError = {
              displayText: 'Failed to load scene',
              error: e_1
            };
            logger.error(sceneError.displayText, sceneError.error);
            this.setStateAsync({
              sceneError: sceneError
            });
            return [2
            /*return*/
            ];

          case 4:
            xr_1["default"].start(sceneName);
            this.setStateAsync({
              muted: xr_1["default"].isMuted(sceneName),
              isVRPresentationActive: xr_1["default"].isVRPresentationActive(sceneName),
              loading: false
            });
            xr_1["default"].onSceneEvent(sceneName, 'AudioEnabled', function () {
              return _this.setStateAsync({
                showEnableAudio: false
              });
            });
            xr_1["default"].onSceneEvent(sceneName, 'AudioDisabled', function () {
              return _this.setStateAsync({
                showEnableAudio: true
              });
            });
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  SumerianScene.prototype.setMuted = function (muted) {
    if (this.state.showEnableAudio) {
      xr_1["default"].enableAudio(this.props.sceneName);
      this.setState({
        showEnableAudio: false
      });
    }

    xr_1["default"].setMuted(this.props.sceneName, muted);
    this.setState({
      muted: muted
    });
  };

  SumerianScene.prototype.onFullscreenChange = function () {
    var doc = document;
    this.setState({
      isFullscreen: doc.fullscreenElement !== null
    });
  };

  SumerianScene.prototype.maximize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var sceneDomElement;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            sceneDomElement = document.getElementById(SCENE_CONTAINER_DOM_ID);
            return [4
            /*yield*/
            , sceneDomElement.requestFullscreen()];

          case 1:
            _a.sent();

            return [2
            /*return*/
            ];
        }
      });
    });
  };

  SumerianScene.prototype.minimize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var doc;
      return __generator(this, function (_a) {
        doc = document;

        if (doc.exitFullscreen) {
          doc.exitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          doc.mozCancelFullScreen();
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        }

        return [2
        /*return*/
        ];
      });
    });
  };

  SumerianScene.prototype.toggleVRPresentation = function () {
    try {
      if (this.state.isVRPresentationActive) {
        xr_1["default"].exitVR(this.props.sceneName);
      } else {
        xr_1["default"].enterVR(this.props.sceneName);
      }
    } catch (e) {
      logger.error('Unable to start/stop WebVR System: ' + e.message);
      return;
    }

    this.setState({
      isVRPresentationActive: !this.state.isVRPresentationActive
    });
  };

  SumerianScene.prototype.render = function () {
    var _this = this;

    var muteButton;
    var enterOrExitVRButton;
    var screenSizeButton;

    if (xr_1["default"].isSceneLoaded(this.props.sceneName)) {
      if (this.state.showEnableAudio) {
        muteButton = React.createElement(IconButton_1["default"], {
          variant: "sound-mute",
          tooltip: "The scene is muted. Click to unmute.",
          onClick: function onClick() {
            return _this.setMuted(false);
          },
          autoShowTooltip: true
        });
      } else if (xr_1["default"].isMuted(this.props.sceneName)) {
        muteButton = React.createElement(IconButton_1["default"], {
          variant: "sound-mute",
          tooltip: "Unmute",
          onClick: function onClick() {
            return _this.setMuted(false);
          }
        });
      } else {
        muteButton = React.createElement(IconButton_1["default"], {
          variant: "sound",
          tooltip: "Mute",
          onClick: function onClick() {
            return _this.setMuted(true);
          }
        });
      }

      if (xr_1["default"].isVRCapable(this.props.sceneName)) {
        if (this.state.isVRPresentationActive) {
          logger.info('VR Presentation Active');
          enterOrExitVRButton = React.createElement(IconButton_1["default"], {
            variant: "exit-vr",
            tooltip: "Exit VR",
            onClick: function onClick() {
              return _this.toggleVRPresentation();
            }
          });
        } else {
          logger.info('VR Presentation Inactive');
          enterOrExitVRButton = React.createElement(IconButton_1["default"], {
            variant: "enter-vr",
            tooltip: "Enter VR",
            onClick: function onClick() {
              return _this.toggleVRPresentation();
            }
          });
        }
      }

      if (this.state.isFullscreen) {
        screenSizeButton = React.createElement(IconButton_1["default"], {
          variant: "minimize",
          tooltip: "Exit Fullscreen",
          onClick: function onClick() {
            return _this.minimize();
          }
        });
      } else {
        screenSizeButton = React.createElement(IconButton_1["default"], {
          variant: "maximize",
          tooltip: "Fullscreen",
          onClick: function onClick() {
            return _this.maximize();
          }
        });
      }
    }

    return React.createElement("div", {
      id: SCENE_CONTAINER_DOM_ID,
      className: AmplifyUI.sumerianSceneContainer,
      "data-test": data_test_attributes_1.sumerianScene.container
    }, React.createElement("div", {
      id: SCENE_DOM_ID,
      className: AmplifyUI.sumerianScene,
      "data-test": data_test_attributes_1.sumerianScene.sumerianScene
    }, this.state.loading && React.createElement(Loading_1["default"], {
      sceneName: this.props.sceneName,
      percentage: this.state.percentage,
      sceneError: this.state.sceneError
    })), React.createElement("div", {
      className: AmplifyUI.sceneBar,
      "data-test": data_test_attributes_1.sumerianScene.bar
    }, React.createElement("span", {
      className: AmplifyUI.sceneActions,
      "data-test": data_test_attributes_1.sumerianScene.actions
    }, muteButton, enterOrExitVRButton, screenSizeButton)));
  };

  return SumerianScene;
}(React.Component);

exports["default"] = SumerianScene;

/***/ }),

/***/ "./lib/XR/Tooltip.js":
/*!***************************!*\
  !*** ./lib/XR/Tooltip.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var React = __webpack_require__(/*! react */ "react");

var AmplifyUI = __webpack_require__(/*! @aws-amplify/ui */ "@aws-amplify/ui");

var Tooltip = function Tooltip(props) {
  var classes = "" + AmplifyUI.tooltip;

  if (props.autoShowTooltip) {
    classes = AmplifyUI.tooltip + " " + AmplifyUI.autoShowTooltip;
  }

  return React.createElement("div", {
    className: classes,
    "data-text": props.text
  }, props.children);
};

exports["default"] = Tooltip;

/***/ }),

/***/ "./lib/XR/index.js":
/*!*************************!*\
  !*** ./lib/XR/index.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var SumerianScene_1 = __webpack_require__(/*! ./SumerianScene */ "./lib/XR/SumerianScene.js");

exports.SumerianScene = SumerianScene_1["default"];

/***/ }),

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function __export(m) {
  for (var p in m) {
    if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }
}

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

var core_1 = __webpack_require__(/*! @aws-amplify/core */ "@aws-amplify/core");

var AmplifyI18n_1 = __webpack_require__(/*! ./AmplifyI18n */ "./lib/AmplifyI18n.js");

__export(__webpack_require__(/*! ./AmplifyUI */ "./lib/AmplifyUI.js"));

__export(__webpack_require__(/*! ./Auth */ "./lib/Auth/index.js"));

__export(__webpack_require__(/*! ./Analytics */ "./lib/Analytics/index.js"));

__export(__webpack_require__(/*! ./Storage */ "./lib/Storage/index.js"));

__export(__webpack_require__(/*! ./Widget */ "./lib/Widget/index.js"));

__export(__webpack_require__(/*! ./API */ "./lib/API/index.js"));

__export(__webpack_require__(/*! ./Interactions */ "./lib/Interactions/index.js"));

__export(__webpack_require__(/*! ./XR */ "./lib/XR/index.js"));

var AmplifyTheme_1 = __webpack_require__(/*! ./AmplifyTheme */ "./lib/AmplifyTheme.js");

exports.AmplifyTheme = AmplifyTheme_1["default"];

var AmplifyMessageMap_1 = __webpack_require__(/*! ./AmplifyMessageMap */ "./lib/AmplifyMessageMap.js");

exports.AmplifyMessageMapEntries = AmplifyMessageMap_1.MapEntries;

var AmplifyUI_1 = __webpack_require__(/*! ./AmplifyUI */ "./lib/AmplifyUI.js");

exports.transparent1X1 = AmplifyUI_1.transparent1X1;
exports.white1X1 = AmplifyUI_1.white1X1;
core_1.I18n.putVocabularies(AmplifyI18n_1["default"]);

/***/ }),

/***/ "@aws-amplify/analytics":
/*!*****************************************!*\
  !*** external "@aws-amplify/analytics" ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__aws_amplify_analytics__;

/***/ }),

/***/ "@aws-amplify/api":
/*!***********************************!*\
  !*** external "@aws-amplify/api" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__aws_amplify_api__;

/***/ }),

/***/ "@aws-amplify/auth":
/*!************************************!*\
  !*** external "@aws-amplify/auth" ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__aws_amplify_auth__;

/***/ }),

/***/ "@aws-amplify/core":
/*!************************************!*\
  !*** external "@aws-amplify/core" ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__aws_amplify_core__;

/***/ }),

/***/ "@aws-amplify/interactions":
/*!********************************************!*\
  !*** external "@aws-amplify/interactions" ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__aws_amplify_interactions__;

/***/ }),

/***/ "@aws-amplify/storage":
/*!***************************************!*\
  !*** external "@aws-amplify/storage" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__aws_amplify_storage__;

/***/ }),

/***/ "@aws-amplify/ui":
/*!**********************************!*\
  !*** external "@aws-amplify/ui" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__aws_amplify_ui__;

/***/ }),

/***/ "@aws-amplify/ui/dist/style.css":
/*!*************************************************!*\
  !*** external "@aws-amplify/ui/dist/style.css" ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__aws_amplify_ui_dist_style_css__;

/***/ }),

/***/ "@aws-amplify/xr":
/*!**********************************!*\
  !*** external "@aws-amplify/xr" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__aws_amplify_xr__;

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_react__;

/***/ })

/******/ });
});
//# sourceMappingURL=aws-amplify-react.js.map