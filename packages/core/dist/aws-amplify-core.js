(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("aws-sdk/global"));
	else if(typeof define === 'function' && define.amd)
		define("aws_amplify_core", ["aws-sdk/global"], factory);
	else if(typeof exports === 'object')
		exports["aws_amplify_core"] = factory(require("aws-sdk/global"));
	else
		root["aws_amplify_core"] = factory(root["aws-sdk/global"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_aws_sdk_global__) {
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

/***/ "../../node_modules/punycode/punycode.js":
/*!******************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/punycode/punycode.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports =  true && exports &&
		!exports.nodeType && exports;
	var freeModule =  true && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		true
	) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
			return punycode;
		}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}

}(this));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/module.js */ "../../node_modules/webpack/buildin/module.js")(module), __webpack_require__(/*! ./../webpack/buildin/global.js */ "../../node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "../../node_modules/querystring-es3/decode.js":
/*!***********************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/querystring-es3/decode.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};


/***/ }),

/***/ "../../node_modules/querystring-es3/encode.js":
/*!***********************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/querystring-es3/encode.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};


/***/ }),

/***/ "../../node_modules/querystring-es3/index.js":
/*!**********************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/querystring-es3/index.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.decode = exports.parse = __webpack_require__(/*! ./decode */ "../../node_modules/querystring-es3/decode.js");
exports.encode = exports.stringify = __webpack_require__(/*! ./encode */ "../../node_modules/querystring-es3/encode.js");


/***/ }),

/***/ "../../node_modules/url/url.js":
/*!********************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/url/url.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var punycode = __webpack_require__(/*! punycode */ "../../node_modules/punycode/punycode.js");
var util = __webpack_require__(/*! ./util */ "../../node_modules/url/util.js");

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = __webpack_require__(/*! querystring */ "../../node_modules/querystring-es3/index.js");

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};


/***/ }),

/***/ "../../node_modules/url/util.js":
/*!*********************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/url/util.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};


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

/***/ "../../node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "../../node_modules/zen-observable/index.js":
/*!*********************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/zen-observable/index.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./lib/Observable.js */ "../../node_modules/zen-observable/lib/Observable.js").Observable;


/***/ }),

/***/ "../../node_modules/zen-observable/lib/Observable.js":
/*!******************************************************************************!*\
  !*** /Users/hilsny/amplify-js/node_modules/zen-observable/lib/Observable.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Observable = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// === Symbol Support ===
var hasSymbols = function () {
  return typeof Symbol === 'function';
};

var hasSymbol = function (name) {
  return hasSymbols() && Boolean(Symbol[name]);
};

var getSymbol = function (name) {
  return hasSymbol(name) ? Symbol[name] : '@@' + name;
};

if (hasSymbols() && !hasSymbol('observable')) {
  Symbol.observable = Symbol('observable');
}

var SymbolIterator = getSymbol('iterator');
var SymbolObservable = getSymbol('observable');
var SymbolSpecies = getSymbol('species'); // === Abstract Operations ===

function getMethod(obj, key) {
  var value = obj[key];
  if (value == null) return undefined;
  if (typeof value !== 'function') throw new TypeError(value + ' is not a function');
  return value;
}

function getSpecies(obj) {
  var ctor = obj.constructor;

  if (ctor !== undefined) {
    ctor = ctor[SymbolSpecies];

    if (ctor === null) {
      ctor = undefined;
    }
  }

  return ctor !== undefined ? ctor : Observable;
}

function isObservable(x) {
  return x instanceof Observable; // SPEC: Brand check
}

function hostReportError(e) {
  if (hostReportError.log) {
    hostReportError.log(e);
  } else {
    setTimeout(function () {
      throw e;
    });
  }
}

function enqueue(fn) {
  Promise.resolve().then(function () {
    try {
      fn();
    } catch (e) {
      hostReportError(e);
    }
  });
}

function cleanupSubscription(subscription) {
  var cleanup = subscription._cleanup;
  if (cleanup === undefined) return;
  subscription._cleanup = undefined;

  if (!cleanup) {
    return;
  }

  try {
    if (typeof cleanup === 'function') {
      cleanup();
    } else {
      var unsubscribe = getMethod(cleanup, 'unsubscribe');

      if (unsubscribe) {
        unsubscribe.call(cleanup);
      }
    }
  } catch (e) {
    hostReportError(e);
  }
}

function closeSubscription(subscription) {
  subscription._observer = undefined;
  subscription._queue = undefined;
  subscription._state = 'closed';
}

function flushSubscription(subscription) {
  var queue = subscription._queue;

  if (!queue) {
    return;
  }

  subscription._queue = undefined;
  subscription._state = 'ready';

  for (var i = 0; i < queue.length; ++i) {
    notifySubscription(subscription, queue[i].type, queue[i].value);
    if (subscription._state === 'closed') break;
  }
}

function notifySubscription(subscription, type, value) {
  subscription._state = 'running';
  var observer = subscription._observer;

  try {
    var m = getMethod(observer, type);

    switch (type) {
      case 'next':
        if (m) m.call(observer, value);
        break;

      case 'error':
        closeSubscription(subscription);
        if (m) m.call(observer, value);else throw value;
        break;

      case 'complete':
        closeSubscription(subscription);
        if (m) m.call(observer);
        break;
    }
  } catch (e) {
    hostReportError(e);
  }

  if (subscription._state === 'closed') cleanupSubscription(subscription);else if (subscription._state === 'running') subscription._state = 'ready';
}

function onNotify(subscription, type, value) {
  if (subscription._state === 'closed') return;

  if (subscription._state === 'buffering') {
    subscription._queue.push({
      type: type,
      value: value
    });

    return;
  }

  if (subscription._state !== 'ready') {
    subscription._state = 'buffering';
    subscription._queue = [{
      type: type,
      value: value
    }];
    enqueue(function () {
      return flushSubscription(subscription);
    });
    return;
  }

  notifySubscription(subscription, type, value);
}

var Subscription =
/*#__PURE__*/
function () {
  function Subscription(observer, subscriber) {
    _classCallCheck(this, Subscription);

    // ASSERT: observer is an object
    // ASSERT: subscriber is callable
    this._cleanup = undefined;
    this._observer = observer;
    this._queue = undefined;
    this._state = 'initializing';
    var subscriptionObserver = new SubscriptionObserver(this);

    try {
      this._cleanup = subscriber.call(undefined, subscriptionObserver);
    } catch (e) {
      subscriptionObserver.error(e);
    }

    if (this._state === 'initializing') this._state = 'ready';
  }

  _createClass(Subscription, [{
    key: "unsubscribe",
    value: function unsubscribe() {
      if (this._state !== 'closed') {
        closeSubscription(this);
        cleanupSubscription(this);
      }
    }
  }, {
    key: "closed",
    get: function () {
      return this._state === 'closed';
    }
  }]);

  return Subscription;
}();

var SubscriptionObserver =
/*#__PURE__*/
function () {
  function SubscriptionObserver(subscription) {
    _classCallCheck(this, SubscriptionObserver);

    this._subscription = subscription;
  }

  _createClass(SubscriptionObserver, [{
    key: "next",
    value: function next(value) {
      onNotify(this._subscription, 'next', value);
    }
  }, {
    key: "error",
    value: function error(value) {
      onNotify(this._subscription, 'error', value);
    }
  }, {
    key: "complete",
    value: function complete() {
      onNotify(this._subscription, 'complete');
    }
  }, {
    key: "closed",
    get: function () {
      return this._subscription._state === 'closed';
    }
  }]);

  return SubscriptionObserver;
}();

var Observable =
/*#__PURE__*/
function () {
  function Observable(subscriber) {
    _classCallCheck(this, Observable);

    if (!(this instanceof Observable)) throw new TypeError('Observable cannot be called as a function');
    if (typeof subscriber !== 'function') throw new TypeError('Observable initializer must be a function');
    this._subscriber = subscriber;
  }

  _createClass(Observable, [{
    key: "subscribe",
    value: function subscribe(observer) {
      if (typeof observer !== 'object' || observer === null) {
        observer = {
          next: observer,
          error: arguments[1],
          complete: arguments[2]
        };
      }

      return new Subscription(observer, this._subscriber);
    }
  }, {
    key: "forEach",
    value: function forEach(fn) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (typeof fn !== 'function') {
          reject(new TypeError(fn + ' is not a function'));
          return;
        }

        function done() {
          subscription.unsubscribe();
          resolve();
        }

        var subscription = _this.subscribe({
          next: function (value) {
            try {
              fn(value, done);
            } catch (e) {
              reject(e);
              subscription.unsubscribe();
            }
          },
          error: reject,
          complete: resolve
        });
      });
    }
  }, {
    key: "map",
    value: function map(fn) {
      var _this2 = this;

      if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
      var C = getSpecies(this);
      return new C(function (observer) {
        return _this2.subscribe({
          next: function (value) {
            try {
              value = fn(value);
            } catch (e) {
              return observer.error(e);
            }

            observer.next(value);
          },
          error: function (e) {
            observer.error(e);
          },
          complete: function () {
            observer.complete();
          }
        });
      });
    }
  }, {
    key: "filter",
    value: function filter(fn) {
      var _this3 = this;

      if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
      var C = getSpecies(this);
      return new C(function (observer) {
        return _this3.subscribe({
          next: function (value) {
            try {
              if (!fn(value)) return;
            } catch (e) {
              return observer.error(e);
            }

            observer.next(value);
          },
          error: function (e) {
            observer.error(e);
          },
          complete: function () {
            observer.complete();
          }
        });
      });
    }
  }, {
    key: "reduce",
    value: function reduce(fn) {
      var _this4 = this;

      if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
      var C = getSpecies(this);
      var hasSeed = arguments.length > 1;
      var hasValue = false;
      var seed = arguments[1];
      var acc = seed;
      return new C(function (observer) {
        return _this4.subscribe({
          next: function (value) {
            var first = !hasValue;
            hasValue = true;

            if (!first || hasSeed) {
              try {
                acc = fn(acc, value);
              } catch (e) {
                return observer.error(e);
              }
            } else {
              acc = value;
            }
          },
          error: function (e) {
            observer.error(e);
          },
          complete: function () {
            if (!hasValue && !hasSeed) return observer.error(new TypeError('Cannot reduce an empty sequence'));
            observer.next(acc);
            observer.complete();
          }
        });
      });
    }
  }, {
    key: "concat",
    value: function concat() {
      var _this5 = this;

      for (var _len = arguments.length, sources = new Array(_len), _key = 0; _key < _len; _key++) {
        sources[_key] = arguments[_key];
      }

      var C = getSpecies(this);
      return new C(function (observer) {
        var subscription;
        var index = 0;

        function startNext(next) {
          subscription = next.subscribe({
            next: function (v) {
              observer.next(v);
            },
            error: function (e) {
              observer.error(e);
            },
            complete: function () {
              if (index === sources.length) {
                subscription = undefined;
                observer.complete();
              } else {
                startNext(C.from(sources[index++]));
              }
            }
          });
        }

        startNext(_this5);
        return function () {
          if (subscription) {
            subscription.unsubscribe();
            subscription = undefined;
          }
        };
      });
    }
  }, {
    key: "flatMap",
    value: function flatMap(fn) {
      var _this6 = this;

      if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
      var C = getSpecies(this);
      return new C(function (observer) {
        var subscriptions = [];

        var outer = _this6.subscribe({
          next: function (value) {
            if (fn) {
              try {
                value = fn(value);
              } catch (e) {
                return observer.error(e);
              }
            }

            var inner = C.from(value).subscribe({
              next: function (value) {
                observer.next(value);
              },
              error: function (e) {
                observer.error(e);
              },
              complete: function () {
                var i = subscriptions.indexOf(inner);
                if (i >= 0) subscriptions.splice(i, 1);
                completeIfDone();
              }
            });
            subscriptions.push(inner);
          },
          error: function (e) {
            observer.error(e);
          },
          complete: function () {
            completeIfDone();
          }
        });

        function completeIfDone() {
          if (outer.closed && subscriptions.length === 0) observer.complete();
        }

        return function () {
          subscriptions.forEach(function (s) {
            return s.unsubscribe();
          });
          outer.unsubscribe();
        };
      });
    }
  }, {
    key: SymbolObservable,
    value: function () {
      return this;
    }
  }], [{
    key: "from",
    value: function from(x) {
      var C = typeof this === 'function' ? this : Observable;
      if (x == null) throw new TypeError(x + ' is not an object');
      var method = getMethod(x, SymbolObservable);

      if (method) {
        var observable = method.call(x);
        if (Object(observable) !== observable) throw new TypeError(observable + ' is not an object');
        if (isObservable(observable) && observable.constructor === C) return observable;
        return new C(function (observer) {
          return observable.subscribe(observer);
        });
      }

      if (hasSymbol('iterator')) {
        method = getMethod(x, SymbolIterator);

        if (method) {
          return new C(function (observer) {
            enqueue(function () {
              if (observer.closed) return;
              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                for (var _iterator = method.call(x)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  var _item = _step.value;
                  observer.next(_item);
                  if (observer.closed) return;
                }
              } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                  }
                } finally {
                  if (_didIteratorError) {
                    throw _iteratorError;
                  }
                }
              }

              observer.complete();
            });
          });
        }
      }

      if (Array.isArray(x)) {
        return new C(function (observer) {
          enqueue(function () {
            if (observer.closed) return;

            for (var i = 0; i < x.length; ++i) {
              observer.next(x[i]);
              if (observer.closed) return;
            }

            observer.complete();
          });
        });
      }

      throw new TypeError(x + ' is not observable');
    }
  }, {
    key: "of",
    value: function of() {
      for (var _len2 = arguments.length, items = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        items[_key2] = arguments[_key2];
      }

      var C = typeof this === 'function' ? this : Observable;
      return new C(function (observer) {
        enqueue(function () {
          if (observer.closed) return;

          for (var i = 0; i < items.length; ++i) {
            observer.next(items[i]);
            if (observer.closed) return;
          }

          observer.complete();
        });
      });
    }
  }, {
    key: SymbolSpecies,
    get: function () {
      return this;
    }
  }]);

  return Observable;
}();

exports.Observable = Observable;

if (hasSymbols()) {
  Object.defineProperty(Observable, Symbol('extensions'), {
    value: {
      symbol: SymbolObservable,
      hostReportError: hostReportError
    },
    configurable: true
  });
}

/***/ }),

/***/ "./lib-esm/Amplify.js":
/*!****************************!*\
  !*** ./lib-esm/Amplify.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Logger */ "./lib-esm/Logger/index.js");

var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"]('Amplify');

var Amplify =
/** @class */
function () {
  function Amplify() {}

  Amplify.register = function (comp) {
    logger.debug('component registered in amplify', comp);

    this._components.push(comp);

    if (typeof comp.getModuleName === 'function') {
      Amplify[comp.getModuleName()] = comp;
    } else {
      logger.debug('no getModuleName method for component', comp);
    }
  };

  Amplify.configure = function (config) {
    var _this = this;

    if (!config) return this._config;
    this._config = Object.assign(this._config, config);
    logger.debug('amplify config', this._config);

    this._components.map(function (comp) {
      comp.configure(_this._config);
    });

    return this._config;
  };

  Amplify.addPluggable = function (pluggable) {
    if (pluggable && pluggable['getCategory'] && typeof pluggable['getCategory'] === 'function') {
      this._components.map(function (comp) {
        if (comp['addPluggable'] && typeof comp['addPluggable'] === 'function') {
          comp.addPluggable(pluggable);
        }
      });
    }
  };

  Amplify._components = [];
  Amplify._config = {}; // for backward compatibility to avoid breaking change
  // if someone is using like Amplify.Auth

  Amplify.Auth = null;
  Amplify.Analytics = null;
  Amplify.API = null;
  Amplify.Storage = null;
  Amplify.I18n = null;
  Amplify.Cache = null;
  Amplify.PubSub = null;
  Amplify.Interactions = null;
  Amplify.Pushnotification = null;
  Amplify.UI = null;
  Amplify.XR = null;
  Amplify.Predictions = null;
  Amplify.Logger = _Logger__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"];
  Amplify.ServiceWorker = null;
  return Amplify;
}();

/* harmony default export */ __webpack_exports__["default"] = (Amplify);

/***/ }),

/***/ "./lib-esm/ClientDevice/browser.js":
/*!*****************************************!*\
  !*** ./lib-esm/ClientDevice/browser.js ***!
  \*****************************************/
/*! exports provided: clientInfo, dimension */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clientInfo", function() { return clientInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dimension", function() { return dimension; });
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Logger */ "./lib-esm/Logger/index.js");
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

var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"]('ClientDevice_Browser');
function clientInfo() {
  if (typeof window === 'undefined') {
    return {};
  }

  return browserClientInfo();
}

function browserClientInfo() {
  if (typeof window === 'undefined') {
    logger.warn('No window object available to get browser client info');
    return {};
  }

  var nav = window.navigator;

  if (!nav) {
    logger.warn('No navigator object available to get browser client info');
    return {};
  }

  var platform = nav.platform,
      product = nav.product,
      vendor = nav.vendor,
      userAgent = nav.userAgent,
      language = nav.language;
  var type = browserType(userAgent);
  var timezone = browserTimezone();
  return {
    platform: platform,
    make: product || vendor,
    model: type.type,
    version: type.version,
    appVersion: [type.type, type.version].join('/'),
    language: language,
    timezone: timezone
  };
}

function dimension() {
  if (typeof window === 'undefined') {
    logger.warn('No window object available to get browser client info');
    return {
      width: 320,
      height: 320
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

function browserTimezone() {
  var tzMatch = /\(([A-Za-z\s].*)\)/.exec(new Date().toString());
  return tzMatch ? tzMatch[1] || '' : '';
}

function browserType(userAgent) {
  var operaMatch = /.+(Opera[\s[A-Z]*|OPR[\sA-Z]*)\/([0-9\.]+).*/i.exec(userAgent);

  if (operaMatch) {
    return {
      type: operaMatch[1],
      version: operaMatch[2]
    };
  }

  var ieMatch = /.+(Trident|Edge)\/([0-9\.]+).*/i.exec(userAgent);

  if (ieMatch) {
    return {
      type: ieMatch[1],
      version: ieMatch[2]
    };
  }

  var cfMatch = /.+(Chrome|Firefox|FxiOS)\/([0-9\.]+).*/i.exec(userAgent);

  if (cfMatch) {
    return {
      type: cfMatch[1],
      version: cfMatch[2]
    };
  }

  var sMatch = /.+(Safari)\/([0-9\.]+).*/i.exec(userAgent);

  if (sMatch) {
    return {
      type: sMatch[1],
      version: sMatch[2]
    };
  }

  var awkMatch = /.+(AppleWebKit)\/([0-9\.]+).*/i.exec(userAgent);

  if (awkMatch) {
    return {
      type: awkMatch[1],
      version: awkMatch[2]
    };
  }

  var anyMatch = /.*([A-Z]+)\/([0-9\.]+).*/i.exec(userAgent);

  if (anyMatch) {
    return {
      type: anyMatch[1],
      version: anyMatch[2]
    };
  }

  return {
    type: '',
    version: ''
  };
}

/***/ }),

/***/ "./lib-esm/ClientDevice/index.js":
/*!***************************************!*\
  !*** ./lib-esm/ClientDevice/index.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./browser */ "./lib-esm/ClientDevice/browser.js");
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


var ClientDevice =
/** @class */
function () {
  function ClientDevice() {}

  ClientDevice.clientInfo = function () {
    return _browser__WEBPACK_IMPORTED_MODULE_0__["clientInfo"]();
  };

  ClientDevice.dimension = function () {
    return _browser__WEBPACK_IMPORTED_MODULE_0__["dimension"]();
  };

  return ClientDevice;
}();

/* harmony default export */ __webpack_exports__["default"] = (ClientDevice);

/***/ }),

/***/ "./lib-esm/Credentials.js":
/*!********************************!*\
  !*** ./lib-esm/Credentials.js ***!
  \********************************/
/*! exports provided: Credentials, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Credentials", function() { return Credentials; });
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Logger */ "./lib-esm/Logger/index.js");
/* harmony import */ var _StorageHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./StorageHelper */ "./lib-esm/StorageHelper/index.js");
/* harmony import */ var _Facet__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Facet */ "./lib-esm/Facet.js");
/* harmony import */ var _JS__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./JS */ "./lib-esm/JS.js");
/* harmony import */ var _OAuthHelper__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./OAuthHelper */ "./lib-esm/OAuthHelper/index.js");
/* harmony import */ var _Amplify__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Amplify */ "./lib-esm/Amplify.js");
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







var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"]('Credentials');

var Credentials =
/** @class */
function () {
  function Credentials(config) {
    this._gettingCredPromise = null;
    this._refreshHandlers = {};
    this.configure(config);
    this._refreshHandlers['google'] = _OAuthHelper__WEBPACK_IMPORTED_MODULE_4__["GoogleOAuth"].refreshGoogleToken;
    this._refreshHandlers['facebook'] = _OAuthHelper__WEBPACK_IMPORTED_MODULE_4__["FacebookOAuth"].refreshFacebookToken;
  }

  Credentials.prototype.getCredSource = function () {
    return this._credentials_source;
  };

  Credentials.prototype.configure = function (config) {
    if (!config) return this._config || {};
    this._config = Object.assign({}, this._config, config);
    var refreshHandlers = this._config.refreshHandlers; // If the developer has provided an object of refresh handlers,
    // then we can merge the provided handlers with the current handlers.

    if (refreshHandlers) {
      this._refreshHandlers = __assign(__assign({}, this._refreshHandlers), refreshHandlers);
    }

    this._storage = this._config.storage;

    if (!this._storage) {
      this._storage = new _StorageHelper__WEBPACK_IMPORTED_MODULE_1__["default"]().getStorage();
    }

    this._storageSync = Promise.resolve();

    if (typeof this._storage['sync'] === 'function') {
      this._storageSync = this._storage['sync']();
    }

    return this._config;
  };

  Credentials.prototype.get = function () {
    logger.debug('getting credentials');
    return this._pickupCredentials();
  };

  Credentials.prototype._pickupCredentials = function () {
    logger.debug('picking up credentials');

    if (!this._gettingCredPromise || !this._gettingCredPromise.isPending()) {
      logger.debug('getting new cred promise');

      if (_Facet__WEBPACK_IMPORTED_MODULE_2__["AWS"].config && _Facet__WEBPACK_IMPORTED_MODULE_2__["AWS"].config.credentials && _Facet__WEBPACK_IMPORTED_MODULE_2__["AWS"].config.credentials instanceof _Facet__WEBPACK_IMPORTED_MODULE_2__["AWS"].Credentials) {
        this._gettingCredPromise = _JS__WEBPACK_IMPORTED_MODULE_3__["default"].makeQuerablePromise(this._setCredentialsFromAWS());
      } else {
        this._gettingCredPromise = _JS__WEBPACK_IMPORTED_MODULE_3__["default"].makeQuerablePromise(this._keepAlive());
      }
    } else {
      logger.debug('getting old cred promise');
    }

    return this._gettingCredPromise;
  };

  Credentials.prototype._keepAlive = function () {
    logger.debug('checking if credentials exists and not expired');
    var cred = this._credentials;

    if (cred && !this._isExpired(cred)) {
      logger.debug('credentials not changed and not expired, directly return');
      return Promise.resolve(cred);
    }

    logger.debug('need to get a new credential or refresh the existing one');

    if (_Amplify__WEBPACK_IMPORTED_MODULE_5__["default"].Auth && typeof _Amplify__WEBPACK_IMPORTED_MODULE_5__["default"].Auth.currentUserCredentials === 'function') {
      return _Amplify__WEBPACK_IMPORTED_MODULE_5__["default"].Auth.currentUserCredentials();
    } else {
      return Promise.reject('No Auth module registered in Amplify');
    }
  };

  Credentials.prototype.refreshFederatedToken = function (federatedInfo) {
    var _this = this;

    logger.debug('Getting federated credentials');
    var provider = federatedInfo.provider,
        user = federatedInfo.user;
    var token = federatedInfo.token,
        expires_at = federatedInfo.expires_at,
        identity_id = federatedInfo.identity_id;
    var that = this;
    logger.debug('checking if federated jwt token expired');

    if (expires_at > new Date().getTime()) {
      // if not expired
      logger.debug('token not expired');
      return this._setCredentialsFromFederation({
        provider: provider,
        token: token,
        user: user,
        identity_id: identity_id,
        expires_at: expires_at
      });
    } else {
      // if refresh handler exists
      if (that._refreshHandlers[provider] && typeof that._refreshHandlers[provider] === 'function') {
        logger.debug('getting refreshed jwt token from federation provider');
        return that._refreshHandlers[provider]().then(function (data) {
          logger.debug('refresh federated token sucessfully', data);
          token = data.token;
          identity_id = data.identity_id;
          expires_at = data.expires_at;
          return that._setCredentialsFromFederation({
            provider: provider,
            token: token,
            user: user,
            identity_id: identity_id,
            expires_at: expires_at
          });
        })["catch"](function (e) {
          logger.debug('refresh federated token failed', e);

          _this.clear();

          return Promise.reject('refreshing federation token failed: ' + e);
        });
      } else {
        logger.debug('no refresh handler for provider:', provider);
        this.clear();
        return Promise.reject('no refresh handler for provider');
      }
    }
  };

  Credentials.prototype._isExpired = function (credentials) {
    if (!credentials) {
      logger.debug('no credentials for expiration check');
      return true;
    }

    logger.debug('is this credentials expired?', credentials);
    var ts = new Date().getTime();
    var delta = 10 * 60 * 1000; // 10 minutes

    var expired = credentials.expired,
        expireTime = credentials.expireTime;

    if (!expired && expireTime > ts + delta) {
      return false;
    }

    return true;
  };

  Credentials.prototype._setCredentialsForGuest = function () {
    return __awaiter(this, void 0, void 0, function () {
      var attempted, _a, identityPoolId, region, mandatorySignIn, identityId, e_1, credentials, that;

      var _this = this;

      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            attempted = false;
            logger.debug('setting credentials for guest');
            _a = this._config, identityPoolId = _a.identityPoolId, region = _a.region, mandatorySignIn = _a.mandatorySignIn;

            if (mandatorySignIn) {
              return [2
              /*return*/
              , Promise.reject('cannot get guest credentials when mandatory signin enabled')];
            }

            if (!identityPoolId) {
              logger.debug('No Cognito Federated Identity pool provided');
              return [2
              /*return*/
              , Promise.reject('No Cognito Federated Identity pool provided')];
            }

            identityId = undefined;
            _b.label = 1;

          case 1:
            _b.trys.push([1, 3,, 4]);

            return [4
            /*yield*/
            , this._storageSync];

          case 2:
            _b.sent();

            identityId = this._storage.getItem('CognitoIdentityId-' + identityPoolId);
            return [3
            /*break*/
            , 4];

          case 3:
            e_1 = _b.sent();
            logger.debug('Failed to get the cached identityId', e_1);
            return [3
            /*break*/
            , 4];

          case 4:
            credentials = new _Facet__WEBPACK_IMPORTED_MODULE_2__["AWS"].CognitoIdentityCredentials({
              IdentityPoolId: identityPoolId,
              IdentityId: identityId ? identityId : undefined
            }, {
              region: region
            });
            that = this;
            return [2
            /*return*/
            , this._loadCredentials(credentials, 'guest', false, null).then(function (res) {
              return res;
            })["catch"](function (e) {
              return __awaiter(_this, void 0, void 0, function () {
                var newCredentials;
                return __generator(this, function (_a) {
                  // If identity id is deleted in the console, we make one attempt to recreate it
                  // and remove existing id from cache.
                  if (e.code === 'ResourceNotFoundException' && e.message === "Identity '" + identityId + "' not found." && !attempted) {
                    attempted = true;
                    logger.debug('Failed to load guest credentials');

                    this._storage.removeItem('CognitoIdentityId-' + identityPoolId);

                    credentials.clearCachedId();
                    newCredentials = new _Facet__WEBPACK_IMPORTED_MODULE_2__["AWS"].CognitoIdentityCredentials({
                      IdentityPoolId: identityPoolId,
                      IdentityId: undefined
                    }, {
                      region: region
                    });
                    return [2
                    /*return*/
                    , this._loadCredentials(newCredentials, 'guest', false, null)];
                  } else {
                    return [2
                    /*return*/
                    , e];
                  }

                  return [2
                  /*return*/
                  ];
                });
              });
            })];
        }
      });
    });
  };

  Credentials.prototype._setCredentialsFromAWS = function () {
    var credentials = _Facet__WEBPACK_IMPORTED_MODULE_2__["AWS"].config.credentials;
    logger.debug('setting credentials from aws');
    var that = this;

    if (credentials instanceof _Facet__WEBPACK_IMPORTED_MODULE_2__["AWS"].Credentials) {
      return Promise.resolve(credentials);
    } else {
      logger.debug('AWS.config.credentials is not an instance of AWS Credentials');
      return Promise.reject('AWS.config.credentials is not an instance of AWS Credentials');
    }
  };

  Credentials.prototype._setCredentialsFromFederation = function (params) {
    var provider = params.provider,
        token = params.token,
        identity_id = params.identity_id,
        user = params.user,
        expires_at = params.expires_at;
    var domains = {
      google: 'accounts.google.com',
      facebook: 'graph.facebook.com',
      amazon: 'www.amazon.com',
      developer: 'cognito-identity.amazonaws.com'
    }; // Use custom provider url instead of the predefined ones

    var domain = domains[provider] || provider;

    if (!domain) {
      return Promise.reject('You must specify a federated provider');
    }

    var logins = {};
    logins[domain] = token;
    var _a = this._config,
        identityPoolId = _a.identityPoolId,
        region = _a.region;

    if (!identityPoolId) {
      logger.debug('No Cognito Federated Identity pool provided');
      return Promise.reject('No Cognito Federated Identity pool provided');
    }

    var credentials = new _Facet__WEBPACK_IMPORTED_MODULE_2__["AWS"].CognitoIdentityCredentials({
      IdentityPoolId: identityPoolId,
      IdentityId: identity_id,
      Logins: logins
    }, {
      region: region
    });
    return this._loadCredentials(credentials, 'federated', true, params);
  };

  Credentials.prototype._setCredentialsFromSession = function (session) {
    logger.debug('set credentials from session');
    var idToken = session.getIdToken().getJwtToken();
    var _a = this._config,
        region = _a.region,
        userPoolId = _a.userPoolId,
        identityPoolId = _a.identityPoolId;

    if (!identityPoolId) {
      logger.debug('No Cognito Federated Identity pool provided');
      return Promise.reject('No Cognito Federated Identity pool provided');
    }

    var key = 'cognito-idp.' + region + '.amazonaws.com/' + userPoolId;
    var logins = {};
    logins[key] = idToken;
    var credentials = new _Facet__WEBPACK_IMPORTED_MODULE_2__["AWS"].CognitoIdentityCredentials({
      IdentityPoolId: identityPoolId,
      Logins: logins
    }, {
      region: region
    });
    return this._loadCredentials(credentials, 'userPool', true, null);
  };

  Credentials.prototype._loadCredentials = function (credentials, source, authenticated, info) {
    var _this = this;

    var that = this;
    var identityPoolId = this._config.identityPoolId;
    return new Promise(function (res, rej) {
      credentials.get(function (err) {
        return __awaiter(_this, void 0, void 0, function () {
          var user, provider, token, expires_at, identity_id, e_2;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                if (err) {
                  logger.debug('Failed to load credentials', credentials);
                  rej(err);
                  return [2
                  /*return*/
                  ];
                }

                logger.debug('Load credentials successfully', credentials);
                that._credentials = credentials;
                that._credentials.authenticated = authenticated;
                that._credentials_source = source;
                if (!(source === 'federated')) return [3
                /*break*/
                , 3];
                user = Object.assign({
                  id: this._credentials.identityId
                }, info.user);
                provider = info.provider, token = info.token, expires_at = info.expires_at, identity_id = info.identity_id;

                try {
                  this._storage.setItem('aws-amplify-federatedInfo', JSON.stringify({
                    provider: provider,
                    token: token,
                    user: user,
                    expires_at: expires_at,
                    identity_id: identity_id
                  }));
                } catch (e) {
                  logger.debug('Failed to put federated info into auth storage', e);
                }

                if (!(_Amplify__WEBPACK_IMPORTED_MODULE_5__["default"].Cache && typeof _Amplify__WEBPACK_IMPORTED_MODULE_5__["default"].Cache.setItem === 'function')) return [3
                /*break*/
                , 2];
                return [4
                /*yield*/
                , _Amplify__WEBPACK_IMPORTED_MODULE_5__["default"].Cache.setItem('federatedInfo', {
                  provider: provider,
                  token: token,
                  user: user,
                  expires_at: expires_at,
                  identity_id: identity_id
                }, {
                  priority: 1
                })];

              case 1:
                _a.sent();

                return [3
                /*break*/
                , 3];

              case 2:
                logger.debug('No Cache module registered in Amplify');
                _a.label = 3;

              case 3:
                if (!(source === 'guest')) return [3
                /*break*/
                , 7];
                _a.label = 4;

              case 4:
                _a.trys.push([4, 6,, 7]);

                return [4
                /*yield*/
                , this._storageSync];

              case 5:
                _a.sent();

                this._storage.setItem('CognitoIdentityId-' + identityPoolId, credentials.identityId);

                return [3
                /*break*/
                , 7];

              case 6:
                e_2 = _a.sent();
                logger.debug('Failed to cache identityId', e_2);
                return [3
                /*break*/
                , 7];

              case 7:
                res(that._credentials);
                return [2
                /*return*/
                ];
            }
          });
        });
      });
    });
  };

  Credentials.prototype.set = function (params, source) {
    if (source === 'session') {
      return this._setCredentialsFromSession(params);
    } else if (source === 'federation') {
      return this._setCredentialsFromFederation(params);
    } else if (source === 'guest') {
      return this._setCredentialsForGuest();
    } else {
      logger.debug('no source specified for setting credentials');
      return Promise.reject('invalid source');
    }
  };

  Credentials.prototype.clear = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, identityPoolId, region, credentials;

      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = this._config, identityPoolId = _a.identityPoolId, region = _a.region;

            if (identityPoolId) {
              credentials = new _Facet__WEBPACK_IMPORTED_MODULE_2__["AWS"].CognitoIdentityCredentials({
                IdentityPoolId: identityPoolId
              }, {
                region: region
              });
              credentials.clearCachedId();
            }

            this._credentials = null;
            this._credentials_source = null;

            this._storage.removeItem('aws-amplify-federatedInfo');

            if (!(_Amplify__WEBPACK_IMPORTED_MODULE_5__["default"].Cache && typeof _Amplify__WEBPACK_IMPORTED_MODULE_5__["default"].Cache.setItem === 'function')) return [3
            /*break*/
            , 2];
            return [4
            /*yield*/
            , _Amplify__WEBPACK_IMPORTED_MODULE_5__["default"].Cache.removeItem('federatedInfo')];

          case 1:
            _b.sent();

            return [3
            /*break*/
            , 3];

          case 2:
            logger.debug('No Cache module registered in Amplify');
            _b.label = 3;

          case 3:
            return [2
            /*return*/
            ];
        }
      });
    });
  };
  /**
   * Compact version of credentials
   * @param {Object} credentials
   * @return {Object} - Credentials
   */


  Credentials.prototype.shear = function (credentials) {
    return {
      accessKeyId: credentials.accessKeyId,
      sessionToken: credentials.sessionToken,
      secretAccessKey: credentials.secretAccessKey,
      identityId: credentials.identityId,
      authenticated: credentials.authenticated
    };
  };

  return Credentials;
}();


var instance = new Credentials(null);
/* harmony default export */ __webpack_exports__["default"] = (instance);

/***/ }),

/***/ "./lib-esm/Errors.js":
/*!***************************!*\
  !*** ./lib-esm/Errors.js ***!
  \***************************/
/*! exports provided: missingConfig, invalidParameter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "missingConfig", function() { return missingConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invalidParameter", function() { return invalidParameter; });
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
function missingConfig(name) {
  return new Error('Missing config value of ' + name);
}
function invalidParameter(name) {
  return new Error('Invalid parameter value of ' + name);
}

/***/ }),

/***/ "./lib-esm/Facet.js":
/*!**************************!*\
  !*** ./lib-esm/Facet.js ***!
  \**************************/
/*! exports provided: AWS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var aws_sdk_global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk/global */ "aws-sdk/global");
/* harmony import */ var aws_sdk_global__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk_global__WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "AWS", function() { return aws_sdk_global__WEBPACK_IMPORTED_MODULE_0__; });
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
// import * as S3 from 'aws-sdk/clients/s3';
 // import * as Pinpoint from 'aws-sdk/clients/pinpoint';
// import * as Kinesis from 'aws-sdk/clients/kinesis';
// import * as MobileAnalytics from 'aws-sdk/clients/mobileanalytics';
// export {AWS, S3, Pinpoint, MobileAnalytics, Kinesis };



/***/ }),

/***/ "./lib-esm/Hub.js":
/*!************************!*\
  !*** ./lib-esm/Hub.js ***!
  \************************/
/*! exports provided: HubClass, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HubClass", function() { return HubClass; });
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Logger */ "./lib-esm/Logger/index.js");
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

var __spreadArrays = undefined && undefined.__spreadArrays || function () {
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


var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"]('Hub');
var AMPLIFY_SYMBOL = typeof Symbol !== 'undefined' && typeof Symbol["for"] === 'function' ? Symbol["for"]('amplify_default') : '@@amplify_default';

function isLegacyCallback(callback) {
  return callback.onHubCapsule !== undefined;
}

var HubClass =
/** @class */
function () {
  function HubClass(name) {
    this.listeners = [];
    this.patterns = [];
    this.protectedChannels = ['core', 'auth', 'api', 'analytics', 'interactions', 'pubsub', 'storage', 'xr'];
    this.name = name;
  } // Note - Need to pass channel as a reference for removal to work and not anonymous function


  HubClass.prototype.remove = function (channel, listener) {
    if (channel instanceof RegExp) {
      var pattern_1 = this.patterns.find(function (_a) {
        var pattern = _a.pattern;
        return pattern.source === channel.source;
      });

      if (!pattern_1) {
        logger.warn("No listeners for " + channel);
        return;
      }

      this.patterns = __spreadArrays(this.patterns.filter(function (x) {
        return x !== pattern_1;
      }));
    } else {
      var holder = this.listeners[channel];

      if (!holder) {
        logger.warn("No listeners for " + channel);
        return;
      }

      this.listeners[channel] = __spreadArrays(holder.filter(function (_a) {
        var callback = _a.callback;
        return callback !== listener;
      }));
    }
  };

  HubClass.prototype.dispatch = function (channel, payload, source, ampSymbol) {
    if (source === void 0) {
      source = '';
    }

    if (this.protectedChannels.indexOf(channel) > -1) {
      var hasAccess = ampSymbol === AMPLIFY_SYMBOL;

      if (!hasAccess) {
        logger.warn("WARNING: " + channel + " is protected and dispatching on it can have unintended consequences");
      }
    }

    var capsule = {
      channel: channel,
      payload: __assign({}, payload),
      source: source,
      patternInfo: []
    };

    try {
      this._toListeners(capsule);
    } catch (e) {
      logger.error(e);
    }
  };

  HubClass.prototype.listen = function (channel, callback, listenerName) {
    if (listenerName === void 0) {
      listenerName = 'noname';
    }

    var cb; // Check for legacy onHubCapsule callback for backwards compatability

    if (isLegacyCallback(callback)) {
      logger.warn("WARNING onHubCapsule is Deprecated. Please pass in a callback.");
      cb = callback.onHubCapsule.bind(callback);
    } else if (typeof callback !== 'function') {
      throw new Error('No callback supplied to Hub');
    } else {
      cb = callback;
    }

    if (channel instanceof RegExp) {
      this.patterns.push({
        pattern: channel,
        callback: cb
      });
    } else {
      var holder = this.listeners[channel];

      if (!holder) {
        holder = [];
        this.listeners[channel] = holder;
      }

      holder.push({
        name: listenerName,
        callback: cb
      });
    }
  };

  HubClass.prototype._toListeners = function (capsule) {
    var channel = capsule.channel,
        payload = capsule.payload;
    var holder = this.listeners[channel];

    if (holder) {
      holder.forEach(function (listener) {
        logger.debug("Dispatching to " + channel + " with ", payload);

        try {
          listener.callback(capsule);
        } catch (e) {
          logger.error(e);
        }
      });
    }

    if (this.patterns.length > 0) {
      if (!payload.message) {
        logger.warn("Cannot perform pattern matching without a message key");
        return;
      }

      var payloadStr_1 = payload.message;
      this.patterns.forEach(function (pattern) {
        var match = payloadStr_1.match(pattern.pattern);

        if (match) {
          var groups = match.slice(1);

          var dispatchingCapsule = __assign(__assign({}, capsule), {
            patternInfo: groups
          });

          try {
            pattern.callback(dispatchingCapsule);
          } catch (e) {
            logger.error(e);
          }
        }
      });
    }
  };

  return HubClass;
}();


/*We export a __default__ instance of HubClass to use it as a
psuedo Singleton for the main messaging bus, however you can still create
your own instance of HubClass() for a separate "private bus" of events.*/

var Hub = new HubClass('__default__');
/* harmony default export */ __webpack_exports__["default"] = (Hub);

/***/ }),

/***/ "./lib-esm/I18n/I18n.js":
/*!******************************!*\
  !*** ./lib-esm/I18n/I18n.js ***!
  \******************************/
/*! exports provided: I18n */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I18n", function() { return I18n; });
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Logger */ "./lib-esm/Logger/index.js");
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

var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"]('I18n');
/**
 * Language transition class
 */

var I18n =
/** @class */
function () {
  /**
   * @constructor
   * Initialize with configurations
   * @param {Object} options
   */
  function I18n(options) {
    /**
     * @private
     */
    this._options = null;
    /**
     * @private
     */

    this._lang = null;
    /**
     * @private
     */

    this._dict = {};
    this._options = Object.assign({}, options);
    this._lang = this._options.language;

    if (!this._lang && typeof window !== 'undefined' && window && window.navigator) {
      this._lang = window.navigator.language;
    }

    logger.debug(this._lang);
  }
  /**
   * @method
   * Explicitly setting language
   * @param {String} lang
   */


  I18n.prototype.setLanguage = function (lang) {
    this._lang = lang;
  };
  /**
   * @method
   * Get value
   * @param {String} key
   * @param {String} defVal - Default value
   */


  I18n.prototype.get = function (key, defVal) {
    if (defVal === void 0) {
      defVal = undefined;
    }

    if (!this._lang) {
      return typeof defVal !== 'undefined' ? defVal : key;
    }

    var lang = this._lang;
    var val = this.getByLanguage(key, lang);

    if (val) {
      return val;
    }

    if (lang.indexOf('-') > 0) {
      val = this.getByLanguage(key, lang.split('-')[0]);
    }

    if (val) {
      return val;
    }

    return typeof defVal !== 'undefined' ? defVal : key;
  };
  /**
   * @method
   * Get value according to specified language
   * @param {String} key
   * @param {String} language - Specified langurage to be used
   * @param {String} defVal - Default value
   */


  I18n.prototype.getByLanguage = function (key, language, defVal) {
    if (defVal === void 0) {
      defVal = null;
    }

    if (!language) {
      return defVal;
    }

    var lang_dict = this._dict[language];

    if (!lang_dict) {
      return defVal;
    }

    return lang_dict[key];
  };
  /**
   * @method
   * Add vocabularies for one language
   * @param {String} langurage - Language of the dictionary
   * @param {Object} vocabularies - Object that has key-value as dictionary entry
   */


  I18n.prototype.putVocabulariesForLanguage = function (language, vocabularies) {
    var lang_dict = this._dict[language];

    if (!lang_dict) {
      lang_dict = this._dict[language] = {};
    }

    Object.assign(lang_dict, vocabularies);
  };
  /**
   * @method
   * Add vocabularies for one language
   * @param {Object} vocabularies - Object that has language as key,
   *                                vocabularies of each language as value
   */


  I18n.prototype.putVocabularies = function (vocabularies) {
    var _this = this;

    Object.keys(vocabularies).map(function (key) {
      _this.putVocabulariesForLanguage(key, vocabularies[key]);
    });
  };

  return I18n;
}();



/***/ }),

/***/ "./lib-esm/I18n/index.js":
/*!*******************************!*\
  !*** ./lib-esm/I18n/index.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _I18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./I18n */ "./lib-esm/I18n/I18n.js");
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Logger */ "./lib-esm/Logger/index.js");
/* harmony import */ var _Amplify__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Amplify */ "./lib-esm/Amplify.js");
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



var logger = new _Logger__WEBPACK_IMPORTED_MODULE_1__["ConsoleLogger"]('I18n');
var _config = null;
var _i18n = null;
/**
 * Export I18n APIs
 */

var I18n =
/** @class */
function () {
  function I18n() {}
  /**
   * @static
   * @method
   * Configure I18n part
   * @param {Object} config - Configuration of the I18n
   */


  I18n.configure = function (config) {
    logger.debug('configure I18n');

    if (!config) {
      return _config;
    }

    _config = Object.assign({}, _config, config.I18n || config);
    I18n.createInstance();
    return _config;
  };

  I18n.getModuleName = function () {
    return 'I18n';
  };
  /**
   * @static
   * @method
   * Create an instance of I18n for the library
   */


  I18n.createInstance = function () {
    logger.debug('create I18n instance');

    if (_i18n) {
      return;
    }

    _i18n = new _I18n__WEBPACK_IMPORTED_MODULE_0__["I18n"](_config);
  };
  /**
   * @static @method
   * Explicitly setting language
   * @param {String} lang
   */


  I18n.setLanguage = function (lang) {
    I18n.checkConfig();
    return _i18n.setLanguage(lang);
  };
  /**
   * @static @method
   * Get value
   * @param {String} key
   * @param {String} defVal - Default value
   */


  I18n.get = function (key, defVal) {
    if (!I18n.checkConfig()) {
      return typeof defVal === 'undefined' ? key : defVal;
    }

    return _i18n.get(key, defVal);
  };
  /**
   * @static
   * @method
   * Add vocabularies for one language
   * @param {String} langurage - Language of the dictionary
   * @param {Object} vocabularies - Object that has key-value as dictionary entry
   */


  I18n.putVocabulariesForLanguage = function (language, vocabularies) {
    I18n.checkConfig();
    return _i18n.putVocabulariesForLanguage(language, vocabularies);
  };
  /**
   * @static
   * @method
   * Add vocabularies for one language
   * @param {Object} vocabularies - Object that has language as key,
   *                                vocabularies of each language as value
   */


  I18n.putVocabularies = function (vocabularies) {
    I18n.checkConfig();
    return _i18n.putVocabularies(vocabularies);
  };

  I18n.checkConfig = function () {
    if (!_i18n) {
      _i18n = new _I18n__WEBPACK_IMPORTED_MODULE_0__["I18n"](_config);
    }

    return true;
  };

  return I18n;
}();

_Amplify__WEBPACK_IMPORTED_MODULE_2__["default"].register(I18n);
/* harmony default export */ __webpack_exports__["default"] = (I18n);

/***/ }),

/***/ "./lib-esm/JS.js":
/*!***********************!*\
  !*** ./lib-esm/JS.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
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
var MIME_MAP = [{
  type: 'text/plain',
  ext: 'txt'
}, {
  type: 'text/html',
  ext: 'html'
}, {
  type: 'text/javascript',
  ext: 'js'
}, {
  type: 'text/css',
  ext: 'css'
}, {
  type: 'text/csv',
  ext: 'csv'
}, {
  type: 'text/yaml',
  ext: 'yml'
}, {
  type: 'text/yaml',
  ext: 'yaml'
}, {
  type: 'text/calendar',
  ext: 'ics'
}, {
  type: 'text/calendar',
  ext: 'ical'
}, {
  type: 'image/png',
  ext: 'png'
}, {
  type: 'image/gif',
  ext: 'gif'
}, {
  type: 'image/jpeg',
  ext: 'jpg'
}, {
  type: 'image/jpeg',
  ext: 'jpeg'
}, {
  type: 'image/bmp',
  ext: 'bmp'
}, {
  type: 'image/x-icon',
  ext: 'ico'
}, {
  type: 'image/tiff',
  ext: 'tif'
}, {
  type: 'image/tiff',
  ext: 'tiff'
}, {
  type: 'image/svg+xml',
  ext: 'svg'
}, {
  type: 'application/json',
  ext: 'json'
}, {
  type: 'application/xml',
  ext: 'xml'
}, {
  type: 'application/x-sh',
  ext: 'sh'
}, {
  type: 'application/zip',
  ext: 'zip'
}, {
  type: 'application/x-rar-compressed',
  ext: 'rar'
}, {
  type: 'application/x-tar',
  ext: 'tar'
}, {
  type: 'application/x-bzip',
  ext: 'bz'
}, {
  type: 'application/x-bzip2',
  ext: 'bz2'
}, {
  type: 'application/pdf',
  ext: 'pdf'
}, {
  type: 'application/java-archive',
  ext: 'jar'
}, {
  type: 'application/msword',
  ext: 'doc'
}, {
  type: 'application/vnd.ms-excel',
  ext: 'xls'
}, {
  type: 'application/vnd.ms-excel',
  ext: 'xlsx'
}, {
  type: 'message/rfc822',
  ext: 'eml'
}];

var JS =
/** @class */
function () {
  function JS() {}

  JS.isEmpty = function (obj) {
    return Object.keys(obj).length === 0;
  };

  JS.sortByField = function (list, field, dir) {
    if (!list || !list.sort) {
      return false;
    }

    var dirX = dir && dir === 'desc' ? -1 : 1;
    list.sort(function (a, b) {
      var a_val = a[field];
      var b_val = b[field];

      if (typeof b_val === 'undefined') {
        return typeof a_val === 'undefined' ? 0 : 1 * dirX;
      }

      if (typeof a_val === 'undefined') {
        return -1 * dirX;
      }

      if (a_val < b_val) {
        return -1 * dirX;
      }

      if (a_val > b_val) {
        return 1 * dirX;
      }

      return 0;
    });
    return true;
  };

  JS.objectLessAttributes = function (obj, less) {
    var ret = Object.assign({}, obj);

    if (less) {
      if (typeof less === 'string') {
        delete ret[less];
      } else {
        less.forEach(function (attr) {
          delete ret[attr];
        });
      }
    }

    return ret;
  };

  JS.filenameToContentType = function (filename, defVal) {
    if (defVal === void 0) {
      defVal = 'application/octet-stream';
    }

    var name = filename.toLowerCase();
    var filtered = MIME_MAP.filter(function (mime) {
      return name.endsWith('.' + mime.ext);
    });
    return filtered.length > 0 ? filtered[0].type : defVal;
  };

  JS.isTextFile = function (contentType) {
    var type = contentType.toLowerCase();

    if (type.startsWith('text/')) {
      return true;
    }

    return 'application/json' === type || 'application/xml' === type || 'application/sh' === type;
  };
  /**
   * generate random string
   */


  JS.generateRandomString = function () {
    var result = '';
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (var i = 32; i > 0; i -= 1) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
  };

  JS.makeQuerablePromise = function (promise) {
    if (promise.isResolved) return promise;
    var isPending = true;
    var isRejected = false;
    var isFullfilled = false;
    var result = promise.then(function (data) {
      isFullfilled = true;
      isPending = false;
      return data;
    }, function (e) {
      isRejected = true;
      isPending = false;
      throw e;
    });

    result.isFullfilled = function () {
      return isFullfilled;
    };

    result.isPending = function () {
      return isPending;
    };

    result.isRejected = function () {
      return isRejected;
    };

    return result;
  };
  /**
   * Webpack adds node shim to the bundle overriding the `process` variable
   * causing issues detecting nodejs environment. Creating a new function will
   * help to avoid incorrect environment detection as new function will have
   * it's `this` binded to global scope. Credit: https://stackoverflow.com/a/31090240
   */


  JS.browserOrNode = function () {
    // function to check if the global scope is "window"
    var isBrowser = new Function('try {return this===window;}catch(e){ return false;}'); // function to test if global scope is binded to "global"

    var isNode = new Function('try {return this===global;}catch(e){return false;}');
    return {
      isBrowser: isBrowser(),
      isNode: isNode()
    };
  };
  /**
   * transfer the first letter of the keys to lowercase
   * @param {Object} obj - the object need to be transferred
   * @param {Array} whiteListForItself - whitelist itself from being transferred
   * @param {Array} whiteListForChildren - whitelist its children keys from being transferred
   */


  JS.transferKeyToLowerCase = function (obj, whiteListForItself, whiteListForChildren) {
    if (whiteListForItself === void 0) {
      whiteListForItself = [];
    }

    if (whiteListForChildren === void 0) {
      whiteListForChildren = [];
    }

    if (!JS.isStrictObject(obj)) return obj;
    var ret = {};

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var transferedKey = whiteListForItself.includes(key) ? key : key[0].toLowerCase() + key.slice(1);
        ret[transferedKey] = whiteListForChildren.includes(key) ? obj[key] : JS.transferKeyToLowerCase(obj[key], whiteListForItself, whiteListForChildren);
      }
    }

    return ret;
  };
  /**
   * transfer the first letter of the keys to lowercase
   * @param {Object} obj - the object need to be transferred
   * @param {Array} whiteListForItself - whitelist itself from being transferred
   * @param {Array} whiteListForChildren - whitelist its children keys from being transferred
   */


  JS.transferKeyToUpperCase = function (obj, whiteListForItself, whiteListForChildren) {
    if (whiteListForItself === void 0) {
      whiteListForItself = [];
    }

    if (whiteListForChildren === void 0) {
      whiteListForChildren = [];
    }

    if (!JS.isStrictObject(obj)) return obj;
    var ret = {};

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var transferedKey = whiteListForItself.includes(key) ? key : key[0].toUpperCase() + key.slice(1);
        ret[transferedKey] = whiteListForChildren.includes(key) ? obj[key] : JS.transferKeyToUpperCase(obj[key], whiteListForItself, whiteListForChildren);
      }
    }

    return ret;
  };
  /**
   * Return true if the object is a strict object
   * which means it's not Array, Function, Number, String, Boolean or Null
   * @param obj the Object
   */


  JS.isStrictObject = function (obj) {
    return obj instanceof Object && !(obj instanceof Array) && !(obj instanceof Function) && !(obj instanceof Number) && !(obj instanceof String) && !(obj instanceof Boolean);
  };

  return JS;
}();

/* harmony default export */ __webpack_exports__["default"] = (JS);

/***/ }),

/***/ "./lib-esm/Logger/ConsoleLogger.js":
/*!*****************************************!*\
  !*** ./lib-esm/Logger/ConsoleLogger.js ***!
  \*****************************************/
/*! exports provided: ConsoleLogger */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConsoleLogger", function() { return ConsoleLogger; });
/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
var __spreadArrays = undefined && undefined.__spreadArrays || function () {
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

var LOG_LEVELS = {
  VERBOSE: 1,
  DEBUG: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5
};
/**
 * Write logs
 * @class Logger
 */

var ConsoleLogger =
/** @class */
function () {
  /**
   * @constructor
   * @param {string} name - Name of the logger
   */
  function ConsoleLogger(name, level) {
    if (level === void 0) {
      level = 'WARN';
    }

    this.name = name;
    this.level = level;
  }

  ConsoleLogger.prototype._padding = function (n) {
    return n < 10 ? '0' + n : '' + n;
  };

  ConsoleLogger.prototype._ts = function () {
    var dt = new Date();
    return [this._padding(dt.getMinutes()), this._padding(dt.getSeconds())].join(':') + '.' + dt.getMilliseconds();
  };
  /**
   * Write log
   * @method
   * @memeberof Logger
   * @param {string} type - log type, default INFO
   * @param {string|object} msg - Logging message or object
   */


  ConsoleLogger.prototype._log = function (type) {
    var msg = [];

    for (var _i = 1; _i < arguments.length; _i++) {
      msg[_i - 1] = arguments[_i];
    }

    var logger_level_name = this.level;

    if (ConsoleLogger.LOG_LEVEL) {
      logger_level_name = ConsoleLogger.LOG_LEVEL;
    }

    if (typeof window !== 'undefined' && window.LOG_LEVEL) {
      logger_level_name = window.LOG_LEVEL;
    }

    var logger_level = LOG_LEVELS[logger_level_name];
    var type_level = LOG_LEVELS[type];

    if (!(type_level >= logger_level)) {
      // Do nothing if type is not greater than or equal to logger level (handle undefined)
      return;
    }

    var log = console.log.bind(console);

    if (type === 'ERROR' && console.error) {
      log = console.error.bind(console);
    }

    if (type === 'WARN' && console.warn) {
      log = console.warn.bind(console);
    }

    var prefix = "[" + type + "] " + this._ts() + " " + this.name;

    if (msg.length === 1 && typeof msg[0] === 'string') {
      log(prefix + " - " + msg[0]);
    } else if (msg.length === 1) {
      log(prefix, msg[0]);
    } else if (typeof msg[0] === 'string') {
      var obj = msg.slice(1);

      if (obj.length === 1) {
        obj = obj[0];
      }

      log(prefix + " - " + msg[0], obj);
    } else {
      log(prefix, msg);
    }
  };
  /**
   * Write General log. Default to INFO
   * @method
   * @memeberof Logger
   * @param {string|object} msg - Logging message or object
   */


  ConsoleLogger.prototype.log = function () {
    var msg = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      msg[_i] = arguments[_i];
    }

    this._log.apply(this, __spreadArrays(['INFO'], msg));
  };
  /**
   * Write INFO log
   * @method
   * @memeberof Logger
   * @param {string|object} msg - Logging message or object
   */


  ConsoleLogger.prototype.info = function () {
    var msg = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      msg[_i] = arguments[_i];
    }

    this._log.apply(this, __spreadArrays(['INFO'], msg));
  };
  /**
   * Write WARN log
   * @method
   * @memeberof Logger
   * @param {string|object} msg - Logging message or object
   */


  ConsoleLogger.prototype.warn = function () {
    var msg = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      msg[_i] = arguments[_i];
    }

    this._log.apply(this, __spreadArrays(['WARN'], msg));
  };
  /**
   * Write ERROR log
   * @method
   * @memeberof Logger
   * @param {string|object} msg - Logging message or object
   */


  ConsoleLogger.prototype.error = function () {
    var msg = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      msg[_i] = arguments[_i];
    }

    this._log.apply(this, __spreadArrays(['ERROR'], msg));
  };
  /**
   * Write DEBUG log
   * @method
   * @memeberof Logger
   * @param {string|object} msg - Logging message or object
   */


  ConsoleLogger.prototype.debug = function () {
    var msg = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      msg[_i] = arguments[_i];
    }

    this._log.apply(this, __spreadArrays(['DEBUG'], msg));
  };
  /**
   * Write VERBOSE log
   * @method
   * @memeberof Logger
   * @param {string|object} msg - Logging message or object
   */


  ConsoleLogger.prototype.verbose = function () {
    var msg = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      msg[_i] = arguments[_i];
    }

    this._log.apply(this, __spreadArrays(['VERBOSE'], msg));
  };

  ConsoleLogger.LOG_LEVEL = null;
  return ConsoleLogger;
}();



/***/ }),

/***/ "./lib-esm/Logger/index.js":
/*!*********************************!*\
  !*** ./lib-esm/Logger/index.js ***!
  \*********************************/
/*! exports provided: ConsoleLogger */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ConsoleLogger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ConsoleLogger */ "./lib-esm/Logger/ConsoleLogger.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ConsoleLogger", function() { return _ConsoleLogger__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"]; });

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


/***/ }),

/***/ "./lib-esm/OAuthHelper/FacebookOAuth.js":
/*!**********************************************!*\
  !*** ./lib-esm/OAuthHelper/FacebookOAuth.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Logger */ "./lib-esm/Logger/index.js");
/* harmony import */ var _JS__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../JS */ "./lib-esm/JS.js");
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




var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"]('CognitoCredentials');
var waitForInit = new Promise(function (res, rej) {
  if (!_JS__WEBPACK_IMPORTED_MODULE_1__["default"].browserOrNode().isBrowser) {
    logger.debug('not in the browser, directly resolved');
    return res();
  }

  var fb = window['FB'];

  if (fb) {
    logger.debug('FB SDK already loaded');
    return res();
  } else {
    setTimeout(function () {
      return res();
    }, 2000);
  }
});

var FacebookOAuth =
/** @class */
function () {
  function FacebookOAuth() {
    this.initialized = false;
    this.refreshFacebookToken = this.refreshFacebookToken.bind(this);
    this._refreshFacebookTokenImpl = this._refreshFacebookTokenImpl.bind(this);
  }

  FacebookOAuth.prototype.refreshFacebookToken = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!!this.initialized) return [3
            /*break*/
            , 2];
            logger.debug('need to wait for the Facebook SDK loaded');
            return [4
            /*yield*/
            , waitForInit];

          case 1:
            _a.sent();

            this.initialized = true;
            logger.debug('finish waiting');
            _a.label = 2;

          case 2:
            return [2
            /*return*/
            , this._refreshFacebookTokenImpl()];
        }
      });
    });
  };

  FacebookOAuth.prototype._refreshFacebookTokenImpl = function () {
    var fb = null;
    if (_JS__WEBPACK_IMPORTED_MODULE_1__["default"].browserOrNode().isBrowser) fb = window['FB'];

    if (!fb) {
      logger.debug('no fb sdk available');
      return Promise.reject('no fb sdk available');
    }

    return new Promise(function (res, rej) {
      fb.getLoginStatus(function (fbResponse) {
        if (!fbResponse || !fbResponse.authResponse) {
          logger.debug('no response from facebook when refreshing the jwt token');
          rej('no response from facebook when refreshing the jwt token');
        }

        var response = fbResponse.authResponse;
        var accessToken = response.accessToken,
            expiresIn = response.expiresIn;
        var date = new Date();
        var expires_at = expiresIn * 1000 + date.getTime();

        if (!accessToken) {
          logger.debug('the jwtToken is undefined');
          rej('the jwtToken is undefined');
        }

        res({
          token: accessToken,
          expires_at: expires_at
        });
      }, {
        scope: 'public_profile,email'
      });
    });
  };

  return FacebookOAuth;
}();

/* harmony default export */ __webpack_exports__["default"] = (FacebookOAuth);

/***/ }),

/***/ "./lib-esm/OAuthHelper/GoogleOAuth.js":
/*!********************************************!*\
  !*** ./lib-esm/OAuthHelper/GoogleOAuth.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Logger */ "./lib-esm/Logger/index.js");
/* harmony import */ var _JS__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../JS */ "./lib-esm/JS.js");
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




var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"]('CognitoCredentials');
var waitForInit = new Promise(function (res, rej) {
  if (!_JS__WEBPACK_IMPORTED_MODULE_1__["default"].browserOrNode().isBrowser) {
    logger.debug('not in the browser, directly resolved');
    return res();
  }

  var ga = window['gapi'] && window['gapi'].auth2 ? window['gapi'].auth2 : null;

  if (ga) {
    logger.debug('google api already loaded');
    return res();
  } else {
    setTimeout(function () {
      return res();
    }, 2000);
  }
});

var GoogleOAuth =
/** @class */
function () {
  function GoogleOAuth() {
    this.initialized = false;
    this.refreshGoogleToken = this.refreshGoogleToken.bind(this);
    this._refreshGoogleTokenImpl = this._refreshGoogleTokenImpl.bind(this);
  }

  GoogleOAuth.prototype.refreshGoogleToken = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!!this.initialized) return [3
            /*break*/
            , 2];
            logger.debug('need to wait for the Google SDK loaded');
            return [4
            /*yield*/
            , waitForInit];

          case 1:
            _a.sent();

            this.initialized = true;
            logger.debug('finish waiting');
            _a.label = 2;

          case 2:
            return [2
            /*return*/
            , this._refreshGoogleTokenImpl()];
        }
      });
    });
  };

  GoogleOAuth.prototype._refreshGoogleTokenImpl = function () {
    var ga = null;
    if (_JS__WEBPACK_IMPORTED_MODULE_1__["default"].browserOrNode().isBrowser) ga = window['gapi'] && window['gapi'].auth2 ? window['gapi'].auth2 : null;

    if (!ga) {
      logger.debug('no gapi auth2 available');
      return Promise.reject('no gapi auth2 available');
    }

    return new Promise(function (res, rej) {
      ga.getAuthInstance().then(function (googleAuth) {
        if (!googleAuth) {
          console.log('google Auth undefiend');
          rej('google Auth undefiend');
        }

        var googleUser = googleAuth.currentUser.get(); // refresh the token

        if (googleUser.isSignedIn()) {
          logger.debug('refreshing the google access token');
          googleUser.reloadAuthResponse().then(function (authResponse) {
            var id_token = authResponse.id_token,
                expires_at = authResponse.expires_at;
            var profile = googleUser.getBasicProfile();
            var user = {
              email: profile.getEmail(),
              name: profile.getName()
            };
            res({
              token: id_token,
              expires_at: expires_at
            });
          });
        } else {
          rej('User is not signed in with Google');
        }
      })["catch"](function (err) {
        logger.debug('Failed to refresh google token', err);
        rej('Failed to refresh google token');
      });
    });
  };

  return GoogleOAuth;
}();

/* harmony default export */ __webpack_exports__["default"] = (GoogleOAuth);

/***/ }),

/***/ "./lib-esm/OAuthHelper/index.js":
/*!**************************************!*\
  !*** ./lib-esm/OAuthHelper/index.js ***!
  \**************************************/
/*! exports provided: GoogleOAuth, FacebookOAuth */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GoogleOAuth", function() { return GoogleOAuth; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FacebookOAuth", function() { return FacebookOAuth; });
/* harmony import */ var _GoogleOAuth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GoogleOAuth */ "./lib-esm/OAuthHelper/GoogleOAuth.js");
/* harmony import */ var _FacebookOAuth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./FacebookOAuth */ "./lib-esm/OAuthHelper/FacebookOAuth.js");
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


var GoogleOAuth = new _GoogleOAuth__WEBPACK_IMPORTED_MODULE_0__["default"]();
var FacebookOAuth = new _FacebookOAuth__WEBPACK_IMPORTED_MODULE_1__["default"]();


/***/ }),

/***/ "./lib-esm/Parser.js":
/*!***************************!*\
  !*** ./lib-esm/Parser.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Logger */ "./lib-esm/Logger/index.js");

var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"]('Parser');

var Parser =
/** @class */
function () {
  function Parser() {}

  Parser.parseMobilehubConfig = function (config) {
    var amplifyConfig = {}; // Analytics

    if (config['aws_mobile_analytics_app_id']) {
      var Analytics = {
        AWSPinpoint: {
          appId: config['aws_mobile_analytics_app_id'],
          region: config['aws_mobile_analytics_app_region']
        }
      };
      amplifyConfig.Analytics = Analytics;
    } // Auth


    if (config['aws_cognito_identity_pool_id'] || config['aws_user_pools_id']) {
      var Auth = {
        userPoolId: config['aws_user_pools_id'],
        userPoolWebClientId: config['aws_user_pools_web_client_id'],
        region: config['aws_cognito_region'],
        identityPoolId: config['aws_cognito_identity_pool_id'],
        identityPoolRegion: config['aws_cognito_region'],
        mandatorySignIn: config['aws_mandatory_sign_in'] === 'enable' ? true : false
      };
      amplifyConfig.Auth = Auth;
    } // Storage


    var storageConfig;

    if (config['aws_user_files_s3_bucket']) {
      storageConfig = {
        AWSS3: {
          bucket: config['aws_user_files_s3_bucket'],
          region: config['aws_user_files_s3_bucket_region'],
          dangerouslyConnectToHttpEndpointForTesting: config['aws_user_files_s3_dangerously_connect_to_http_endpoint_for_testing']
        }
      };
    } else {
      storageConfig = config ? config.Storage || config : {};
    }

    amplifyConfig.Analytics = Object.assign({}, amplifyConfig.Analytics, config.Analytics);
    amplifyConfig.Auth = Object.assign({}, amplifyConfig.Auth, config.Auth);
    amplifyConfig.Storage = Object.assign({}, storageConfig);
    logger.debug('parse config', config, 'to amplifyconfig', amplifyConfig);
    return amplifyConfig;
  };

  return Parser;
}();

/* harmony default export */ __webpack_exports__["default"] = (Parser);

/***/ }),

/***/ "./lib-esm/Platform/index.js":
/*!***********************************!*\
  !*** ./lib-esm/Platform/index.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
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
var packageInfo = __webpack_require__(/*! ../../package.json */ "./package.json");

var Platform = {
  userAgent: "aws-amplify/" + packageInfo.version + " js",
  product: '',
  navigator: null,
  isReactNative: false
};

if (typeof navigator !== 'undefined' && navigator.product) {
  Platform.product = navigator.product || '';
  Platform.navigator = navigator || null;

  switch (navigator.product) {
    case 'ReactNative':
      Platform.userAgent = "aws-amplify/" + packageInfo.version + " react-native";
      Platform.isReactNative = true;
      break;

    default:
      Platform.userAgent = "aws-amplify/" + packageInfo.version + " js";
      Platform.isReactNative = false;
      break;
  }
}

/* harmony default export */ __webpack_exports__["default"] = (Platform);

/***/ }),

/***/ "./lib-esm/RNComponents/index.js":
/*!***************************************!*\
  !*** ./lib-esm/RNComponents/index.js ***!
  \***************************************/
/*! exports provided: Linking, AppState, AsyncStorage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Linking", function() { return Linking; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppState", function() { return AppState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AsyncStorage", function() { return AsyncStorage; });
/* harmony import */ var _JS__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../JS */ "./lib-esm/JS.js");
/* harmony import */ var _StorageHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../StorageHelper */ "./lib-esm/StorageHelper/index.js");
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


var Linking = {};
var AppState = {
  addEventListener: function addEventListener(action, handler) {
    return;
  }
}; // if not in react native, just use local storage

var AsyncStorage = _JS__WEBPACK_IMPORTED_MODULE_0__["default"].browserOrNode().isBrowser ? new _StorageHelper__WEBPACK_IMPORTED_MODULE_1__["default"]().getStorage() : undefined;


/***/ }),

/***/ "./lib-esm/ServiceWorker/ServiceWorker.js":
/*!************************************************!*\
  !*** ./lib-esm/ServiceWorker/ServiceWorker.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Logger */ "./lib-esm/Logger/index.js");
/* harmony import */ var _JS__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../JS */ "./lib-esm/JS.js");
/* harmony import */ var _Amplify__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Amplify */ "./lib-esm/Amplify.js");
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
/**
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





/**
 * Provides a means to registering a service worker in the browser
 * and communicating with it via postMessage events.
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/
 *
 * postMessage events are currently not supported in all browsers. See:
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 *
 * At the minmum this class will register the service worker and listen
 * and attempt to dispatch messages on state change and record analytics
 * events based on the service worker lifecycle.
 */

var ServiceWorkerClass =
/** @class */
function () {
  function ServiceWorkerClass() {
    // The AWS Amplify logger
    this._logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"]('ServiceWorker');
  }

  Object.defineProperty(ServiceWorkerClass.prototype, "serviceWorker", {
    /**
     * Get the currently active service worker
     */
    get: function get() {
      return this._serviceWorker;
    },
    enumerable: true,
    configurable: true
  });
  /**
   * Register the service-worker.js file in the browser
   * Make sure the service-worker.js is part of the build
   * for example with Angular, modify the angular-cli.json file
   * and add to "assets" array "service-worker.js"
   * @param {string} - (optional) Service worker file. Defaults to "/service-worker.js"
   * @param {string} - (optional) The service worker scope. Defaults to "/"
   *  - API Doc: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register
   * @returns {Promise}
   *	- resolve(ServiceWorkerRegistration)
   *	- reject(Error)
   **/

  ServiceWorkerClass.prototype.register = function (filePath, scope) {
    var _this = this;

    if (filePath === void 0) {
      filePath = '/service-worker.js';
    }

    if (scope === void 0) {
      scope = '/';
    }

    this._logger.debug("registering " + filePath);

    this._logger.debug("registering service worker with scope " + scope);

    return new Promise(function (resolve, reject) {
      if (navigator && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register(filePath, {
          scope: scope
        }).then(function (registration) {
          if (registration.installing) {
            _this._serviceWorker = registration.installing;
          } else if (registration.waiting) {
            _this._serviceWorker = registration.waiting;
          } else if (registration.active) {
            _this._serviceWorker = registration.active;
          }

          _this._registration = registration;

          _this._setupListeners();

          _this._logger.debug("Service Worker Registration Success: " + registration);

          return resolve(registration);
        })["catch"](function (error) {
          _this._logger.debug("Service Worker Registration Failed " + error);

          return reject(error);
        });
      } else {
        return reject(new Error('Service Worker not available'));
      }
    });
  };
  /**
   * Enable web push notifications. If not subscribed, a new subscription will
   * be created and registered.
   * 	Test Push Server: https://web-push-codelab.glitch.me/
   * 	Push Server Libraries: https://github.com/web-push-libs/
   * 	API Doc: https://developers.google.com/web/fundamentals/codelabs/push-notifications/
   * @param publicKey
   * @returns {Promise}
   * 	- resolve(PushSubscription)
   *  - reject(Error)
   */


  ServiceWorkerClass.prototype.enablePush = function (publicKey) {
    var _this = this;

    if (!this._registration) throw new Error('Service Worker not registered');
    this._publicKey = publicKey;
    return new Promise(function (resolve, reject) {
      if (_JS__WEBPACK_IMPORTED_MODULE_1__["default"].browserOrNode().isBrowser) {
        _this._registration.pushManager.getSubscription().then(function (subscription) {
          if (subscription) {
            _this._subscription = subscription;

            _this._logger.debug("User is subscribed to push: " + JSON.stringify(subscription));

            resolve(subscription);
          } else {
            _this._logger.debug("User is NOT subscribed to push");

            return _this._registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: _this._urlB64ToUint8Array(publicKey)
            }).then(function (subscription) {
              _this._subscription = subscription;

              _this._logger.debug("User subscribed: " + JSON.stringify(subscription));

              resolve(subscription);
            })["catch"](function (error) {
              _this._logger.error(error);
            });
          }
        });
      } else {
        return reject(new Error('Service Worker not available'));
      }
    });
  };
  /**
   * Convert a base64 encoded string to a Uint8 array for the push server key
   * @param base64String
   */


  ServiceWorkerClass.prototype._urlB64ToUint8Array = function (base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  };
  /**
   * Send a message to the service worker. The service worker needs
   * to implement `self.addEventListener('message') to handle the
   * message. This ***currently*** does not work in Safari or IE.
   * @param {object | string} - An arbitrary JSON object or string message to send to the service worker
   *	- see: https://developer.mozilla.org/en-US/docs/Web/API/Transferable
   * @returns {Promise}
   **/


  ServiceWorkerClass.prototype.send = function (message) {
    if (this._serviceWorker) {
      this._serviceWorker.postMessage(_typeof(message) === 'object' ? JSON.stringify(message) : message);
    }
  };
  /**
   * Listen for service worker state change and message events
   * https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker/state
   **/


  ServiceWorkerClass.prototype._setupListeners = function () {
    var _this = this;

    this._serviceWorker.addEventListener('statechange', function (event) {
      var currentState = _this._serviceWorker.state;

      _this._logger.debug("ServiceWorker statechange: " + currentState);

      if (_Amplify__WEBPACK_IMPORTED_MODULE_2__["default"].Analytics && typeof _Amplify__WEBPACK_IMPORTED_MODULE_2__["default"].Analytics.record === 'function') {
        _Amplify__WEBPACK_IMPORTED_MODULE_2__["default"].Analytics.record({
          name: 'ServiceWorker',
          attributes: {
            state: currentState
          }
        });
      }
    });

    this._serviceWorker.addEventListener('message', function (event) {
      _this._logger.debug("ServiceWorker message event: " + event);
    });
  };

  return ServiceWorkerClass;
}();

/* harmony default export */ __webpack_exports__["default"] = (ServiceWorkerClass);

/***/ }),

/***/ "./lib-esm/ServiceWorker/index.js":
/*!****************************************!*\
  !*** ./lib-esm/ServiceWorker/index.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ServiceWorker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ServiceWorker */ "./lib-esm/ServiceWorker/ServiceWorker.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _ServiceWorker__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/**
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


/***/ }),

/***/ "./lib-esm/Signer.js":
/*!***************************!*\
  !*** ./lib-esm/Signer.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Logger */ "./lib-esm/Logger/index.js");
/* harmony import */ var _Facet__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Facet */ "./lib-esm/Facet.js");
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

var __rest = undefined && undefined.__rest || function (s, e) {
  var t = {};

  for (var p in s) {
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  }

  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};




var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"]('Signer'),
    url = __webpack_require__(/*! url */ "../../node_modules/url/url.js"),
    crypto = _Facet__WEBPACK_IMPORTED_MODULE_1__["AWS"]['util'].crypto;

var DEFAULT_ALGORITHM = 'AWS4-HMAC-SHA256';
var IOT_SERVICE_NAME = 'iotdevicegateway';

var encrypt = function encrypt(key, src, encoding) {
  return crypto.lib.createHmac('sha256', key).update(src, 'utf8').digest(encoding);
};

var hash = function hash(src) {
  var arg = src || '';
  return crypto.createHash('sha256').update(arg, 'utf8').digest('hex');
};
/**
 * @private
 * RFC 3986 compliant version of encodeURIComponent
 */


var escape_RFC3986 = function escape_RFC3986(component) {
  return component.replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
};
/**
 * @private
 * Create canonical query string
 *
 */


var canonical_query = function canonical_query(query) {
  if (!query || query.length === 0) {
    return '';
  }

  return query.split('&').map(function (e) {
    var key_val = e.split('=');

    if (key_val.length === 1) {
      return e;
    } else {
      var reencoded_val = escape_RFC3986(key_val[1]);
      return key_val[0] + '=' + reencoded_val;
    }
  }).sort(function (a, b) {
    var key_a = a.split('=')[0];
    var key_b = b.split('=')[0];

    if (key_a === key_b) {
      return a < b ? -1 : 1;
    } else {
      return key_a < key_b ? -1 : 1;
    }
  }).join('&');
};
/**
* @private
* Create canonical headers
*
<pre>
CanonicalHeaders =
    CanonicalHeadersEntry0 + CanonicalHeadersEntry1 + ... + CanonicalHeadersEntryN
CanonicalHeadersEntry =
    Lowercase(HeaderName) + ':' + Trimall(HeaderValue) + '\n'
</pre>
*/


var canonical_headers = function canonical_headers(headers) {
  if (!headers || Object.keys(headers).length === 0) {
    return '';
  }

  return Object.keys(headers).map(function (key) {
    return {
      key: key.toLowerCase(),
      value: headers[key] ? headers[key].trim().replace(/\s+/g, ' ') : ''
    };
  }).sort(function (a, b) {
    return a.key < b.key ? -1 : 1;
  }).map(function (item) {
    return item.key + ':' + item.value;
  }).join('\n') + '\n';
};
/**
 * List of header keys included in the canonical headers.
 * @access private
 */


var signed_headers = function signed_headers(headers) {
  return Object.keys(headers).map(function (key) {
    return key.toLowerCase();
  }).sort().join(';');
};
/**
* @private
* Create canonical request
* Refer to
* {@link http://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html|Create a Canonical Request}
*
<pre>
CanonicalRequest =
    HTTPRequestMethod + '\n' +
    CanonicalURI + '\n' +
    CanonicalQueryString + '\n' +
    CanonicalHeaders + '\n' +
    SignedHeaders + '\n' +
    HexEncode(Hash(RequestPayload))
</pre>
*/


var canonical_request = function canonical_request(request) {
  var url_info = url.parse(request.url);
  return [request.method || '/', encodeURIComponent(url_info.pathname).replace(/%2F/gi, '/'), canonical_query(url_info.query), canonical_headers(request.headers), signed_headers(request.headers), hash(request.data)].join('\n');
};

var parse_service_info = function parse_service_info(request) {
  var url_info = url.parse(request.url),
      host = url_info.host;
  var matched = host.match(/([^\.]+)\.(?:([^\.]*)\.)?amazonaws\.com$/);
  var parsed = (matched || []).slice(1, 3);

  if (parsed[1] === 'es') {
    // Elastic Search
    parsed = parsed.reverse();
  }

  return {
    service: request.service || parsed[0],
    region: request.region || parsed[1]
  };
};

var credential_scope = function credential_scope(d_str, region, service) {
  return [d_str, region, service, 'aws4_request'].join('/');
};
/**
* @private
* Create a string to sign
* Refer to
* {@link http://docs.aws.amazon.com/general/latest/gr/sigv4-create-string-to-sign.html|Create String to Sign}
*
<pre>
StringToSign =
    Algorithm + \n +
    RequestDateTime + \n +
    CredentialScope + \n +
    HashedCanonicalRequest
</pre>
*/


var string_to_sign = function string_to_sign(algorithm, canonical_request, dt_str, scope) {
  return [algorithm, dt_str, scope, hash(canonical_request)].join('\n');
};
/**
* @private
* Create signing key
* Refer to
* {@link http://docs.aws.amazon.com/general/latest/gr/sigv4-calculate-signature.html|Calculate Signature}
*
<pre>
kSecret = your secret access key
kDate = HMAC("AWS4" + kSecret, Date)
kRegion = HMAC(kDate, Region)
kService = HMAC(kRegion, Service)
kSigning = HMAC(kService, "aws4_request")
</pre>
*/


var get_signing_key = function get_signing_key(secret_key, d_str, service_info) {
  logger.debug(service_info);
  var k = 'AWS4' + secret_key,
      k_date = encrypt(k, d_str),
      k_region = encrypt(k_date, service_info.region),
      k_service = encrypt(k_region, service_info.service),
      k_signing = encrypt(k_service, 'aws4_request');
  return k_signing;
};

var get_signature = function get_signature(signing_key, str_to_sign) {
  return encrypt(signing_key, str_to_sign, 'hex');
};
/**
 * @private
 * Create authorization header
 * Refer to
 * {@link http://docs.aws.amazon.com/general/latest/gr/sigv4-add-signature-to-request.html|Add the Signing Information}
 */


var get_authorization_header = function get_authorization_header(algorithm, access_key, scope, signed_headers, signature) {
  return [algorithm + ' ' + 'Credential=' + access_key + '/' + scope, 'SignedHeaders=' + signed_headers, 'Signature=' + signature].join(', ');
};
/**
 * AWS request signer.
 * Refer to {@link http://docs.aws.amazon.com/general/latest/gr/sigv4_signing.html|Signature Version 4}
 *
 * @class Signer
 */


var Signer =
/** @class */
function () {
  function Signer() {}
  /**
  * Sign a HTTP request, add 'Authorization' header to request param
  * @method sign
  * @memberof Signer
  * @static
  *
  * @param {object} request - HTTP request object
  <pre>
  request: {
      method: GET | POST | PUT ...
      url: ...,
      headers: {
          header1: ...
      },
      data: data
  }
  </pre>
  * @param {object} access_info - AWS access credential info
  <pre>
  access_info: {
      access_key: ...,
      secret_key: ...,
      session_token: ...
  }
  </pre>
  * @param {object} [service_info] - AWS service type and region, optional,
  *                                  if not provided then parse out from url
  <pre>
  service_info: {
      service: ...,
      region: ...
  }
  </pre>
  *
  * @returns {object} Signed HTTP request
  */


  Signer.sign = function (request, access_info, service_info) {
    if (service_info === void 0) {
      service_info = null;
    }

    request.headers = request.headers || {}; // datetime string and date string

    var dt = new Date(),
        dt_str = dt.toISOString().replace(/[:\-]|\.\d{3}/g, ''),
        d_str = dt_str.substr(0, 8);
    var url_info = url.parse(request.url);
    request.headers['host'] = url_info.host;
    request.headers['x-amz-date'] = dt_str;

    if (access_info.session_token) {
      request.headers['X-Amz-Security-Token'] = access_info.session_token;
    } // Task 1: Create a Canonical Request


    var request_str = canonical_request(request);
    logger.debug(request_str); // Task 2: Create a String to Sign

    var serviceInfo = service_info || parse_service_info(request),
        scope = credential_scope(d_str, serviceInfo.region, serviceInfo.service),
        str_to_sign = string_to_sign(DEFAULT_ALGORITHM, request_str, dt_str, scope); // Task 3: Calculate the Signature

    var signing_key = get_signing_key(access_info.secret_key, d_str, serviceInfo),
        signature = get_signature(signing_key, str_to_sign); // Task 4: Adding the Signing information to the Request

    var authorization_header = get_authorization_header(DEFAULT_ALGORITHM, access_info.access_key, scope, signed_headers(request.headers), signature);
    request.headers['Authorization'] = authorization_header;
    return request;
  };

  Signer.signUrl = function (urlOrRequest, accessInfo, serviceInfo, expiration) {
    var urlToSign = _typeof(urlOrRequest) === 'object' ? urlOrRequest.url : urlOrRequest;
    var method = _typeof(urlOrRequest) === 'object' ? urlOrRequest.method : 'GET';
    var body = _typeof(urlOrRequest) === 'object' ? urlOrRequest.body : undefined;
    var now = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    var today = now.substr(0, 8); // Intentionally discarding search

    var _a = url.parse(urlToSign, true, true),
        search = _a.search,
        parsedUrl = __rest(_a, ["search"]);

    var host = parsedUrl.host;
    var signedHeaders = {
      host: host
    };

    var _b = serviceInfo || parse_service_info({
      url: url.format(parsedUrl)
    }),
        region = _b.region,
        service = _b.service;

    var credentialScope = credential_scope(today, region, service); // IoT service does not allow the session token in the canonical request
    // https://docs.aws.amazon.com/general/latest/gr/sigv4-add-signature-to-request.html

    var sessionTokenRequired = accessInfo.session_token && service !== IOT_SERVICE_NAME;

    var queryParams = __assign(__assign(__assign({
      'X-Amz-Algorithm': DEFAULT_ALGORITHM,
      'X-Amz-Credential': [accessInfo.access_key, credentialScope].join('/'),
      'X-Amz-Date': now.substr(0, 16)
    }, sessionTokenRequired ? {
      'X-Amz-Security-Token': "" + accessInfo.session_token
    } : {}), expiration ? {
      'X-Amz-Expires': "" + expiration
    } : {}), {
      'X-Amz-SignedHeaders': Object.keys(signedHeaders).join(',')
    });

    var canonicalRequest = canonical_request({
      method: method,
      url: url.format(__assign(__assign({}, parsedUrl), {
        query: __assign(__assign({}, parsedUrl.query), queryParams)
      })),
      headers: signedHeaders,
      data: body
    });
    var stringToSign = string_to_sign(DEFAULT_ALGORITHM, canonicalRequest, now, credentialScope);
    var signing_key = get_signing_key(accessInfo.secret_key, today, {
      region: region,
      service: service
    });
    var signature = get_signature(signing_key, stringToSign);

    var additionalQueryParams = __assign({
      'X-Amz-Signature': signature
    }, accessInfo.session_token && {
      'X-Amz-Security-Token': accessInfo.session_token
    });

    var result = url.format({
      protocol: parsedUrl.protocol,
      slashes: true,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      pathname: parsedUrl.pathname,
      query: __assign(__assign(__assign({}, parsedUrl.query), queryParams), additionalQueryParams)
    });
    return result;
  };

  return Signer;
}();

/* harmony default export */ __webpack_exports__["default"] = (Signer);

/***/ }),

/***/ "./lib-esm/StorageHelper/index.js":
/*!****************************************!*\
  !*** ./lib-esm/StorageHelper/index.js ***!
  \****************************************/
/*! exports provided: MemoryStorage, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MemoryStorage", function() { return MemoryStorage; });
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
var dataMemory = {};
/** @class */

var MemoryStorage =
/** @class */
function () {
  function MemoryStorage() {}
  /**
   * This is used to set a specific item in storage
   * @param {string} key - the key for the item
   * @param {object} value - the value
   * @returns {string} value that was set
   */


  MemoryStorage.setItem = function (key, value) {
    dataMemory[key] = value;
    return dataMemory[key];
  };
  /**
   * This is used to get a specific key from storage
   * @param {string} key - the key for the item
   * This is used to clear the storage
   * @returns {string} the data item
   */


  MemoryStorage.getItem = function (key) {
    return Object.prototype.hasOwnProperty.call(dataMemory, key) ? dataMemory[key] : undefined;
  };
  /**
   * This is used to remove an item from storage
   * @param {string} key - the key being set
   * @returns {string} value - value that was deleted
   */


  MemoryStorage.removeItem = function (key) {
    return delete dataMemory[key];
  };
  /**
   * This is used to clear the storage
   * @returns {string} nothing
   */


  MemoryStorage.clear = function () {
    dataMemory = {};
    return dataMemory;
  };

  return MemoryStorage;
}();



var StorageHelper =
/** @class */
function () {
  /**
   * This is used to get a storage object
   * @returns {object} the storage
   */
  function StorageHelper() {
    try {
      this.storageWindow = window.localStorage;
      this.storageWindow.setItem('aws.amplify.test-ls', 1);
      this.storageWindow.removeItem('aws.amplify.test-ls');
    } catch (exception) {
      this.storageWindow = MemoryStorage;
    }
  }
  /**
   * This is used to return the storage
   * @returns {object} the storage
   */


  StorageHelper.prototype.getStorage = function () {
    return this.storageWindow;
  };

  return StorageHelper;
}();

/* harmony default export */ __webpack_exports__["default"] = (StorageHelper);

/***/ }),

/***/ "./lib-esm/Util/Mutex.js":
/*!*******************************!*\
  !*** ./lib-esm/Util/Mutex.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Christian Speckner <cnspeckn@googlemail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var Mutex =
/** @class */
function () {
  function Mutex() {
    this._queue = [];
    this._pending = false;
  }

  Mutex.prototype.isLocked = function () {
    return this._pending;
  };

  Mutex.prototype.acquire = function () {
    var _this = this;

    var ticket = new Promise(function (resolve) {
      return _this._queue.push(resolve);
    });

    if (!this._pending) {
      this._dispatchNext();
    }

    return ticket;
  };

  Mutex.prototype.runExclusive = function (callback) {
    return this.acquire().then(function (release) {
      var result;

      try {
        result = callback();
      } catch (e) {
        release();
        throw e;
      }

      return Promise.resolve(result).then(function (x) {
        return release(), x;
      }, function (e) {
        release();
        throw e;
      });
    });
  };

  Mutex.prototype._dispatchNext = function () {
    if (this._queue.length > 0) {
      this._pending = true;

      this._queue.shift()(this._dispatchNext.bind(this));
    } else {
      this._pending = false;
    }
  };

  return Mutex;
}();

/* harmony default export */ __webpack_exports__["default"] = (Mutex);

/***/ }),

/***/ "./lib-esm/Util/Reachability.js":
/*!**************************************!*\
  !*** ./lib-esm/Util/Reachability.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var zen_observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! zen-observable */ "../../node_modules/zen-observable/index.js");
/* harmony import */ var zen_observable__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(zen_observable__WEBPACK_IMPORTED_MODULE_0__);


var ReachabilityNavigator =
/** @class */
function () {
  function ReachabilityNavigator() {}

  ReachabilityNavigator.prototype.networkMonitor = function () {
    return new zen_observable__WEBPACK_IMPORTED_MODULE_0__(function (observer) {
      observer.next({
        online: window.navigator.onLine
      });

      var notifyOnline = function notifyOnline() {
        return observer.next({
          online: true
        });
      };

      var notifyOffline = function notifyOffline() {
        return observer.next({
          online: false
        });
      };

      window.addEventListener('online', notifyOnline);
      window.addEventListener('offline', notifyOffline);
      return function () {
        window.removeEventListener('online', notifyOnline);
        window.removeEventListener('offline', notifyOffline);
      };
    });
  };

  return ReachabilityNavigator;
}();

/* harmony default export */ __webpack_exports__["default"] = (ReachabilityNavigator);

/***/ }),

/***/ "./lib-esm/Util/Retry.js":
/*!*******************************!*\
  !*** ./lib-esm/Util/Retry.js ***!
  \*******************************/
/*! exports provided: NonRetryableError, retry, jitteredExponentialRetry */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NonRetryableError", function() { return NonRetryableError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "retry", function() { return retry; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "jitteredExponentialRetry", function() { return jitteredExponentialRetry; });
/* harmony import */ var _Logger_ConsoleLogger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Logger/ConsoleLogger */ "./lib-esm/Logger/ConsoleLogger.js");
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


var logger = new _Logger_ConsoleLogger__WEBPACK_IMPORTED_MODULE_0__["ConsoleLogger"]('Util');

var NonRetryableError =
/** @class */
function (_super) {
  __extends(NonRetryableError, _super);

  function NonRetryableError(message) {
    var _this = _super.call(this, message) || this;

    _this.nonRetryable = true;
    return _this;
  }

  return NonRetryableError;
}(Error);



var isNonRetryableError = function isNonRetryableError(obj) {
  var key = 'nonRetryable';
  return obj && obj[key];
};
/**
 * @private
 * Internal use of Amplify only
 */


function retry(functionToRetry, args, delayFn, attempt) {
  if (attempt === void 0) {
    attempt = 1;
  }

  return __awaiter(this, void 0, void 0, function () {
    var err_1, retryIn_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          if (typeof functionToRetry !== 'function') {
            throw Error('functionToRetry must be a function');
          }

          logger.debug(functionToRetry.name + " attempt #" + attempt + " with this vars: " + JSON.stringify(args));
          _a.label = 1;

        case 1:
          _a.trys.push([1, 3,, 8]);

          return [4
          /*yield*/
          , functionToRetry.apply(void 0, args)];

        case 2:
          return [2
          /*return*/
          , _a.sent()];

        case 3:
          err_1 = _a.sent();
          logger.debug("error on " + functionToRetry.name + ": " + err_1 + " ");

          if (isNonRetryableError(err_1)) {
            logger.debug(functionToRetry.name + " non retryable error " + err_1);
            throw err_1;
          }

          retryIn_1 = delayFn(attempt, args, err_1);
          logger.debug(functionToRetry.name + " retrying in " + retryIn_1 + " ms");
          if (!(retryIn_1 !== false)) return [3
          /*break*/
          , 6];
          return [4
          /*yield*/
          , new Promise(function (res) {
            return setTimeout(res, retryIn_1);
          })];

        case 4:
          _a.sent();

          return [4
          /*yield*/
          , retry(functionToRetry, args, delayFn, attempt + 1)];

        case 5:
          return [2
          /*return*/
          , _a.sent()];

        case 6:
          throw err_1;

        case 7:
          return [3
          /*break*/
          , 8];

        case 8:
          return [2
          /*return*/
          ];
      }
    });
  });
}
var MAX_DELAY_MS = 5 * 60 * 1000;

function jitteredBackoff(maxDelayMs) {
  var BASE_TIME_MS = 100;
  var JITTER_FACTOR = 100;
  return function (attempt) {
    var delay = Math.pow(2, attempt) * BASE_TIME_MS + JITTER_FACTOR * Math.random();
    return delay > maxDelayMs ? false : delay;
  };
}
/**
 * @private
 * Internal use of Amplify only
 */


var jitteredExponentialRetry = function jitteredExponentialRetry(functionToRetry, args, maxDelayMs) {
  if (maxDelayMs === void 0) {
    maxDelayMs = MAX_DELAY_MS;
  }

  return retry(functionToRetry, args, jitteredBackoff(maxDelayMs));
};

/***/ }),

/***/ "./lib-esm/Util/index.js":
/*!*******************************!*\
  !*** ./lib-esm/Util/index.js ***!
  \*******************************/
/*! exports provided: NonRetryableError, retry, jitteredExponentialRetry, Mutex, Reachability */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Retry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Retry */ "./lib-esm/Util/Retry.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "NonRetryableError", function() { return _Retry__WEBPACK_IMPORTED_MODULE_0__["NonRetryableError"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "retry", function() { return _Retry__WEBPACK_IMPORTED_MODULE_0__["retry"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "jitteredExponentialRetry", function() { return _Retry__WEBPACK_IMPORTED_MODULE_0__["jitteredExponentialRetry"]; });

/* harmony import */ var _Mutex__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Mutex */ "./lib-esm/Util/Mutex.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Mutex", function() { return _Mutex__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _Reachability__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Reachability */ "./lib-esm/Util/Reachability.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Reachability", function() { return _Reachability__WEBPACK_IMPORTED_MODULE_2__["default"]; });





/***/ }),

/***/ "./lib-esm/constants.js":
/*!******************************!*\
  !*** ./lib-esm/constants.js ***!
  \******************************/
/*! exports provided: INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER, INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER, USER_AGENT_HEADER */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER", function() { return INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER", function() { return INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "USER_AGENT_HEADER", function() { return USER_AGENT_HEADER; });
/*
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

/**
 * This Symbol is used to reference an internal-only PubSub provider that
 * is used for AppSync/GraphQL subscriptions in the API category.
 */
var hasSymbol = typeof Symbol !== 'undefined' && typeof Symbol["for"] === 'function';
var INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER = hasSymbol ? Symbol["for"]('INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER') : '@@INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER';
var INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER = hasSymbol ? Symbol["for"]('INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER') : '@@INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER';
var USER_AGENT_HEADER = 'x-amz-user-agent';

/***/ }),

/***/ "./lib-esm/index.js":
/*!**************************!*\
  !*** ./lib-esm/index.js ***!
  \**************************/
/*! exports provided: AWS, ClientDevice, ConsoleLogger, Logger, missingConfig, invalidParameter, Hub, I18n, JS, Signer, Parser, FacebookOAuth, GoogleOAuth, Linking, AppState, AsyncStorage, Credentials, ServiceWorker, StorageHelper, MemoryStorage, Platform, Constants, INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER, INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER, USER_AGENT_HEADER, default, NonRetryableError, retry, jitteredExponentialRetry, Mutex, Reachability */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Constants", function() { return Constants; });
/* harmony import */ var _Facet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Facet */ "./lib-esm/Facet.js");
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Logger */ "./lib-esm/Logger/index.js");
/* harmony import */ var _Amplify__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Amplify */ "./lib-esm/Amplify.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AWS", function() { return _Facet__WEBPACK_IMPORTED_MODULE_0__["AWS"]; });

/* harmony import */ var _ClientDevice__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ClientDevice */ "./lib-esm/ClientDevice/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ClientDevice", function() { return _ClientDevice__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ConsoleLogger", function() { return _Logger__WEBPACK_IMPORTED_MODULE_1__["ConsoleLogger"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Logger", function() { return _Logger__WEBPACK_IMPORTED_MODULE_1__["ConsoleLogger"]; });

/* harmony import */ var _Errors__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Errors */ "./lib-esm/Errors.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "missingConfig", function() { return _Errors__WEBPACK_IMPORTED_MODULE_4__["missingConfig"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "invalidParameter", function() { return _Errors__WEBPACK_IMPORTED_MODULE_4__["invalidParameter"]; });

/* harmony import */ var _Hub__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Hub */ "./lib-esm/Hub.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Hub", function() { return _Hub__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _I18n__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./I18n */ "./lib-esm/I18n/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "I18n", function() { return _I18n__WEBPACK_IMPORTED_MODULE_6__["default"]; });

/* harmony import */ var _JS__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./JS */ "./lib-esm/JS.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "JS", function() { return _JS__WEBPACK_IMPORTED_MODULE_7__["default"]; });

/* harmony import */ var _Signer__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Signer */ "./lib-esm/Signer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Signer", function() { return _Signer__WEBPACK_IMPORTED_MODULE_8__["default"]; });

/* harmony import */ var _Parser__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Parser */ "./lib-esm/Parser.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Parser", function() { return _Parser__WEBPACK_IMPORTED_MODULE_9__["default"]; });

/* harmony import */ var _OAuthHelper__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./OAuthHelper */ "./lib-esm/OAuthHelper/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FacebookOAuth", function() { return _OAuthHelper__WEBPACK_IMPORTED_MODULE_10__["FacebookOAuth"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GoogleOAuth", function() { return _OAuthHelper__WEBPACK_IMPORTED_MODULE_10__["GoogleOAuth"]; });

/* harmony import */ var _RNComponents__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./RNComponents */ "./lib-esm/RNComponents/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Linking", function() { return _RNComponents__WEBPACK_IMPORTED_MODULE_11__["Linking"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AppState", function() { return _RNComponents__WEBPACK_IMPORTED_MODULE_11__["AppState"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AsyncStorage", function() { return _RNComponents__WEBPACK_IMPORTED_MODULE_11__["AsyncStorage"]; });

/* harmony import */ var _Credentials__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./Credentials */ "./lib-esm/Credentials.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Credentials", function() { return _Credentials__WEBPACK_IMPORTED_MODULE_12__["default"]; });

/* harmony import */ var _ServiceWorker__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./ServiceWorker */ "./lib-esm/ServiceWorker/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ServiceWorker", function() { return _ServiceWorker__WEBPACK_IMPORTED_MODULE_13__["default"]; });

/* harmony import */ var _StorageHelper__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./StorageHelper */ "./lib-esm/StorageHelper/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "StorageHelper", function() { return _StorageHelper__WEBPACK_IMPORTED_MODULE_14__["default"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MemoryStorage", function() { return _StorageHelper__WEBPACK_IMPORTED_MODULE_14__["MemoryStorage"]; });

/* harmony import */ var _Platform__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./Platform */ "./lib-esm/Platform/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Platform", function() { return _Platform__WEBPACK_IMPORTED_MODULE_15__["default"]; });

/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./constants */ "./lib-esm/constants.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER", function() { return _constants__WEBPACK_IMPORTED_MODULE_16__["INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER", function() { return _constants__WEBPACK_IMPORTED_MODULE_16__["INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "USER_AGENT_HEADER", function() { return _constants__WEBPACK_IMPORTED_MODULE_16__["USER_AGENT_HEADER"]; });

/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./Util */ "./lib-esm/Util/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "NonRetryableError", function() { return _Util__WEBPACK_IMPORTED_MODULE_17__["NonRetryableError"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "retry", function() { return _Util__WEBPACK_IMPORTED_MODULE_17__["retry"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "jitteredExponentialRetry", function() { return _Util__WEBPACK_IMPORTED_MODULE_17__["jitteredExponentialRetry"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Mutex", function() { return _Util__WEBPACK_IMPORTED_MODULE_17__["Mutex"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Reachability", function() { return _Util__WEBPACK_IMPORTED_MODULE_17__["Reachability"]; });

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



















var Constants = {
  userAgent: _Platform__WEBPACK_IMPORTED_MODULE_15__["default"].userAgent
};

/* harmony default export */ __webpack_exports__["default"] = (_Amplify__WEBPACK_IMPORTED_MODULE_2__["default"]);

var logger = new _Logger__WEBPACK_IMPORTED_MODULE_1__["ConsoleLogger"]('Core');

if (_Facet__WEBPACK_IMPORTED_MODULE_0__["AWS"]['util']) {
  _Facet__WEBPACK_IMPORTED_MODULE_0__["AWS"]['util'].userAgent = function () {
    return Constants.userAgent;
  };
} else if (_Facet__WEBPACK_IMPORTED_MODULE_0__["AWS"].config) {
  _Facet__WEBPACK_IMPORTED_MODULE_0__["AWS"].config.update({
    customUserAgent: Constants.userAgent
  });
} else {
  logger.warn('No AWS.config');
}

/***/ }),

/***/ "./package.json":
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/*! exports provided: name, version, description, main, module, typings, publishConfig, scripts, react-native, repository, author, license, bugs, homepage, devDependencies, dependencies, jest, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"name\":\"@aws-amplify/core\",\"version\":\"2.2.2\",\"description\":\"Core category of aws-amplify\",\"main\":\"./lib/index.js\",\"module\":\"./lib-esm/index.js\",\"typings\":\"./lib-esm/index.d.ts\",\"publishConfig\":{\"access\":\"public\"},\"scripts\":{\"test\":\"tslint 'src/**/*.ts' && jest -w 1 --coverage\",\"build-with-test\":\"npm test && npm run build\",\"build:cjs\":\"node ./build es5 && webpack && webpack --config ./webpack.config.dev.js\",\"build:esm\":\"node ./build es6\",\"build:cjs:watch\":\"node ./build es5 --watch\",\"build:esm:watch\":\"node ./build es6 --watch\",\"build\":\"npm run clean && npm run build:esm && npm run build:cjs\",\"clean\":\"rimraf lib-esm lib dist\",\"format\":\"echo \\\"Not implemented\\\"\",\"lint\":\"tslint 'src/**/*.ts'\"},\"react-native\":{\"./index\":\"./lib/index.js\",\"./lib/ClientDevice\":\"./lib/ClientDevice/reactnative.js\",\"./lib/RNComponents\":\"./lib/RNComponents/reactnative.js\",\"./lib/StorageHelper\":\"./lib/StorageHelper/reactnative.js\"},\"repository\":{\"type\":\"git\",\"url\":\"https://github.com/aws-amplify/amplify-js.git\"},\"author\":\"Amazon Web Services\",\"license\":\"Apache-2.0\",\"bugs\":{\"url\":\"https://github.com/aws/aws-amplify/issues\"},\"homepage\":\"https://aws-amplify.github.io/\",\"devDependencies\":{\"find\":\"^0.2.7\",\"prepend-file\":\"^1.3.1\"},\"dependencies\":{\"aws-sdk\":\"2.518.0\",\"url\":\"^0.11.0\",\"zen-observable\":\"^0.8.6\"},\"jest\":{\"globals\":{\"ts-jest\":{\"diagnostics\":false,\"tsConfig\":{\"lib\":[\"es5\",\"es2015\",\"dom\",\"esnext.asynciterable\",\"es2017.object\"],\"allowJs\":true}}},\"transform\":{\"^.+\\\\.(js|jsx|ts|tsx)$\":\"ts-jest\"},\"testRegex\":\"(/__tests__/.*|\\\\.(test|spec))\\\\.(tsx?|jsx?)$\",\"moduleFileExtensions\":[\"ts\",\"tsx\",\"js\",\"json\",\"jsx\"],\"testEnvironment\":\"jsdom\",\"coverageThreshold\":{\"global\":{\"branches\":0,\"functions\":0,\"lines\":0,\"statements\":0}},\"testURL\":\"http://localhost/\",\"coveragePathIgnorePatterns\":[\"/node_modules/\"]}}");

/***/ }),

/***/ "aws-sdk/global":
/*!*********************************!*\
  !*** external "aws-sdk/global" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_aws_sdk_global__;

/***/ })

/******/ });
});
//# sourceMappingURL=aws-amplify-core.js.map