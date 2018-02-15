/*!
 * Copyright 2016 Amazon.com,
 * Inc. or its affiliates. All Rights Reserved.
 * 
 * Licensed under the Amazon Software License (the "License").
 * You may not use this file except in compliance with the
 * License. A copy of the License is located at
 * 
 *     http://aws.amazon.com/asl/
 * 
 * or in the "license" file accompanying this file. This file is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, express or implied. See the License
 * for the specific language governing permissions and
 * limitations under the License. 
 */


(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["AmazonCognitoIdentity"] = factory();
	else
		root["AmazonCognitoIdentity"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _AuthenticationDetails = __webpack_require__(19);

	Object.defineProperty(exports, 'AuthenticationDetails', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_AuthenticationDetails).default;
	  }
	});

	var _AuthenticationHelper = __webpack_require__(3);

	Object.defineProperty(exports, 'AuthenticationHelper', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_AuthenticationHelper).default;
	  }
	});

	var _CognitoAccessToken = __webpack_require__(5);

	Object.defineProperty(exports, 'CognitoAccessToken', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CognitoAccessToken).default;
	  }
	});

	var _CognitoIdToken = __webpack_require__(6);

	Object.defineProperty(exports, 'CognitoIdToken', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CognitoIdToken).default;
	  }
	});

	var _CognitoRefreshToken = __webpack_require__(8);

	Object.defineProperty(exports, 'CognitoRefreshToken', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CognitoRefreshToken).default;
	  }
	});

	var _CognitoUser = __webpack_require__(9);

	Object.defineProperty(exports, 'CognitoUser', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CognitoUser).default;
	  }
	});

	var _CognitoUserAttribute = __webpack_require__(10);

	Object.defineProperty(exports, 'CognitoUserAttribute', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CognitoUserAttribute).default;
	  }
	});

	var _CognitoUserPool = __webpack_require__(21);

	Object.defineProperty(exports, 'CognitoUserPool', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CognitoUserPool).default;
	  }
	});

	var _CognitoUserSession = __webpack_require__(11);

	Object.defineProperty(exports, 'CognitoUserSession', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CognitoUserSession).default;
	  }
	});

	var _CookieStorage = __webpack_require__(22);

	Object.defineProperty(exports, 'CookieStorage', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CookieStorage).default;
	  }
	});

	var _DateHelper = __webpack_require__(12);

	Object.defineProperty(exports, 'DateHelper', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_DateHelper).default;
	  }
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(15)
	var ieee754 = __webpack_require__(16)
	var isArray = __webpack_require__(17)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	/*
	 * Export kMaxLength after typed array support is determined.
	 */
	exports.kMaxLength = kMaxLength()

	function typedArraySupport () {
	  try {
	    var arr = new Uint8Array(1)
	    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
	    return arr.foo() === 42 && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	function createBuffer (that, length) {
	  if (kMaxLength() < length) {
	    throw new RangeError('Invalid typed array length')
	  }
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(length)
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    if (that === null) {
	      that = new Buffer(length)
	    }
	    that.length = length
	  }

	  return that
	}

	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */

	function Buffer (arg, encodingOrOffset, length) {
	  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
	    return new Buffer(arg, encodingOrOffset, length)
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new Error(
	        'If encoding is specified then the first argument must be a string'
	      )
	    }
	    return allocUnsafe(this, arg)
	  }
	  return from(this, arg, encodingOrOffset, length)
	}

	Buffer.poolSize = 8192 // not used by this implementation

	// TODO: Legacy, not needed anymore. Remove in next major version.
	Buffer._augment = function (arr) {
	  arr.__proto__ = Buffer.prototype
	  return arr
	}

	function from (that, value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }

	  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
	    return fromArrayBuffer(that, value, encodingOrOffset, length)
	  }

	  if (typeof value === 'string') {
	    return fromString(that, value, encodingOrOffset)
	  }

	  return fromObject(that, value)
	}

	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	  return from(null, value, encodingOrOffset, length)
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	  if (typeof Symbol !== 'undefined' && Symbol.species &&
	      Buffer[Symbol.species] === Buffer) {
	    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
	    Object.defineProperty(Buffer, Symbol.species, {
	      value: null,
	      configurable: true
	    })
	  }
	}

	function assertSize (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be a number')
	  } else if (size < 0) {
	    throw new RangeError('"size" argument must not be negative')
	  }
	}

	function alloc (that, size, fill, encoding) {
	  assertSize(size)
	  if (size <= 0) {
	    return createBuffer(that, size)
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpretted as a start offset.
	    return typeof encoding === 'string'
	      ? createBuffer(that, size).fill(fill, encoding)
	      : createBuffer(that, size).fill(fill)
	  }
	  return createBuffer(that, size)
	}

	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	  return alloc(null, size, fill, encoding)
	}

	function allocUnsafe (that, size) {
	  assertSize(size)
	  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < size; ++i) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	  return allocUnsafe(null, size)
	}
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	  return allocUnsafe(null, size)
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8'
	  }

	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }

	  var length = byteLength(string, encoding) | 0
	  that = createBuffer(that, length)

	  var actual = that.write(string, encoding)

	  if (actual !== length) {
	    // Writing a hex string, for example, that contains invalid characters will
	    // cause everything after the first invalid character to be ignored. (e.g.
	    // 'abxxcd' will be treated as 'ab')
	    that = that.slice(0, actual)
	  }

	  return that
	}

	function fromArrayLike (that, array) {
	  var length = array.length < 0 ? 0 : checked(array.length) | 0
	  that = createBuffer(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array, byteOffset, length) {
	  array.byteLength // this throws if `array` is not a valid ArrayBuffer

	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('\'offset\' is out of bounds')
	  }

	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('\'length\' is out of bounds')
	  }

	  if (byteOffset === undefined && length === undefined) {
	    array = new Uint8Array(array)
	  } else if (length === undefined) {
	    array = new Uint8Array(array, byteOffset)
	  } else {
	    array = new Uint8Array(array, byteOffset, length)
	  }

	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = array
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromArrayLike(that, array)
	  }
	  return that
	}

	function fromObject (that, obj) {
	  if (Buffer.isBuffer(obj)) {
	    var len = checked(obj.length) | 0
	    that = createBuffer(that, len)

	    if (that.length === 0) {
	      return that
	    }

	    obj.copy(that, 0, 0, len)
	    return that
	  }

	  if (obj) {
	    if ((typeof ArrayBuffer !== 'undefined' &&
	        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
	      if (typeof obj.length !== 'number' || isnan(obj.length)) {
	        return createBuffer(that, 0)
	      }
	      return fromArrayLike(that, obj)
	    }

	    if (obj.type === 'Buffer' && isArray(obj.data)) {
	      return fromArrayLike(that, obj.data)
	    }
	  }

	  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength()` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (length) {
	  if (+length != length) { // eslint-disable-line eqeqeq
	    length = 0
	  }
	  return Buffer.alloc(+length)
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i]
	      y = b[i]
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'latin1':
	    case 'binary':
	    case 'base64':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers')
	  }

	  if (list.length === 0) {
	    return Buffer.alloc(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; ++i) {
	      length += list[i].length
	    }
	  }

	  var buffer = Buffer.allocUnsafe(length)
	  var pos = 0
	  for (i = 0; i < list.length; ++i) {
	    var buf = list[i]
	    if (!Buffer.isBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers')
	    }
	    buf.copy(buffer, pos)
	    pos += buf.length
	  }
	  return buffer
	}

	function byteLength (string, encoding) {
	  if (Buffer.isBuffer(string)) {
	    return string.length
	  }
	  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
	      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
	    return string.byteLength
	  }
	  if (typeof string !== 'string') {
	    string = '' + string
	  }

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return len
	      case 'utf8':
	      case 'utf-8':
	      case undefined:
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.

	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return ''
	  }

	  if (end === undefined || end > this.length) {
	    end = this.length
	  }

	  if (end <= 0) {
	    return ''
	  }

	  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0
	  start >>>= 0

	  if (end <= start) {
	    return ''
	  }

	  if (!encoding) encoding = 'utf8'

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'latin1':
	      case 'binary':
	        return latin1Slice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
	// Buffer instances.
	Buffer.prototype._isBuffer = true

	function swap (b, n, m) {
	  var i = b[n]
	  b[n] = b[m]
	  b[m] = i
	}

	Buffer.prototype.swap16 = function swap16 () {
	  var len = this.length
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits')
	  }
	  for (var i = 0; i < len; i += 2) {
	    swap(this, i, i + 1)
	  }
	  return this
	}

	Buffer.prototype.swap32 = function swap32 () {
	  var len = this.length
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits')
	  }
	  for (var i = 0; i < len; i += 4) {
	    swap(this, i, i + 3)
	    swap(this, i + 1, i + 2)
	  }
	  return this
	}

	Buffer.prototype.swap64 = function swap64 () {
	  var len = this.length
	  if (len % 8 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 64-bits')
	  }
	  for (var i = 0; i < len; i += 8) {
	    swap(this, i, i + 7)
	    swap(this, i + 1, i + 6)
	    swap(this, i + 2, i + 5)
	    swap(this, i + 3, i + 4)
	  }
	  return this
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	  if (!Buffer.isBuffer(target)) {
	    throw new TypeError('Argument must be a Buffer')
	  }

	  if (start === undefined) {
	    start = 0
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0
	  }
	  if (thisStart === undefined) {
	    thisStart = 0
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length
	  }

	  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	    throw new RangeError('out of range index')
	  }

	  if (thisStart >= thisEnd && start >= end) {
	    return 0
	  }
	  if (thisStart >= thisEnd) {
	    return -1
	  }
	  if (start >= end) {
	    return 1
	  }

	  start >>>= 0
	  end >>>= 0
	  thisStart >>>= 0
	  thisEnd >>>= 0

	  if (this === target) return 0

	  var x = thisEnd - thisStart
	  var y = end - start
	  var len = Math.min(x, y)

	  var thisCopy = this.slice(thisStart, thisEnd)
	  var targetCopy = target.slice(start, end)

	  for (var i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i]
	      y = targetCopy[i]
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	//
	// Arguments:
	// - buffer - a Buffer to search
	// - val - a string, Buffer, or number
	// - byteOffset - an index into `buffer`; will be clamped to an int32
	// - encoding - an optional encoding, relevant is val is a string
	// - dir - true for indexOf, false for lastIndexOf
	function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
	  // Empty buffer means no match
	  if (buffer.length === 0) return -1

	  // Normalize byteOffset
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset
	    byteOffset = 0
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff
	  } else if (byteOffset < -0x80000000) {
	    byteOffset = -0x80000000
	  }
	  byteOffset = +byteOffset  // Coerce to Number.
	  if (isNaN(byteOffset)) {
	    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	    byteOffset = dir ? 0 : (buffer.length - 1)
	  }

	  // Normalize byteOffset: negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
	  if (byteOffset >= buffer.length) {
	    if (dir) return -1
	    else byteOffset = buffer.length - 1
	  } else if (byteOffset < 0) {
	    if (dir) byteOffset = 0
	    else return -1
	  }

	  // Normalize val
	  if (typeof val === 'string') {
	    val = Buffer.from(val, encoding)
	  }

	  // Finally, search either indexOf (if dir is true) or lastIndexOf
	  if (Buffer.isBuffer(val)) {
	    // Special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1
	    }
	    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
	  } else if (typeof val === 'number') {
	    val = val & 0xFF // Search for a byte value [0-255]
	    if (Buffer.TYPED_ARRAY_SUPPORT &&
	        typeof Uint8Array.prototype.indexOf === 'function') {
	      if (dir) {
	        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
	      } else {
	        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
	      }
	    }
	    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
	  var indexSize = 1
	  var arrLength = arr.length
	  var valLength = val.length

	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase()
	    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	        encoding === 'utf16le' || encoding === 'utf-16le') {
	      if (arr.length < 2 || val.length < 2) {
	        return -1
	      }
	      indexSize = 2
	      arrLength /= 2
	      valLength /= 2
	      byteOffset /= 2
	    }
	  }

	  function read (buf, i) {
	    if (indexSize === 1) {
	      return buf[i]
	    } else {
	      return buf.readUInt16BE(i * indexSize)
	    }
	  }

	  var i
	  if (dir) {
	    var foundIndex = -1
	    for (i = byteOffset; i < arrLength; i++) {
	      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
	      } else {
	        if (foundIndex !== -1) i -= i - foundIndex
	        foundIndex = -1
	      }
	    }
	  } else {
	    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
	    for (i = byteOffset; i >= 0; i--) {
	      var found = true
	      for (var j = 0; j < valLength; j++) {
	        if (read(arr, i + j) !== read(val, j)) {
	          found = false
	          break
	        }
	      }
	      if (found) return i
	    }
	  }

	  return -1
	}

	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
	}

	Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; ++i) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) return i
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function latin1Write (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    )
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('Attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'latin1':
	      case 'binary':
	        return latin1Write(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function latin1Slice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; ++i) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = this.subarray(start, end)
	    newBuf.__proto__ = Buffer.prototype
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; ++i) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	  if (offset < 0) throw new RangeError('Index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; --i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; ++i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, start + len),
	      targetStart
	    )
	  }

	  return len
	}

	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill (val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start
	      start = 0
	      end = this.length
	    } else if (typeof end === 'string') {
	      encoding = end
	      end = this.length
	    }
	    if (val.length === 1) {
	      var code = val.charCodeAt(0)
	      if (code < 256) {
	        val = code
	      }
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string')
	    }
	    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding)
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255
	  }

	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index')
	  }

	  if (end <= start) {
	    return this
	  }

	  start = start >>> 0
	  end = end === undefined ? this.length : end >>> 0

	  if (!val) val = 0

	  var i
	  if (typeof val === 'number') {
	    for (i = start; i < end; ++i) {
	      this[i] = val
	    }
	  } else {
	    var bytes = Buffer.isBuffer(val)
	      ? val
	      : utf8ToBytes(new Buffer(val, encoding).toString())
	    var len = bytes.length
	    for (i = 0; i < end - start; ++i) {
	      this[i + start] = bytes[i % len]
	    }
	  }

	  return this
	}

	// HELPER FUNCTIONS
	// ================

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; ++i) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; ++i) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	function isnan (val) {
	  return val !== val // eslint-disable-line no-self-compare
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	var Buffer = __webpack_require__(1).Buffer;
	var intSize = 4;
	var zeroBuffer = new Buffer(intSize); zeroBuffer.fill(0);
	var chrsz = 8;

	function toArray(buf, bigEndian) {
	  if ((buf.length % intSize) !== 0) {
	    var len = buf.length + (intSize - (buf.length % intSize));
	    buf = Buffer.concat([buf, zeroBuffer], len);
	  }

	  var arr = [];
	  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
	  for (var i = 0; i < buf.length; i += intSize) {
	    arr.push(fn.call(buf, i));
	  }
	  return arr;
	}

	function toBuffer(arr, size, bigEndian) {
	  var buf = new Buffer(size);
	  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
	  for (var i = 0; i < arr.length; i++) {
	    fn.call(buf, arr[i], i * 4, true);
	  }
	  return buf;
	}

	function hash(buf, fn, hashSize, bigEndian) {
	  if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
	  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
	  return toBuffer(arr, hashSize, bigEndian);
	}

	module.exports = { hash: hash };


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _buffer = __webpack_require__(1);

	var _cryptoBrowserify = __webpack_require__(14);

	var crypto = _interopRequireWildcard(_cryptoBrowserify);

	var _BigInteger = __webpack_require__(4);

	var _BigInteger2 = _interopRequireDefault(_BigInteger);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /*!
	                                                                                                                                                           * Copyright 2016 Amazon.com,
	                                                                                                                                                           * Inc. or its affiliates. All Rights Reserved.
	                                                                                                                                                           *
	                                                                                                                                                           * Licensed under the Amazon Software License (the "License").
	                                                                                                                                                           * You may not use this file except in compliance with the
	                                                                                                                                                           * License. A copy of the License is located at
	                                                                                                                                                           *
	                                                                                                                                                           *     http://aws.amazon.com/asl/
	                                                                                                                                                           *
	                                                                                                                                                           * or in the "license" file accompanying this file. This file is
	                                                                                                                                                           * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	                                                                                                                                                           * CONDITIONS OF ANY KIND, express or implied. See the License
	                                                                                                                                                           * for the specific language governing permissions and
	                                                                                                                                                           * limitations under the License.
	                                                                                                                                                           */

	var createHash = crypto.createHash;
	var createHmac = crypto.createHmac;
	var randomBytes = crypto.randomBytes;

	var initN = 'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1' + '29024E088A67CC74020BBEA63B139B22514A08798E3404DD' + 'EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245' + 'E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED' + 'EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D' + 'C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F' + '83655D23DCA3AD961C62F356208552BB9ED529077096966D' + '670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B' + 'E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9' + 'DE2BCBF6955817183995497CEA956AE515D2261898FA0510' + '15728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64' + 'ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7' + 'ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6B' + 'F12FFA06D98A0864D87602733EC86A64521F2B18177B200C' + 'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB31' + '43DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF';

	var newPasswordRequiredChallengeUserAttributePrefix = 'userAttributes.';

	/** @class */

	var AuthenticationHelper = function () {
	  /**
	   * Constructs a new AuthenticationHelper object
	   * @param {string} PoolName Cognito user pool name.
	   */
	  function AuthenticationHelper(PoolName) {
	    _classCallCheck(this, AuthenticationHelper);

	    this.N = new _BigInteger2.default(initN, 16);
	    this.g = new _BigInteger2.default('2', 16);
	    this.k = new _BigInteger2.default(this.hexHash('00' + this.N.toString(16) + '0' + this.g.toString(16)), 16);

	    this.smallAValue = this.generateRandomSmallA();
	    this.getLargeAValue(function () {});

	    this.infoBits = _buffer.Buffer.from('Caldera Derived Key', 'utf8');

	    this.poolName = PoolName;
	  }

	  /**
	   * @returns {BigInteger} small A, a random number
	   */


	  AuthenticationHelper.prototype.getSmallAValue = function getSmallAValue() {
	    return this.smallAValue;
	  };

	  /**
	   * @param {nodeCallback<BigInteger>} callback Called with (err, largeAValue)
	   * @returns {void}
	   */


	  AuthenticationHelper.prototype.getLargeAValue = function getLargeAValue(callback) {
	    var _this = this;

	    if (this.largeAValue) {
	      callback(null, this.largeAValue);
	    } else {
	      this.calculateA(this.smallAValue, function (err, largeAValue) {
	        if (err) {
	          callback(err, null);
	        }

	        _this.largeAValue = largeAValue;
	        callback(null, _this.largeAValue);
	      });
	    }
	  };

	  /**
	   * helper function to generate a random big integer
	   * @returns {BigInteger} a random value.
	   * @private
	   */


	  AuthenticationHelper.prototype.generateRandomSmallA = function generateRandomSmallA() {
	    var hexRandom = randomBytes(128).toString('hex');

	    var randomBigInt = new _BigInteger2.default(hexRandom, 16);
	    var smallABigInt = randomBigInt.mod(this.N);

	    return smallABigInt;
	  };

	  /**
	   * helper function to generate a random string
	   * @returns {string} a random value.
	   * @private
	   */


	  AuthenticationHelper.prototype.generateRandomString = function generateRandomString() {
	    return randomBytes(40).toString('base64');
	  };

	  /**
	   * @returns {string} Generated random value included in password hash.
	   */


	  AuthenticationHelper.prototype.getRandomPassword = function getRandomPassword() {
	    return this.randomPassword;
	  };

	  /**
	   * @returns {string} Generated random value included in devices hash.
	   */


	  AuthenticationHelper.prototype.getSaltDevices = function getSaltDevices() {
	    return this.SaltToHashDevices;
	  };

	  /**
	   * @returns {string} Value used to verify devices.
	   */


	  AuthenticationHelper.prototype.getVerifierDevices = function getVerifierDevices() {
	    return this.verifierDevices;
	  };

	  /**
	   * Generate salts and compute verifier.
	   * @param {string} deviceGroupKey Devices to generate verifier for.
	   * @param {string} username User to generate verifier for.
	   * @param {nodeCallback<null>} callback Called with (err, null)
	   * @returns {void}
	   */


	  AuthenticationHelper.prototype.generateHashDevice = function generateHashDevice(deviceGroupKey, username, callback) {
	    var _this2 = this;

	    this.randomPassword = this.generateRandomString();
	    var combinedString = '' + deviceGroupKey + username + ':' + this.randomPassword;
	    var hashedString = this.hash(combinedString);

	    var hexRandom = randomBytes(16).toString('hex');
	    this.SaltToHashDevices = this.padHex(new _BigInteger2.default(hexRandom, 16));

	    this.g.modPow(new _BigInteger2.default(this.hexHash(this.SaltToHashDevices + hashedString), 16), this.N, function (err, verifierDevicesNotPadded) {
	      if (err) {
	        callback(err, null);
	      }

	      _this2.verifierDevices = _this2.padHex(verifierDevicesNotPadded);
	      callback(null, null);
	    });
	  };

	  /**
	   * Calculate the client's public value A = g^a%N
	   * with the generated random number a
	   * @param {BigInteger} a Randomly generated small A.
	   * @param {nodeCallback<BigInteger>} callback Called with (err, largeAValue)
	   * @returns {void}
	   * @private
	   */


	  AuthenticationHelper.prototype.calculateA = function calculateA(a, callback) {
	    var _this3 = this;

	    this.g.modPow(a, this.N, function (err, A) {
	      if (err) {
	        callback(err, null);
	      }

	      if (A.mod(_this3.N).equals(_BigInteger2.default.ZERO)) {
	        callback(new Error('Illegal paramater. A mod N cannot be 0.'), null);
	      }

	      callback(null, A);
	    });
	  };

	  /**
	   * Calculate the client's value U which is the hash of A and B
	   * @param {BigInteger} A Large A value.
	   * @param {BigInteger} B Server B value.
	   * @returns {BigInteger} Computed U value.
	   * @private
	   */


	  AuthenticationHelper.prototype.calculateU = function calculateU(A, B) {
	    this.UHexHash = this.hexHash(this.padHex(A) + this.padHex(B));
	    var finalU = new _BigInteger2.default(this.UHexHash, 16);

	    return finalU;
	  };

	  /**
	   * Calculate a hash from a bitArray
	   * @param {Buffer} buf Value to hash.
	   * @returns {String} Hex-encoded hash.
	   * @private
	   */


	  AuthenticationHelper.prototype.hash = function hash(buf) {
	    var hashHex = createHash('sha256').update(buf).digest('hex');
	    return new Array(64 - hashHex.length).join('0') + hashHex;
	  };

	  /**
	   * Calculate a hash from a hex string
	   * @param {String} hexStr Value to hash.
	   * @returns {String} Hex-encoded hash.
	   * @private
	   */


	  AuthenticationHelper.prototype.hexHash = function hexHash(hexStr) {
	    return this.hash(_buffer.Buffer.from(hexStr, 'hex'));
	  };

	  /**
	   * Standard hkdf algorithm
	   * @param {Buffer} ikm Input key material.
	   * @param {Buffer} salt Salt value.
	   * @returns {Buffer} Strong key material.
	   * @private
	   */


	  AuthenticationHelper.prototype.computehkdf = function computehkdf(ikm, salt) {
	    var prk = createHmac('sha256', salt).update(ikm).digest();
	    var infoBitsUpdate = _buffer.Buffer.concat([this.infoBits, _buffer.Buffer.from(String.fromCharCode(1), 'utf8')]);
	    var hmac = createHmac('sha256', prk).update(infoBitsUpdate).digest();
	    return hmac.slice(0, 16);
	  };

	  /**
	   * Calculates the final hkdf based on computed S value, and computed U value and the key
	   * @param {String} username Username.
	   * @param {String} password Password.
	   * @param {BigInteger} serverBValue Server B value.
	   * @param {BigInteger} salt Generated salt.
	   * @param {nodeCallback<Buffer>} callback Called with (err, hkdfValue)
	   * @returns {void}
	   */


	  AuthenticationHelper.prototype.getPasswordAuthenticationKey = function getPasswordAuthenticationKey(username, password, serverBValue, salt, callback) {
	    var _this4 = this;

	    if (serverBValue.mod(this.N).equals(_BigInteger2.default.ZERO)) {
	      throw new Error('B cannot be zero.');
	    }

	    this.UValue = this.calculateU(this.largeAValue, serverBValue);

	    if (this.UValue.equals(_BigInteger2.default.ZERO)) {
	      throw new Error('U cannot be zero.');
	    }

	    var usernamePassword = '' + this.poolName + username + ':' + password;
	    var usernamePasswordHash = this.hash(usernamePassword);

	    var xValue = new _BigInteger2.default(this.hexHash(this.padHex(salt) + usernamePasswordHash), 16);
	    this.calculateS(xValue, serverBValue, function (err, sValue) {
	      if (err) {
	        callback(err, null);
	      }

	      var hkdf = _this4.computehkdf(_buffer.Buffer.from(_this4.padHex(sValue), 'hex'), _buffer.Buffer.from(_this4.padHex(_this4.UValue.toString(16)), 'hex'));

	      callback(null, hkdf);
	    });
	  };

	  /**
	   * Calculates the S value used in getPasswordAuthenticationKey
	   * @param {BigInteger} xValue Salted password hash value.
	   * @param {BigInteger} serverBValue Server B value.
	   * @param {nodeCallback<string>} callback Called on success or error.
	   * @returns {void}
	   */


	  AuthenticationHelper.prototype.calculateS = function calculateS(xValue, serverBValue, callback) {
	    var _this5 = this;

	    this.g.modPow(xValue, this.N, function (err, gModPowXN) {
	      if (err) {
	        callback(err, null);
	      }

	      var intValue2 = serverBValue.subtract(_this5.k.multiply(gModPowXN));
	      intValue2.modPow(_this5.smallAValue.add(_this5.UValue.multiply(xValue)), _this5.N, function (err2, result) {
	        if (err2) {
	          callback(err2, null);
	        }

	        callback(null, result.mod(_this5.N));
	      });
	    });
	  };

	  /**
	  * Return constant newPasswordRequiredChallengeUserAttributePrefix
	  * @return {newPasswordRequiredChallengeUserAttributePrefix} constant prefix value
	  */


	  AuthenticationHelper.prototype.getNewPasswordRequiredChallengeUserAttributePrefix = function getNewPasswordRequiredChallengeUserAttributePrefix() {
	    return newPasswordRequiredChallengeUserAttributePrefix;
	  };

	  /**
	   * Converts a BigInteger (or hex string) to hex format padded with zeroes for hashing
	   * @param {BigInteger|String} bigInt Number or string to pad.
	   * @returns {String} Padded hex string.
	   */


	  AuthenticationHelper.prototype.padHex = function padHex(bigInt) {
	    var hashStr = bigInt.toString(16);
	    if (hashStr.length % 2 === 1) {
	      hashStr = '0' + hashStr;
	    } else if ('89ABCDEFabcdef'.indexOf(hashStr[0]) !== -1) {
	      hashStr = '00' + hashStr;
	    }
	    return hashStr;
	  };

	  return AuthenticationHelper;
	}();

	exports.default = AuthenticationHelper;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	"use strict";

	exports.__esModule = true;
	// A small implementation of BigInteger based on http://www-cs-students.stanford.edu/~tjw/jsbn/
	//
	// All public methods have been removed except the following:
	//   new BigInteger(a, b) (only radix 2, 4, 8, 16 and 32 supported)
	//   toString (only radix 2, 4, 8, 16 and 32 supported)
	//   negate
	//   abs
	//   compareTo
	//   bitLength
	//   mod
	//   equals
	//   add
	//   subtract
	//   multiply
	//   divide
	//   modPow

	exports.default = BigInteger;

	/*
	 * Copyright (c) 2003-2005  Tom Wu
	 * All Rights Reserved.
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining
	 * a copy of this software and associated documentation files (the
	 * "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish,
	 * distribute, sublicense, and/or sell copies of the Software, and to
	 * permit persons to whom the Software is furnished to do so, subject to
	 * the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be
	 * included in all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND,
	 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY
	 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
	 *
	 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
	 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
	 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
	 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
	 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
	 *
	 * In addition, the following condition applies:
	 *
	 * All redistributions must retain an intact copy of this copyright notice
	 * and disclaimer.
	 */

	// (public) Constructor

	function BigInteger(a, b) {
	  if (a != null) this.fromString(a, b);
	}

	// return new, unset BigInteger
	function nbi() {
	  return new BigInteger(null);
	}

	// Bits per digit
	var dbits;

	// JavaScript engine analysis
	var canary = 0xdeadbeefcafe;
	var j_lm = (canary & 0xffffff) == 0xefcafe;

	// am: Compute w_j += (x*this_i), propagate carries,
	// c is initial carry, returns final carry.
	// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
	// We need to select the fastest one that works in this environment.

	// am1: use a single mult and divide to get the high bits,
	// max digit bits should be 26 because
	// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
	function am1(i, x, w, j, c, n) {
	  while (--n >= 0) {
	    var v = x * this[i++] + w[j] + c;
	    c = Math.floor(v / 0x4000000);
	    w[j++] = v & 0x3ffffff;
	  }
	  return c;
	}
	// am2 avoids a big mult-and-extract completely.
	// Max digit bits should be <= 30 because we do bitwise ops
	// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
	function am2(i, x, w, j, c, n) {
	  var xl = x & 0x7fff,
	      xh = x >> 15;
	  while (--n >= 0) {
	    var l = this[i] & 0x7fff;
	    var h = this[i++] >> 15;
	    var m = xh * l + h * xl;
	    l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
	    c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
	    w[j++] = l & 0x3fffffff;
	  }
	  return c;
	}
	// Alternately, set max digit bits to 28 since some
	// browsers slow down when dealing with 32-bit numbers.
	function am3(i, x, w, j, c, n) {
	  var xl = x & 0x3fff,
	      xh = x >> 14;
	  while (--n >= 0) {
	    var l = this[i] & 0x3fff;
	    var h = this[i++] >> 14;
	    var m = xh * l + h * xl;
	    l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
	    c = (l >> 28) + (m >> 14) + xh * h;
	    w[j++] = l & 0xfffffff;
	  }
	  return c;
	}
	var inBrowser = typeof navigator !== "undefined";
	if (inBrowser && j_lm && navigator.appName == "Microsoft Internet Explorer") {
	  BigInteger.prototype.am = am2;
	  dbits = 30;
	} else if (inBrowser && j_lm && navigator.appName != "Netscape") {
	  BigInteger.prototype.am = am1;
	  dbits = 26;
	} else {
	  // Mozilla/Netscape seems to prefer am3
	  BigInteger.prototype.am = am3;
	  dbits = 28;
	}

	BigInteger.prototype.DB = dbits;
	BigInteger.prototype.DM = (1 << dbits) - 1;
	BigInteger.prototype.DV = 1 << dbits;

	var BI_FP = 52;
	BigInteger.prototype.FV = Math.pow(2, BI_FP);
	BigInteger.prototype.F1 = BI_FP - dbits;
	BigInteger.prototype.F2 = 2 * dbits - BI_FP;

	// Digit conversions
	var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
	var BI_RC = new Array();
	var rr, vv;
	rr = "0".charCodeAt(0);
	for (vv = 0; vv <= 9; ++vv) {
	  BI_RC[rr++] = vv;
	}rr = "a".charCodeAt(0);
	for (vv = 10; vv < 36; ++vv) {
	  BI_RC[rr++] = vv;
	}rr = "A".charCodeAt(0);
	for (vv = 10; vv < 36; ++vv) {
	  BI_RC[rr++] = vv;
	}function int2char(n) {
	  return BI_RM.charAt(n);
	}
	function intAt(s, i) {
	  var c = BI_RC[s.charCodeAt(i)];
	  return c == null ? -1 : c;
	}

	// (protected) copy this to r
	function bnpCopyTo(r) {
	  for (var i = this.t - 1; i >= 0; --i) {
	    r[i] = this[i];
	  }r.t = this.t;
	  r.s = this.s;
	}

	// (protected) set from integer value x, -DV <= x < DV
	function bnpFromInt(x) {
	  this.t = 1;
	  this.s = x < 0 ? -1 : 0;
	  if (x > 0) this[0] = x;else if (x < -1) this[0] = x + this.DV;else this.t = 0;
	}

	// return bigint initialized to value
	function nbv(i) {
	  var r = nbi();

	  r.fromInt(i);

	  return r;
	}

	// (protected) set from string and radix
	function bnpFromString(s, b) {
	  var k;
	  if (b == 16) k = 4;else if (b == 8) k = 3;else if (b == 2) k = 1;else if (b == 32) k = 5;else if (b == 4) k = 2;else throw new Error("Only radix 2, 4, 8, 16, 32 are supported");
	  this.t = 0;
	  this.s = 0;
	  var i = s.length,
	      mi = false,
	      sh = 0;
	  while (--i >= 0) {
	    var x = intAt(s, i);
	    if (x < 0) {
	      if (s.charAt(i) == "-") mi = true;
	      continue;
	    }
	    mi = false;
	    if (sh == 0) this[this.t++] = x;else if (sh + k > this.DB) {
	      this[this.t - 1] |= (x & (1 << this.DB - sh) - 1) << sh;
	      this[this.t++] = x >> this.DB - sh;
	    } else this[this.t - 1] |= x << sh;
	    sh += k;
	    if (sh >= this.DB) sh -= this.DB;
	  }
	  this.clamp();
	  if (mi) BigInteger.ZERO.subTo(this, this);
	}

	// (protected) clamp off excess high words
	function bnpClamp() {
	  var c = this.s & this.DM;
	  while (this.t > 0 && this[this.t - 1] == c) {
	    --this.t;
	  }
	}

	// (public) return string representation in given radix
	function bnToString(b) {
	  if (this.s < 0) return "-" + this.negate().toString();
	  var k;
	  if (b == 16) k = 4;else if (b == 8) k = 3;else if (b == 2) k = 1;else if (b == 32) k = 5;else if (b == 4) k = 2;else throw new Error("Only radix 2, 4, 8, 16, 32 are supported");
	  var km = (1 << k) - 1,
	      d,
	      m = false,
	      r = "",
	      i = this.t;
	  var p = this.DB - i * this.DB % k;
	  if (i-- > 0) {
	    if (p < this.DB && (d = this[i] >> p) > 0) {
	      m = true;
	      r = int2char(d);
	    }
	    while (i >= 0) {
	      if (p < k) {
	        d = (this[i] & (1 << p) - 1) << k - p;
	        d |= this[--i] >> (p += this.DB - k);
	      } else {
	        d = this[i] >> (p -= k) & km;
	        if (p <= 0) {
	          p += this.DB;
	          --i;
	        }
	      }
	      if (d > 0) m = true;
	      if (m) r += int2char(d);
	    }
	  }
	  return m ? r : "0";
	}

	// (public) -this
	function bnNegate() {
	  var r = nbi();

	  BigInteger.ZERO.subTo(this, r);

	  return r;
	}

	// (public) |this|
	function bnAbs() {
	  return this.s < 0 ? this.negate() : this;
	}

	// (public) return + if this > a, - if this < a, 0 if equal
	function bnCompareTo(a) {
	  var r = this.s - a.s;
	  if (r != 0) return r;
	  var i = this.t;
	  r = i - a.t;
	  if (r != 0) return this.s < 0 ? -r : r;
	  while (--i >= 0) {
	    if ((r = this[i] - a[i]) != 0) return r;
	  }return 0;
	}

	// returns bit length of the integer x
	function nbits(x) {
	  var r = 1,
	      t;
	  if ((t = x >>> 16) != 0) {
	    x = t;
	    r += 16;
	  }
	  if ((t = x >> 8) != 0) {
	    x = t;
	    r += 8;
	  }
	  if ((t = x >> 4) != 0) {
	    x = t;
	    r += 4;
	  }
	  if ((t = x >> 2) != 0) {
	    x = t;
	    r += 2;
	  }
	  if ((t = x >> 1) != 0) {
	    x = t;
	    r += 1;
	  }
	  return r;
	}

	// (public) return the number of bits in "this"
	function bnBitLength() {
	  if (this.t <= 0) return 0;
	  return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM);
	}

	// (protected) r = this << n*DB
	function bnpDLShiftTo(n, r) {
	  var i;
	  for (i = this.t - 1; i >= 0; --i) {
	    r[i + n] = this[i];
	  }for (i = n - 1; i >= 0; --i) {
	    r[i] = 0;
	  }r.t = this.t + n;
	  r.s = this.s;
	}

	// (protected) r = this >> n*DB
	function bnpDRShiftTo(n, r) {
	  for (var i = n; i < this.t; ++i) {
	    r[i - n] = this[i];
	  }r.t = Math.max(this.t - n, 0);
	  r.s = this.s;
	}

	// (protected) r = this << n
	function bnpLShiftTo(n, r) {
	  var bs = n % this.DB;
	  var cbs = this.DB - bs;
	  var bm = (1 << cbs) - 1;
	  var ds = Math.floor(n / this.DB),
	      c = this.s << bs & this.DM,
	      i;
	  for (i = this.t - 1; i >= 0; --i) {
	    r[i + ds + 1] = this[i] >> cbs | c;
	    c = (this[i] & bm) << bs;
	  }
	  for (i = ds - 1; i >= 0; --i) {
	    r[i] = 0;
	  }r[ds] = c;
	  r.t = this.t + ds + 1;
	  r.s = this.s;
	  r.clamp();
	}

	// (protected) r = this >> n
	function bnpRShiftTo(n, r) {
	  r.s = this.s;
	  var ds = Math.floor(n / this.DB);
	  if (ds >= this.t) {
	    r.t = 0;
	    return;
	  }
	  var bs = n % this.DB;
	  var cbs = this.DB - bs;
	  var bm = (1 << bs) - 1;
	  r[0] = this[ds] >> bs;
	  for (var i = ds + 1; i < this.t; ++i) {
	    r[i - ds - 1] |= (this[i] & bm) << cbs;
	    r[i - ds] = this[i] >> bs;
	  }
	  if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
	  r.t = this.t - ds;
	  r.clamp();
	}

	// (protected) r = this - a
	function bnpSubTo(a, r) {
	  var i = 0,
	      c = 0,
	      m = Math.min(a.t, this.t);
	  while (i < m) {
	    c += this[i] - a[i];
	    r[i++] = c & this.DM;
	    c >>= this.DB;
	  }
	  if (a.t < this.t) {
	    c -= a.s;
	    while (i < this.t) {
	      c += this[i];
	      r[i++] = c & this.DM;
	      c >>= this.DB;
	    }
	    c += this.s;
	  } else {
	    c += this.s;
	    while (i < a.t) {
	      c -= a[i];
	      r[i++] = c & this.DM;
	      c >>= this.DB;
	    }
	    c -= a.s;
	  }
	  r.s = c < 0 ? -1 : 0;
	  if (c < -1) r[i++] = this.DV + c;else if (c > 0) r[i++] = c;
	  r.t = i;
	  r.clamp();
	}

	// (protected) r = this * a, r != this,a (HAC 14.12)
	// "this" should be the larger one if appropriate.
	function bnpMultiplyTo(a, r) {
	  var x = this.abs(),
	      y = a.abs();
	  var i = x.t;
	  r.t = i + y.t;
	  while (--i >= 0) {
	    r[i] = 0;
	  }for (i = 0; i < y.t; ++i) {
	    r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
	  }r.s = 0;
	  r.clamp();
	  if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
	}

	// (protected) r = this^2, r != this (HAC 14.16)
	function bnpSquareTo(r) {
	  var x = this.abs();
	  var i = r.t = 2 * x.t;
	  while (--i >= 0) {
	    r[i] = 0;
	  }for (i = 0; i < x.t - 1; ++i) {
	    var c = x.am(i, x[i], r, 2 * i, 0, 1);
	    if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
	      r[i + x.t] -= x.DV;
	      r[i + x.t + 1] = 1;
	    }
	  }
	  if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
	  r.s = 0;
	  r.clamp();
	}

	// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
	// r != q, this != m.  q or r may be null.
	function bnpDivRemTo(m, q, r) {
	  var pm = m.abs();
	  if (pm.t <= 0) return;
	  var pt = this.abs();
	  if (pt.t < pm.t) {
	    if (q != null) q.fromInt(0);
	    if (r != null) this.copyTo(r);
	    return;
	  }
	  if (r == null) r = nbi();
	  var y = nbi(),
	      ts = this.s,
	      ms = m.s;
	  var nsh = this.DB - nbits(pm[pm.t - 1]);
	  // normalize modulus
	  if (nsh > 0) {
	    pm.lShiftTo(nsh, y);
	    pt.lShiftTo(nsh, r);
	  } else {
	    pm.copyTo(y);
	    pt.copyTo(r);
	  }
	  var ys = y.t;
	  var y0 = y[ys - 1];
	  if (y0 == 0) return;
	  var yt = y0 * (1 << this.F1) + (ys > 1 ? y[ys - 2] >> this.F2 : 0);
	  var d1 = this.FV / yt,
	      d2 = (1 << this.F1) / yt,
	      e = 1 << this.F2;
	  var i = r.t,
	      j = i - ys,
	      t = q == null ? nbi() : q;
	  y.dlShiftTo(j, t);
	  if (r.compareTo(t) >= 0) {
	    r[r.t++] = 1;
	    r.subTo(t, r);
	  }
	  BigInteger.ONE.dlShiftTo(ys, t);
	  t.subTo(y, y);
	  // "negative" y so we can replace sub with am later
	  while (y.t < ys) {
	    y[y.t++] = 0;
	  }while (--j >= 0) {
	    // Estimate quotient digit
	    var qd = r[--i] == y0 ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
	    if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
	      // Try it out
	      y.dlShiftTo(j, t);
	      r.subTo(t, r);
	      while (r[i] < --qd) {
	        r.subTo(t, r);
	      }
	    }
	  }
	  if (q != null) {
	    r.drShiftTo(ys, q);
	    if (ts != ms) BigInteger.ZERO.subTo(q, q);
	  }
	  r.t = ys;
	  r.clamp();
	  if (nsh > 0) r.rShiftTo(nsh, r);
	  // Denormalize remainder
	  if (ts < 0) BigInteger.ZERO.subTo(r, r);
	}

	// (public) this mod a
	function bnMod(a) {
	  var r = nbi();
	  this.abs().divRemTo(a, null, r);
	  if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
	  return r;
	}

	// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
	// justification:
	//         xy == 1 (mod m)
	//         xy =  1+km
	//   xy(2-xy) = (1+km)(1-km)
	// x[y(2-xy)] = 1-k^2m^2
	// x[y(2-xy)] == 1 (mod m^2)
	// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
	// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
	// JS multiply "overflows" differently from C/C++, so care is needed here.
	function bnpInvDigit() {
	  if (this.t < 1) return 0;
	  var x = this[0];
	  if ((x & 1) == 0) return 0;
	  var y = x & 3;
	  // y == 1/x mod 2^2
	  y = y * (2 - (x & 0xf) * y) & 0xf;
	  // y == 1/x mod 2^4
	  y = y * (2 - (x & 0xff) * y) & 0xff;
	  // y == 1/x mod 2^8
	  y = y * (2 - ((x & 0xffff) * y & 0xffff)) & 0xffff;
	  // y == 1/x mod 2^16
	  // last step - calculate inverse mod DV directly;
	  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
	  y = y * (2 - x * y % this.DV) % this.DV;
	  // y == 1/x mod 2^dbits
	  // we really want the negative inverse, and -DV < y < DV
	  return y > 0 ? this.DV - y : -y;
	}

	function bnEquals(a) {
	  return this.compareTo(a) == 0;
	}

	// (protected) r = this + a
	function bnpAddTo(a, r) {
	  var i = 0,
	      c = 0,
	      m = Math.min(a.t, this.t);
	  while (i < m) {
	    c += this[i] + a[i];
	    r[i++] = c & this.DM;
	    c >>= this.DB;
	  }
	  if (a.t < this.t) {
	    c += a.s;
	    while (i < this.t) {
	      c += this[i];
	      r[i++] = c & this.DM;
	      c >>= this.DB;
	    }
	    c += this.s;
	  } else {
	    c += this.s;
	    while (i < a.t) {
	      c += a[i];
	      r[i++] = c & this.DM;
	      c >>= this.DB;
	    }
	    c += a.s;
	  }
	  r.s = c < 0 ? -1 : 0;
	  if (c > 0) r[i++] = c;else if (c < -1) r[i++] = this.DV + c;
	  r.t = i;
	  r.clamp();
	}

	// (public) this + a
	function bnAdd(a) {
	  var r = nbi();

	  this.addTo(a, r);

	  return r;
	}

	// (public) this - a
	function bnSubtract(a) {
	  var r = nbi();

	  this.subTo(a, r);

	  return r;
	}

	// (public) this * a
	function bnMultiply(a) {
	  var r = nbi();

	  this.multiplyTo(a, r);

	  return r;
	}

	// (public) this / a
	function bnDivide(a) {
	  var r = nbi();

	  this.divRemTo(a, r, null);

	  return r;
	}

	// Montgomery reduction
	function Montgomery(m) {
	  this.m = m;
	  this.mp = m.invDigit();
	  this.mpl = this.mp & 0x7fff;
	  this.mph = this.mp >> 15;
	  this.um = (1 << m.DB - 15) - 1;
	  this.mt2 = 2 * m.t;
	}

	// xR mod m
	function montConvert(x) {
	  var r = nbi();
	  x.abs().dlShiftTo(this.m.t, r);
	  r.divRemTo(this.m, null, r);
	  if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
	  return r;
	}

	// x/R mod m
	function montRevert(x) {
	  var r = nbi();
	  x.copyTo(r);
	  this.reduce(r);
	  return r;
	}

	// x = x/R mod m (HAC 14.32)
	function montReduce(x) {
	  while (x.t <= this.mt2) {
	    // pad x so am has enough room later
	    x[x.t++] = 0;
	  }for (var i = 0; i < this.m.t; ++i) {
	    // faster way of calculating u0 = x[i]*mp mod DV
	    var j = x[i] & 0x7fff;
	    var u0 = j * this.mpl + ((j * this.mph + (x[i] >> 15) * this.mpl & this.um) << 15) & x.DM;
	    // use am to combine the multiply-shift-add into one call
	    j = i + this.m.t;
	    x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
	    // propagate carry
	    while (x[j] >= x.DV) {
	      x[j] -= x.DV;
	      x[++j]++;
	    }
	  }
	  x.clamp();
	  x.drShiftTo(this.m.t, x);
	  if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
	}

	// r = "x^2/R mod m"; x != r
	function montSqrTo(x, r) {
	  x.squareTo(r);

	  this.reduce(r);
	}

	// r = "xy/R mod m"; x,y != r
	function montMulTo(x, y, r) {
	  x.multiplyTo(y, r);

	  this.reduce(r);
	}

	Montgomery.prototype.convert = montConvert;
	Montgomery.prototype.revert = montRevert;
	Montgomery.prototype.reduce = montReduce;
	Montgomery.prototype.mulTo = montMulTo;
	Montgomery.prototype.sqrTo = montSqrTo;

	// (public) this^e % m (HAC 14.85)
	function bnModPow(e, m, callback) {
	  var i = e.bitLength(),
	      k,
	      r = nbv(1),
	      z = new Montgomery(m);
	  if (i <= 0) return r;else if (i < 18) k = 1;else if (i < 48) k = 3;else if (i < 144) k = 4;else if (i < 768) k = 5;else k = 6;

	  // precomputation
	  var g = new Array(),
	      n = 3,
	      k1 = k - 1,
	      km = (1 << k) - 1;
	  g[1] = z.convert(this);
	  if (k > 1) {
	    var g2 = nbi();
	    z.sqrTo(g[1], g2);
	    while (n <= km) {
	      g[n] = nbi();
	      z.mulTo(g2, g[n - 2], g[n]);
	      n += 2;
	    }
	  }

	  var j = e.t - 1,
	      w,
	      is1 = true,
	      r2 = nbi(),
	      t;
	  i = nbits(e[j]) - 1;
	  while (j >= 0) {
	    if (i >= k1) w = e[j] >> i - k1 & km;else {
	      w = (e[j] & (1 << i + 1) - 1) << k1 - i;
	      if (j > 0) w |= e[j - 1] >> this.DB + i - k1;
	    }

	    n = k;
	    while ((w & 1) == 0) {
	      w >>= 1;
	      --n;
	    }
	    if ((i -= n) < 0) {
	      i += this.DB;
	      --j;
	    }
	    if (is1) {
	      // ret == 1, don't bother squaring or multiplying it
	      g[w].copyTo(r);
	      is1 = false;
	    } else {
	      while (n > 1) {
	        z.sqrTo(r, r2);
	        z.sqrTo(r2, r);
	        n -= 2;
	      }
	      if (n > 0) z.sqrTo(r, r2);else {
	        t = r;
	        r = r2;
	        r2 = t;
	      }
	      z.mulTo(r2, g[w], r);
	    }

	    while (j >= 0 && (e[j] & 1 << i) == 0) {
	      z.sqrTo(r, r2);
	      t = r;
	      r = r2;
	      r2 = t;
	      if (--i < 0) {
	        i = this.DB - 1;
	        --j;
	      }
	    }
	  }
	  var result = z.revert(r);
	  callback(null, result);
	  return result;
	}

	// protected
	BigInteger.prototype.copyTo = bnpCopyTo;
	BigInteger.prototype.fromInt = bnpFromInt;
	BigInteger.prototype.fromString = bnpFromString;
	BigInteger.prototype.clamp = bnpClamp;
	BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
	BigInteger.prototype.drShiftTo = bnpDRShiftTo;
	BigInteger.prototype.lShiftTo = bnpLShiftTo;
	BigInteger.prototype.rShiftTo = bnpRShiftTo;
	BigInteger.prototype.subTo = bnpSubTo;
	BigInteger.prototype.multiplyTo = bnpMultiplyTo;
	BigInteger.prototype.squareTo = bnpSquareTo;
	BigInteger.prototype.divRemTo = bnpDivRemTo;
	BigInteger.prototype.invDigit = bnpInvDigit;
	BigInteger.prototype.addTo = bnpAddTo;

	// public
	BigInteger.prototype.toString = bnToString;
	BigInteger.prototype.negate = bnNegate;
	BigInteger.prototype.abs = bnAbs;
	BigInteger.prototype.compareTo = bnCompareTo;
	BigInteger.prototype.bitLength = bnBitLength;
	BigInteger.prototype.mod = bnMod;
	BigInteger.prototype.equals = bnEquals;
	BigInteger.prototype.add = bnAdd;
	BigInteger.prototype.subtract = bnSubtract;
	BigInteger.prototype.multiply = bnMultiply;
	BigInteger.prototype.divide = bnDivide;
	BigInteger.prototype.modPow = bnModPow;

	// "constants"
	BigInteger.ZERO = nbv(0);
	BigInteger.ONE = nbv(1);

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _CognitoJwtToken2 = __webpack_require__(7);

	var _CognitoJwtToken3 = _interopRequireDefault(_CognitoJwtToken2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2016 Amazon.com,
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Inc. or its affiliates. All Rights Reserved.
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Licensed under the Amazon Software License (the "License").
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * You may not use this file except in compliance with the
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * License. A copy of the License is located at
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *     http://aws.amazon.com/asl/
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * or in the "license" file accompanying this file. This file is
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * CONDITIONS OF ANY KIND, express or implied. See the License
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * for the specific language governing permissions and
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * limitations under the License.
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

	/** @class */
	var CognitoAccessToken = function (_CognitoJwtToken) {
	  _inherits(CognitoAccessToken, _CognitoJwtToken);

	  /**
	   * Constructs a new CognitoAccessToken object
	   * @param {string=} AccessToken The JWT access token.
	   */
	  function CognitoAccessToken() {
	    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	        AccessToken = _ref.AccessToken;

	    _classCallCheck(this, CognitoAccessToken);

	    return _possibleConstructorReturn(this, _CognitoJwtToken.call(this, AccessToken || ''));
	  }

	  return CognitoAccessToken;
	}(_CognitoJwtToken3.default);

	exports.default = CognitoAccessToken;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _CognitoJwtToken2 = __webpack_require__(7);

	var _CognitoJwtToken3 = _interopRequireDefault(_CognitoJwtToken2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*!
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2016 Amazon.com,
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Inc. or its affiliates. All Rights Reserved.
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Licensed under the Amazon Software License (the "License").
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * You may not use this file except in compliance with the
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * License. A copy of the License is located at
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *     http://aws.amazon.com/asl/
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * or in the "license" file accompanying this file. This file is
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * CONDITIONS OF ANY KIND, express or implied. See the License
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * for the specific language governing permissions and
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * limitations under the License.
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

	/** @class */
	var CognitoIdToken = function (_CognitoJwtToken) {
	  _inherits(CognitoIdToken, _CognitoJwtToken);

	  /**
	   * Constructs a new CognitoIdToken object
	   * @param {string=} IdToken The JWT Id token
	   */
	  function CognitoIdToken() {
	    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	        IdToken = _ref.IdToken;

	    _classCallCheck(this, CognitoIdToken);

	    return _possibleConstructorReturn(this, _CognitoJwtToken.call(this, IdToken || ''));
	  }

	  return CognitoIdToken;
	}(_CognitoJwtToken3.default);

	exports.default = CognitoIdToken;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _buffer = __webpack_require__(1);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /*!
	                                                                                                                                                           * Copyright 2016 Amazon.com,
	                                                                                                                                                           * Inc. or its affiliates. All Rights Reserved.
	                                                                                                                                                           *
	                                                                                                                                                           * Licensed under the Amazon Software License (the "License").
	                                                                                                                                                           * You may not use this file except in compliance with the
	                                                                                                                                                           * License. A copy of the License is located at
	                                                                                                                                                           *
	                                                                                                                                                           *     http://aws.amazon.com/asl/
	                                                                                                                                                           *
	                                                                                                                                                           * or in the "license" file accompanying this file. This file is
	                                                                                                                                                           * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	                                                                                                                                                           * CONDITIONS OF ANY KIND, express or implied. See the License
	                                                                                                                                                           * for the specific language governing permissions and
	                                                                                                                                                           * limitations under the License.
	                                                                                                                                                           */

	/** @class */
	var CognitoJwtToken = function () {
	  /**
	   * Constructs a new CognitoJwtToken object
	   * @param {string=} token The JWT token.
	   */
	  function CognitoJwtToken(token) {
	    _classCallCheck(this, CognitoJwtToken);

	    // Assign object
	    this.jwtToken = token || '';
	    this.payload = this.decodePayload();
	  }

	  /**
	   * @returns {string} the record's token.
	   */


	  CognitoJwtToken.prototype.getJwtToken = function getJwtToken() {
	    return this.jwtToken;
	  };

	  /**
	   * @returns {int} the token's expiration (exp member).
	   */


	  CognitoJwtToken.prototype.getExpiration = function getExpiration() {
	    return this.payload.exp;
	  };

	  /**
	   * @returns {int} the token's "issued at" (iat member).
	   */


	  CognitoJwtToken.prototype.getIssuedAt = function getIssuedAt() {
	    return this.payload.iat;
	  };

	  /**
	   * @returns {object} the token's payload.
	   */


	  CognitoJwtToken.prototype.decodePayload = function decodePayload() {
	    var payload = this.jwtToken.split('.')[1];
	    try {
	      return JSON.parse(_buffer.Buffer.from(payload, 'base64').toString('utf8'));
	    } catch (err) {
	      return {};
	    }
	  };

	  return CognitoJwtToken;
	}();

	exports.default = CognitoJwtToken;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	'use strict';

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*!
	 * Copyright 2016 Amazon.com,
	 * Inc. or its affiliates. All Rights Reserved.
	 *
	 * Licensed under the Amazon Software License (the "License").
	 * You may not use this file except in compliance with the
	 * License. A copy of the License is located at
	 *
	 *     http://aws.amazon.com/asl/
	 *
	 * or in the "license" file accompanying this file. This file is
	 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	 * CONDITIONS OF ANY KIND, express or implied. See the License
	 * for the specific language governing permissions and
	 * limitations under the License.
	 */

	/** @class */
	var CognitoRefreshToken = function () {
	  /**
	   * Constructs a new CognitoRefreshToken object
	   * @param {string=} RefreshToken The JWT refresh token.
	   */
	  function CognitoRefreshToken() {
	    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	        RefreshToken = _ref.RefreshToken;

	    _classCallCheck(this, CognitoRefreshToken);

	    // Assign object
	    this.token = RefreshToken || '';
	  }

	  /**
	   * @returns {string} the record's token.
	   */


	  CognitoRefreshToken.prototype.getToken = function getToken() {
	    return this.token;
	  };

	  return CognitoRefreshToken;
	}();

	exports.default = CognitoRefreshToken;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _buffer = __webpack_require__(1);

	var _cryptoBrowserify = __webpack_require__(14);

	var crypto = _interopRequireWildcard(_cryptoBrowserify);

	var _BigInteger = __webpack_require__(4);

	var _BigInteger2 = _interopRequireDefault(_BigInteger);

	var _AuthenticationHelper = __webpack_require__(3);

	var _AuthenticationHelper2 = _interopRequireDefault(_AuthenticationHelper);

	var _CognitoAccessToken = __webpack_require__(5);

	var _CognitoAccessToken2 = _interopRequireDefault(_CognitoAccessToken);

	var _CognitoIdToken = __webpack_require__(6);

	var _CognitoIdToken2 = _interopRequireDefault(_CognitoIdToken);

	var _CognitoRefreshToken = __webpack_require__(8);

	var _CognitoRefreshToken2 = _interopRequireDefault(_CognitoRefreshToken);

	var _CognitoUserSession = __webpack_require__(11);

	var _CognitoUserSession2 = _interopRequireDefault(_CognitoUserSession);

	var _DateHelper = __webpack_require__(12);

	var _DateHelper2 = _interopRequireDefault(_DateHelper);

	var _CognitoUserAttribute = __webpack_require__(10);

	var _CognitoUserAttribute2 = _interopRequireDefault(_CognitoUserAttribute);

	var _StorageHelper = __webpack_require__(13);

	var _StorageHelper2 = _interopRequireDefault(_StorageHelper);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /*!
	                                                                                                                                                           * Copyright 2016 Amazon.com,
	                                                                                                                                                           * Inc. or its affiliates. All Rights Reserved.
	                                                                                                                                                           *
	                                                                                                                                                           * Licensed under the Amazon Software License (the "License").
	                                                                                                                                                           * You may not use this file except in compliance with the
	                                                                                                                                                           * License. A copy of the License is located at
	                                                                                                                                                           *
	                                                                                                                                                           *     http://aws.amazon.com/asl/
	                                                                                                                                                           *
	                                                                                                                                                           * or in the "license" file accompanying this file. This file is
	                                                                                                                                                           * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	                                                                                                                                                           * CONDITIONS OF ANY KIND, express or implied. See the License
	                                                                                                                                                           * for the specific language governing permissions and
	                                                                                                                                                           * limitations under the License.
	                                                                                                                                                           */

	//import createHmac from 'create-hmac';


	var createHmac = crypto.createHmac;

	/**
	 * @callback nodeCallback
	 * @template T result
	 * @param {*} err The operation failure reason, or null.
	 * @param {T} result The operation result.
	 */

	/**
	 * @callback onFailure
	 * @param {*} err Failure reason.
	 */

	/**
	 * @callback onSuccess
	 * @template T result
	 * @param {T} result The operation result.
	 */

	/**
	 * @callback mfaRequired
	 * @param {*} details MFA challenge details.
	 */

	/**
	 * @callback customChallenge
	 * @param {*} details Custom challenge details.
	 */

	/**
	 * @callback inputVerificationCode
	 * @param {*} data Server response.
	 */

	/**
	 * @callback authSuccess
	 * @param {CognitoUserSession} session The new session.
	 * @param {bool=} userConfirmationNecessary User must be confirmed.
	 */

	/** @class */
	var CognitoUser = function () {
	  /**
	   * Constructs a new CognitoUser object
	   * @param {object} data Creation options
	   * @param {string} data.Username The user's username.
	   * @param {CognitoUserPool} data.Pool Pool containing the user.
	   * @param {object} data.Storage Optional storage object.
	   */
	  function CognitoUser(data) {
	    _classCallCheck(this, CognitoUser);

	    if (data == null || data.Username == null || data.Pool == null) {
	      throw new Error('Username and pool information are required.');
	    }

	    this.username = data.Username || '';
	    this.pool = data.Pool;
	    this.Session = null;

	    this.client = data.Pool.client;

	    this.signInUserSession = null;
	    this.authenticationFlowType = 'USER_SRP_AUTH';

	    this.storage = data.Storage || new _StorageHelper2.default().getStorage();
	  }

	  /**
	   * Sets the session for this user
	   * @param {CognitoUserSession} signInUserSession the session
	   * @returns {void}
	   */


	  CognitoUser.prototype.setSignInUserSession = function setSignInUserSession(signInUserSession) {
	    this.clearCachedTokens();
	    this.signInUserSession = signInUserSession;
	    this.cacheTokens();
	  };

	  /**
	   * @returns {CognitoUserSession} the current session for this user
	   */


	  CognitoUser.prototype.getSignInUserSession = function getSignInUserSession() {
	    return this.signInUserSession;
	  };

	  /**
	   * @returns {string} the user's username
	   */


	  CognitoUser.prototype.getUsername = function getUsername() {
	    return this.username;
	  };

	  /**
	   * @returns {String} the authentication flow type
	   */


	  CognitoUser.prototype.getAuthenticationFlowType = function getAuthenticationFlowType() {
	    return this.authenticationFlowType;
	  };

	  /**
	   * sets authentication flow type
	   * @param {string} authenticationFlowType New value.
	   * @returns {void}
	   */


	  CognitoUser.prototype.setAuthenticationFlowType = function setAuthenticationFlowType(authenticationFlowType) {
	    this.authenticationFlowType = authenticationFlowType;
	  };

	  /**
	   * This is used for authenticating the user through the custom authentication flow.
	   * @param {AuthenticationDetails} authDetails Contains the authentication data
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {customChallenge} callback.customChallenge Custom challenge
	   *        response required to continue.
	   * @param {authSuccess} callback.onSuccess Called on success with the new session.
	   * @returns {void}
	   */


	  CognitoUser.prototype.initiateAuth = function initiateAuth(authDetails, callback) {
	    var _this = this;

	    var authParameters = authDetails.getAuthParameters();
	    authParameters.USERNAME = this.username;

	    var jsonReq = {
	      AuthFlow: 'CUSTOM_AUTH',
	      ClientId: this.pool.getClientId(),
	      AuthParameters: authParameters,
	      ClientMetadata: authDetails.getValidationData()
	    };
	    if (this.getUserContextData()) {
	      jsonReq.UserContextData = this.getUserContextData();
	    }

	    this.client.request('InitiateAuth', jsonReq, function (err, data) {
	      if (err) {
	        return callback.onFailure(err);
	      }
	      var challengeName = data.ChallengeName;
	      var challengeParameters = data.ChallengeParameters;

	      if (challengeName === 'CUSTOM_CHALLENGE') {
	        _this.Session = data.Session;
	        return callback.customChallenge(challengeParameters);
	      }
	      _this.signInUserSession = _this.getCognitoUserSession(data.AuthenticationResult);
	      _this.cacheTokens();
	      return callback.onSuccess(_this.signInUserSession);
	    });
	  };

	  /**
	   * This is used for authenticating the user.
	   * stuff
	   * @param {AuthenticationDetails} authDetails Contains the authentication data
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {newPasswordRequired} callback.newPasswordRequired new
	   *        password and any required attributes are required to continue
	   * @param {mfaRequired} callback.mfaRequired MFA code
	   *        required to continue.
	   * @param {customChallenge} callback.customChallenge Custom challenge
	   *        response required to continue.
	   * @param {authSuccess} callback.onSuccess Called on success with the new session.
	   * @returns {void}
	   */


	  CognitoUser.prototype.authenticateUser = function authenticateUser(authDetails, callback) {
	    if (this.authenticationFlowType === 'USER_PASSWORD_AUTH') {
	      return this.authenticateUserPlainUsernamePassword(authDetails, callback);
	    } else if (this.authenticationFlowType === 'USER_SRP_AUTH') {
	      return this.authenticateUserDefaultAuth(authDetails, callback);
	    }
	    return callback.onFailure(new Error('Authentication flow type is invalid.'));
	  };

	  /**
	   * This is used for authenticating the user. it calls the AuthenticationHelper for SRP related
	   * stuff
	   * @param {AuthenticationDetails} authDetails Contains the authentication data
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {newPasswordRequired} callback.newPasswordRequired new
	   *        password and any required attributes are required to continue
	   * @param {mfaRequired} callback.mfaRequired MFA code
	   *        required to continue.
	   * @param {customChallenge} callback.customChallenge Custom challenge
	   *        response required to continue.
	   * @param {authSuccess} callback.onSuccess Called on success with the new session.
	   * @returns {void}
	   */


	  CognitoUser.prototype.authenticateUserDefaultAuth = function authenticateUserDefaultAuth(authDetails, callback) {
	    var _this2 = this;

	    var authenticationHelper = new _AuthenticationHelper2.default(this.pool.getUserPoolId().split('_')[1]);
	    var dateHelper = new _DateHelper2.default();

	    var serverBValue = void 0;
	    var salt = void 0;
	    var authParameters = {};

	    if (this.deviceKey != null) {
	      authParameters.DEVICE_KEY = this.deviceKey;
	    }

	    authParameters.USERNAME = this.username;
	    authenticationHelper.getLargeAValue(function (errOnAValue, aValue) {
	      // getLargeAValue callback start
	      if (errOnAValue) {
	        callback.onFailure(errOnAValue);
	      }

	      authParameters.SRP_A = aValue.toString(16);

	      if (_this2.authenticationFlowType === 'CUSTOM_AUTH') {
	        authParameters.CHALLENGE_NAME = 'SRP_A';
	      }

	      var jsonReq = {
	        AuthFlow: _this2.authenticationFlowType,
	        ClientId: _this2.pool.getClientId(),
	        AuthParameters: authParameters,
	        ClientMetadata: authDetails.getValidationData()
	      };
	      if (_this2.getUserContextData(_this2.username)) {
	        jsonReq.UserContextData = _this2.getUserContextData(_this2.username);
	      }

	      _this2.client.request('InitiateAuth', jsonReq, function (err, data) {
	        if (err) {
	          return callback.onFailure(err);
	        }

	        var challengeParameters = data.ChallengeParameters;

	        _this2.username = challengeParameters.USER_ID_FOR_SRP;
	        serverBValue = new _BigInteger2.default(challengeParameters.SRP_B, 16);
	        salt = new _BigInteger2.default(challengeParameters.SALT, 16);
	        _this2.getCachedDeviceKeyAndPassword();

	        authenticationHelper.getPasswordAuthenticationKey(_this2.username, authDetails.getPassword(), serverBValue, salt, function (errOnHkdf, hkdf) {
	          // getPasswordAuthenticationKey callback start
	          if (errOnHkdf) {
	            callback.onFailure(errOnHkdf);
	          }

	          var dateNow = dateHelper.getNowString();

	          var signatureString = createHmac('sha256', hkdf).update(_buffer.Buffer.concat([_buffer.Buffer.from(_this2.pool.getUserPoolId().split('_')[1], 'utf8'), _buffer.Buffer.from(_this2.username, 'utf8'), _buffer.Buffer.from(challengeParameters.SECRET_BLOCK, 'base64'), _buffer.Buffer.from(dateNow, 'utf8')])).digest('base64');

	          var challengeResponses = {};

	          challengeResponses.USERNAME = _this2.username;
	          challengeResponses.PASSWORD_CLAIM_SECRET_BLOCK = challengeParameters.SECRET_BLOCK;
	          challengeResponses.TIMESTAMP = dateNow;
	          challengeResponses.PASSWORD_CLAIM_SIGNATURE = signatureString;

	          if (_this2.deviceKey != null) {
	            challengeResponses.DEVICE_KEY = _this2.deviceKey;
	          }

	          var respondToAuthChallenge = function respondToAuthChallenge(challenge, challengeCallback) {
	            return _this2.client.request('RespondToAuthChallenge', challenge, function (errChallenge, dataChallenge) {
	              if (errChallenge && errChallenge.code === 'ResourceNotFoundException' && errChallenge.message.toLowerCase().indexOf('device') !== -1) {
	                challengeResponses.DEVICE_KEY = null;
	                _this2.deviceKey = null;
	                _this2.randomPassword = null;
	                _this2.deviceGroupKey = null;
	                _this2.clearCachedDeviceKeyAndPassword();
	                return respondToAuthChallenge(challenge, challengeCallback);
	              }
	              return challengeCallback(errChallenge, dataChallenge);
	            });
	          };

	          var jsonReqResp = {
	            ChallengeName: 'PASSWORD_VERIFIER',
	            ClientId: _this2.pool.getClientId(),
	            ChallengeResponses: challengeResponses,
	            Session: data.Session
	          };
	          if (_this2.getUserContextData()) {
	            jsonReqResp.UserContextData = _this2.getUserContextData();
	          }
	          respondToAuthChallenge(jsonReqResp, function (errAuthenticate, dataAuthenticate) {
	            if (errAuthenticate) {
	              return callback.onFailure(errAuthenticate);
	            }

	            var challengeName = dataAuthenticate.ChallengeName;
	            if (challengeName === 'NEW_PASSWORD_REQUIRED') {
	              _this2.Session = dataAuthenticate.Session;
	              var userAttributes = null;
	              var rawRequiredAttributes = null;
	              var requiredAttributes = [];
	              var userAttributesPrefix = authenticationHelper.getNewPasswordRequiredChallengeUserAttributePrefix();

	              if (dataAuthenticate.ChallengeParameters) {
	                userAttributes = JSON.parse(dataAuthenticate.ChallengeParameters.userAttributes);
	                rawRequiredAttributes = JSON.parse(dataAuthenticate.ChallengeParameters.requiredAttributes);
	              }

	              if (rawRequiredAttributes) {
	                for (var i = 0; i < rawRequiredAttributes.length; i++) {
	                  requiredAttributes[i] = rawRequiredAttributes[i].substr(userAttributesPrefix.length);
	                }
	              }
	              return callback.newPasswordRequired(userAttributes, requiredAttributes);
	            }
	            return _this2.authenticateUserInternal(dataAuthenticate, authenticationHelper, callback);
	          });
	          return undefined;
	          // getPasswordAuthenticationKey callback end
	        });
	        return undefined;
	      });
	      // getLargeAValue callback end
	    });
	  };

	  /**
	   * PRIVATE ONLY: This is an internal only method and should not
	   * be directly called by the consumers.
	   * @param {AuthenticationDetails} authDetails Contains the authentication data.
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {mfaRequired} callback.mfaRequired MFA code
	   *        required to continue.
	   * @param {authSuccess} callback.onSuccess Called on success with the new session.
	   * @returns {void}
	   */


	  CognitoUser.prototype.authenticateUserPlainUsernamePassword = function authenticateUserPlainUsernamePassword(authDetails, callback) {
	    var _this3 = this;

	    var authParameters = {};
	    authParameters.USERNAME = this.username;
	    authParameters.PASSWORD = authDetails.getPassword();
	    if (!authParameters.PASSWORD) {
	      callback.onFailure(new Error('PASSWORD parameter is required'));
	      return;
	    }
	    var authenticationHelper = new _AuthenticationHelper2.default(this.pool.getUserPoolId().split('_')[1]);
	    this.getCachedDeviceKeyAndPassword();
	    if (this.deviceKey != null) {
	      authParameters.DEVICE_KEY = this.deviceKey;
	    }

	    var jsonReq = {
	      AuthFlow: 'USER_PASSWORD_AUTH',
	      ClientId: this.pool.getClientId(),
	      AuthParameters: authParameters,
	      ClientMetadata: authDetails.getValidationData()
	    };
	    if (this.getUserContextData(this.username)) {
	      jsonReq.UserContextData = this.getUserContextData(this.username);
	    }
	    // USER_PASSWORD_AUTH happens in a single round-trip: client sends userName and password,
	    // Cognito UserPools verifies password and returns tokens.
	    this.client.request('InitiateAuth', jsonReq, function (err, authResult) {
	      if (err) {
	        return callback.onFailure(err);
	      }
	      return _this3.authenticateUserInternal(authResult, authenticationHelper, callback);
	    });
	  };

	  /**
	  * PRIVATE ONLY: This is an internal only method and should not
	  * be directly called by the consumers.
	  * @param {object} dataAuthenticate authentication data
	  * @param {object} authenticationHelper helper created
	  * @param {callback} callback passed on from caller
	  * @returns {void}
	  */


	  CognitoUser.prototype.authenticateUserInternal = function authenticateUserInternal(dataAuthenticate, authenticationHelper, callback) {
	    var _this4 = this;

	    var challengeName = dataAuthenticate.ChallengeName;
	    var challengeParameters = dataAuthenticate.ChallengeParameters;

	    if (challengeName === 'SMS_MFA') {
	      this.Session = dataAuthenticate.Session;
	      return callback.mfaRequired(challengeName, challengeParameters);
	    }

	    if (challengeName === 'SELECT_MFA_TYPE') {
	      this.Session = dataAuthenticate.Session;
	      return callback.selectMFAType(challengeName, challengeParameters);
	    }

	    if (challengeName === 'MFA_SETUP') {
	      this.Session = dataAuthenticate.Session;
	      return callback.mfaSetup(challengeName, challengeParameters);
	    }

	    if (challengeName === 'SOFTWARE_TOKEN_MFA') {
	      this.Session = dataAuthenticate.Session;
	      return callback.totpRequired(challengeName, challengeParameters);
	    }

	    if (challengeName === 'CUSTOM_CHALLENGE') {
	      this.Session = dataAuthenticate.Session;
	      return callback.customChallenge(challengeParameters);
	    }

	    if (challengeName === 'DEVICE_SRP_AUTH') {
	      this.getDeviceResponse(callback);
	      return undefined;
	    }

	    this.signInUserSession = this.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
	    this.cacheTokens();

	    var newDeviceMetadata = dataAuthenticate.AuthenticationResult.NewDeviceMetadata;
	    if (newDeviceMetadata == null) {
	      return callback.onSuccess(this.signInUserSession);
	    }

	    authenticationHelper.generateHashDevice(dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey, dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey, function (errGenHash) {
	      if (errGenHash) {
	        return callback.onFailure(errGenHash);
	      }

	      var deviceSecretVerifierConfig = {
	        Salt: _buffer.Buffer.from(authenticationHelper.getSaltDevices(), 'hex').toString('base64'),
	        PasswordVerifier: _buffer.Buffer.from(authenticationHelper.getVerifierDevices(), 'hex').toString('base64')
	      };

	      _this4.verifierDevices = deviceSecretVerifierConfig.PasswordVerifier;
	      _this4.deviceGroupKey = newDeviceMetadata.DeviceGroupKey;
	      _this4.randomPassword = authenticationHelper.getRandomPassword();

	      _this4.client.request('ConfirmDevice', {
	        DeviceKey: newDeviceMetadata.DeviceKey,
	        AccessToken: _this4.signInUserSession.getAccessToken().getJwtToken(),
	        DeviceSecretVerifierConfig: deviceSecretVerifierConfig,
	        DeviceName: navigator.userAgent
	      }, function (errConfirm, dataConfirm) {
	        if (errConfirm) {
	          return callback.onFailure(errConfirm);
	        }

	        _this4.deviceKey = dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey;
	        _this4.cacheDeviceKeyAndPassword();
	        if (dataConfirm.UserConfirmationNecessary === true) {
	          return callback.onSuccess(_this4.signInUserSession, dataConfirm.UserConfirmationNecessary);
	        }
	        return callback.onSuccess(_this4.signInUserSession);
	      });
	      return undefined;
	    });
	    return undefined;
	  };

	  /**
	  * This method is user to complete the NEW_PASSWORD_REQUIRED challenge.
	  * Pass the new password with any new user attributes to be updated.
	  * User attribute keys must be of format userAttributes.<attribute_name>.
	  * @param {string} newPassword new password for this user
	  * @param {object} requiredAttributeData map with values for all required attributes
	  * @param {object} callback Result callback map.
	  * @param {onFailure} callback.onFailure Called on any error.
	  * @param {mfaRequired} callback.mfaRequired MFA code required to continue.
	  * @param {customChallenge} callback.customChallenge Custom challenge
	  *         response required to continue.
	  * @param {authSuccess} callback.onSuccess Called on success with the new session.
	  * @returns {void}
	  */


	  CognitoUser.prototype.completeNewPasswordChallenge = function completeNewPasswordChallenge(newPassword, requiredAttributeData, callback) {
	    var _this5 = this;

	    if (!newPassword) {
	      return callback.onFailure(new Error('New password is required.'));
	    }
	    var authenticationHelper = new _AuthenticationHelper2.default(this.pool.getUserPoolId().split('_')[1]);
	    var userAttributesPrefix = authenticationHelper.getNewPasswordRequiredChallengeUserAttributePrefix();

	    var finalUserAttributes = {};
	    if (requiredAttributeData) {
	      Object.keys(requiredAttributeData).forEach(function (key) {
	        finalUserAttributes[userAttributesPrefix + key] = requiredAttributeData[key];
	      });
	    }

	    finalUserAttributes.NEW_PASSWORD = newPassword;
	    finalUserAttributes.USERNAME = this.username;
	    var jsonReq = {
	      ChallengeName: 'NEW_PASSWORD_REQUIRED',
	      ClientId: this.pool.getClientId(),
	      ChallengeResponses: finalUserAttributes,
	      Session: this.Session
	    };
	    if (this.getUserContextData()) {
	      jsonReq.UserContextData = this.getUserContextData();
	    }

	    this.client.request('RespondToAuthChallenge', jsonReq, function (errAuthenticate, dataAuthenticate) {
	      if (errAuthenticate) {
	        return callback.onFailure(errAuthenticate);
	      }
	      return _this5.authenticateUserInternal(dataAuthenticate, authenticationHelper, callback);
	    });
	    return undefined;
	  };

	  /**
	   * This is used to get a session using device authentication. It is called at the end of user
	   * authentication
	   *
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {authSuccess} callback.onSuccess Called on success with the new session.
	   * @returns {void}
	   * @private
	   */


	  CognitoUser.prototype.getDeviceResponse = function getDeviceResponse(callback) {
	    var _this6 = this;

	    var authenticationHelper = new _AuthenticationHelper2.default(this.deviceGroupKey);
	    var dateHelper = new _DateHelper2.default();

	    var authParameters = {};

	    authParameters.USERNAME = this.username;
	    authParameters.DEVICE_KEY = this.deviceKey;
	    authenticationHelper.getLargeAValue(function (errAValue, aValue) {
	      // getLargeAValue callback start
	      if (errAValue) {
	        callback.onFailure(errAValue);
	      }

	      authParameters.SRP_A = aValue.toString(16);

	      var jsonReq = {
	        ChallengeName: 'DEVICE_SRP_AUTH',
	        ClientId: _this6.pool.getClientId(),
	        ChallengeResponses: authParameters
	      };
	      if (_this6.getUserContextData()) {
	        jsonReq.UserContextData = _this6.getUserContextData();
	      }
	      _this6.client.request('RespondToAuthChallenge', jsonReq, function (err, data) {
	        if (err) {
	          return callback.onFailure(err);
	        }

	        var challengeParameters = data.ChallengeParameters;

	        var serverBValue = new _BigInteger2.default(challengeParameters.SRP_B, 16);
	        var salt = new _BigInteger2.default(challengeParameters.SALT, 16);

	        authenticationHelper.getPasswordAuthenticationKey(_this6.deviceKey, _this6.randomPassword, serverBValue, salt, function (errHkdf, hkdf) {
	          // getPasswordAuthenticationKey callback start
	          if (errHkdf) {
	            return callback.onFailure(errHkdf);
	          }

	          var dateNow = dateHelper.getNowString();

	          var signatureString = createHmac('sha256', hkdf).update(_buffer.Buffer.concat([_buffer.Buffer.from(_this6.deviceGroupKey, 'utf8'), _buffer.Buffer.from(_this6.deviceKey, 'utf8'), _buffer.Buffer.from(challengeParameters.SECRET_BLOCK, 'base64'), _buffer.Buffer.from(dateNow, 'utf8')])).digest('base64');

	          var challengeResponses = {};

	          challengeResponses.USERNAME = _this6.username;
	          challengeResponses.PASSWORD_CLAIM_SECRET_BLOCK = challengeParameters.SECRET_BLOCK;
	          challengeResponses.TIMESTAMP = dateNow;
	          challengeResponses.PASSWORD_CLAIM_SIGNATURE = signatureString;
	          challengeResponses.DEVICE_KEY = _this6.deviceKey;

	          var jsonReqResp = {
	            ChallengeName: 'DEVICE_PASSWORD_VERIFIER',
	            ClientId: _this6.pool.getClientId(),
	            ChallengeResponses: challengeResponses,
	            Session: data.Session
	          };
	          if (_this6.getUserContextData()) {
	            jsonReqResp.UserContextData = _this6.getUserContextData();
	          }

	          _this6.client.request('RespondToAuthChallenge', jsonReqResp, function (errAuthenticate, dataAuthenticate) {
	            if (errAuthenticate) {
	              return callback.onFailure(errAuthenticate);
	            }

	            _this6.signInUserSession = _this6.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
	            _this6.cacheTokens();

	            return callback.onSuccess(_this6.signInUserSession);
	          });
	          return undefined;
	          // getPasswordAuthenticationKey callback end
	        });
	        return undefined;
	      });
	      // getLargeAValue callback end
	    });
	  };

	  /**
	   * This is used for a certain user to confirm the registration by using a confirmation code
	   * @param {string} confirmationCode Code entered by user.
	   * @param {bool} forceAliasCreation Allow migrating from an existing email / phone number.
	   * @param {nodeCallback<string>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.confirmRegistration = function confirmRegistration(confirmationCode, forceAliasCreation, callback) {
	    var jsonReq = {
	      ClientId: this.pool.getClientId(),
	      ConfirmationCode: confirmationCode,
	      Username: this.username,
	      ForceAliasCreation: forceAliasCreation
	    };
	    if (this.getUserContextData()) {
	      jsonReq.UserContextData = this.getUserContextData();
	    }
	    this.client.request('ConfirmSignUp', jsonReq, function (err) {
	      if (err) {
	        return callback(err, null);
	      }
	      return callback(null, 'SUCCESS');
	    });
	  };

	  /**
	   * This is used by the user once he has the responses to a custom challenge
	   * @param {string} answerChallenge The custom challange answer.
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {customChallenge} callback.customChallenge
	   *    Custom challenge response required to continue.
	   * @param {authSuccess} callback.onSuccess Called on success with the new session.
	   * @returns {void}
	   */


	  CognitoUser.prototype.sendCustomChallengeAnswer = function sendCustomChallengeAnswer(answerChallenge, callback) {
	    var _this7 = this;

	    var challengeResponses = {};
	    challengeResponses.USERNAME = this.username;
	    challengeResponses.ANSWER = answerChallenge;

	    var authenticationHelper = new _AuthenticationHelper2.default(this.pool.getUserPoolId().split('_')[1]);
	    this.getCachedDeviceKeyAndPassword();
	    if (this.deviceKey != null) {
	      challengeResponses.DEVICE_KEY = this.deviceKey;
	    }

	    var jsonReq = {
	      ChallengeName: 'CUSTOM_CHALLENGE',
	      ChallengeResponses: challengeResponses,
	      ClientId: this.pool.getClientId(),
	      Session: this.Session
	    };
	    if (this.getUserContextData()) {
	      jsonReq.UserContextData = this.getUserContextData();
	    }
	    this.client.request('RespondToAuthChallenge', jsonReq, function (err, data) {
	      if (err) {
	        return callback.onFailure(err);
	      }

	      return _this7.authenticateUserInternal(data, authenticationHelper, callback);
	    });
	  };

	  /**
	   * This is used by the user once he has an MFA code
	   * @param {string} confirmationCode The MFA code entered by the user.
	   * @param {object} callback Result callback map.
	   * @param {string} mfaType The mfa we are replying to.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {authSuccess} callback.onSuccess Called on success with the new session.
	   * @returns {void}
	   */


	  CognitoUser.prototype.sendMFACode = function sendMFACode(confirmationCode, callback, mfaType) {
	    var _this8 = this;

	    var challengeResponses = {};
	    challengeResponses.USERNAME = this.username;
	    challengeResponses.SMS_MFA_CODE = confirmationCode;
	    var mfaTypeSelection = mfaType || 'SMS_MFA';
	    if (mfaTypeSelection === 'SOFTWARE_TOKEN_MFA') {
	      challengeResponses.SOFTWARE_TOKEN_MFA_CODE = confirmationCode;
	    }

	    if (this.deviceKey != null) {
	      challengeResponses.DEVICE_KEY = this.deviceKey;
	    }

	    var jsonReq = {
	      ChallengeName: mfaTypeSelection,
	      ChallengeResponses: challengeResponses,
	      ClientId: this.pool.getClientId(),
	      Session: this.Session
	    };
	    if (this.getUserContextData()) {
	      jsonReq.UserContextData = this.getUserContextData();
	    }

	    this.client.request('RespondToAuthChallenge', jsonReq, function (err, dataAuthenticate) {
	      if (err) {
	        return callback.onFailure(err);
	      }

	      var challengeName = dataAuthenticate.ChallengeName;

	      if (challengeName === 'DEVICE_SRP_AUTH') {
	        _this8.getDeviceResponse(callback);
	        return undefined;
	      }

	      _this8.signInUserSession = _this8.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
	      _this8.cacheTokens();

	      if (dataAuthenticate.AuthenticationResult.NewDeviceMetadata == null) {
	        return callback.onSuccess(_this8.signInUserSession);
	      }

	      var authenticationHelper = new _AuthenticationHelper2.default(_this8.pool.getUserPoolId().split('_')[1]);
	      authenticationHelper.generateHashDevice(dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey, dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey, function (errGenHash) {
	        if (errGenHash) {
	          return callback.onFailure(errGenHash);
	        }

	        var deviceSecretVerifierConfig = {
	          Salt: _buffer.Buffer.from(authenticationHelper.getSaltDevices(), 'hex').toString('base64'),
	          PasswordVerifier: _buffer.Buffer.from(authenticationHelper.getVerifierDevices(), 'hex').toString('base64')
	        };

	        _this8.verifierDevices = deviceSecretVerifierConfig.PasswordVerifier;
	        _this8.deviceGroupKey = dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey;
	        _this8.randomPassword = authenticationHelper.getRandomPassword();

	        _this8.client.request('ConfirmDevice', {
	          DeviceKey: dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey,
	          AccessToken: _this8.signInUserSession.getAccessToken().getJwtToken(),
	          DeviceSecretVerifierConfig: deviceSecretVerifierConfig,
	          DeviceName: navigator.userAgent
	        }, function (errConfirm, dataConfirm) {
	          if (errConfirm) {
	            return callback.onFailure(errConfirm);
	          }

	          _this8.deviceKey = dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey;
	          _this8.cacheDeviceKeyAndPassword();
	          if (dataConfirm.UserConfirmationNecessary === true) {
	            return callback.onSuccess(_this8.signInUserSession, dataConfirm.UserConfirmationNecessary);
	          }
	          return callback.onSuccess(_this8.signInUserSession);
	        });
	        return undefined;
	      });
	      return undefined;
	    });
	  };

	  /**
	   * This is used by an authenticated user to change the current password
	   * @param {string} oldUserPassword The current password.
	   * @param {string} newUserPassword The requested new password.
	   * @param {nodeCallback<string>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.changePassword = function changePassword(oldUserPassword, newUserPassword, callback) {
	    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
	      return callback(new Error('User is not authenticated'), null);
	    }

	    this.client.request('ChangePassword', {
	      PreviousPassword: oldUserPassword,
	      ProposedPassword: newUserPassword,
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
	    }, function (err) {
	      if (err) {
	        return callback(err, null);
	      }
	      return callback(null, 'SUCCESS');
	    });
	    return undefined;
	  };

	  /**
	   * This is used by an authenticated user to enable MFA for himself
	   * @param {nodeCallback<string>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.enableMFA = function enableMFA(callback) {
	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback(new Error('User is not authenticated'), null);
	    }

	    var mfaOptions = [];
	    var mfaEnabled = {
	      DeliveryMedium: 'SMS',
	      AttributeName: 'phone_number'
	    };
	    mfaOptions.push(mfaEnabled);

	    this.client.request('SetUserSettings', {
	      MFAOptions: mfaOptions,
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
	    }, function (err) {
	      if (err) {
	        return callback(err, null);
	      }
	      return callback(null, 'SUCCESS');
	    });
	    return undefined;
	  };

	  /**
	   * This is used by an authenticated user to enable MFA for himself
	   * @param {string[]} smsMfaSettings the sms mfa settings
	   * @param {string[]} softwareTokenMfaSettings the software token mfa settings
	   * @param {nodeCallback<string>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.setUserMfaPreference = function setUserMfaPreference(smsMfaSettings, softwareTokenMfaSettings, callback) {
	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback(new Error('User is not authenticated'), null);
	    }

	    this.client.request('SetUserMFAPreference', {
	      SMSMfaSettings: smsMfaSettings,
	      SoftwareTokenMfaSettings: softwareTokenMfaSettings,
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
	    }, function (err) {
	      if (err) {
	        return callback(err, null);
	      }
	      return callback(null, 'SUCCESS');
	    });
	    return undefined;
	  };

	  /**
	   * This is used by an authenticated user to disable MFA for himself
	   * @param {nodeCallback<string>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.disableMFA = function disableMFA(callback) {
	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback(new Error('User is not authenticated'), null);
	    }

	    var mfaOptions = [];

	    this.client.request('SetUserSettings', {
	      MFAOptions: mfaOptions,
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
	    }, function (err) {
	      if (err) {
	        return callback(err, null);
	      }
	      return callback(null, 'SUCCESS');
	    });
	    return undefined;
	  };

	  /**
	   * This is used by an authenticated user to delete himself
	   * @param {nodeCallback<string>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.deleteUser = function deleteUser(callback) {
	    var _this9 = this;

	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback(new Error('User is not authenticated'), null);
	    }

	    this.client.request('DeleteUser', {
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
	    }, function (err) {
	      if (err) {
	        return callback(err, null);
	      }
	      _this9.clearCachedTokens();
	      return callback(null, 'SUCCESS');
	    });
	    return undefined;
	  };

	  /**
	   * @typedef {CognitoUserAttribute | { Name:string, Value:string }} AttributeArg
	   */
	  /**
	   * This is used by an authenticated user to change a list of attributes
	   * @param {AttributeArg[]} attributes A list of the new user attributes.
	   * @param {nodeCallback<string>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.updateAttributes = function updateAttributes(attributes, callback) {
	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback(new Error('User is not authenticated'), null);
	    }

	    this.client.request('UpdateUserAttributes', {
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
	      UserAttributes: attributes
	    }, function (err) {
	      if (err) {
	        return callback(err, null);
	      }
	      return callback(null, 'SUCCESS');
	    });
	    return undefined;
	  };

	  /**
	   * This is used by an authenticated user to get a list of attributes
	   * @param {nodeCallback<CognitoUserAttribute[]>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.getUserAttributes = function getUserAttributes(callback) {
	    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
	      return callback(new Error('User is not authenticated'), null);
	    }

	    this.client.request('GetUser', {
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
	    }, function (err, userData) {
	      if (err) {
	        return callback(err, null);
	      }

	      var attributeList = [];

	      for (var i = 0; i < userData.UserAttributes.length; i++) {
	        var attribute = {
	          Name: userData.UserAttributes[i].Name,
	          Value: userData.UserAttributes[i].Value
	        };
	        var userAttribute = new _CognitoUserAttribute2.default(attribute);
	        attributeList.push(userAttribute);
	      }

	      return callback(null, attributeList);
	    });
	    return undefined;
	  };

	  /**
	   * This is used by an authenticated user to get the MFAOptions
	   * @param {nodeCallback<MFAOptions>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.getMFAOptions = function getMFAOptions(callback) {
	    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
	      return callback(new Error('User is not authenticated'), null);
	    }

	    this.client.request('GetUser', {
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
	    }, function (err, userData) {
	      if (err) {
	        return callback(err, null);
	      }

	      return callback(null, userData.MFAOptions);
	    });
	    return undefined;
	  };

	  /**
	   * This is used by an authenticated user to delete a list of attributes
	   * @param {string[]} attributeList Names of the attributes to delete.
	   * @param {nodeCallback<string>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.deleteAttributes = function deleteAttributes(attributeList, callback) {
	    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
	      return callback(new Error('User is not authenticated'), null);
	    }

	    this.client.request('DeleteUserAttributes', {
	      UserAttributeNames: attributeList,
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
	    }, function (err) {
	      if (err) {
	        return callback(err, null);
	      }
	      return callback(null, 'SUCCESS');
	    });
	    return undefined;
	  };

	  /**
	   * This is used by a user to resend a confirmation code
	   * @param {nodeCallback<string>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.resendConfirmationCode = function resendConfirmationCode(callback) {
	    var jsonReq = {
	      ClientId: this.pool.getClientId(),
	      Username: this.username
	    };

	    this.client.request('ResendConfirmationCode', jsonReq, function (err, result) {
	      if (err) {
	        return callback(err, null);
	      }
	      return callback(null, result);
	    });
	  };

	  /**
	   * This is used to get a session, either from the session object
	   * or from  the local storage, or by using a refresh token
	   *
	   * @param {nodeCallback<CognitoUserSession>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.getSession = function getSession(callback) {
	    if (this.username == null) {
	      return callback(new Error('Username is null. Cannot retrieve a new session'), null);
	    }

	    if (this.signInUserSession != null && this.signInUserSession.isValid()) {
	      return callback(null, this.signInUserSession);
	    }

	    var keyPrefix = 'CognitoIdentityServiceProvider.' + this.pool.getClientId() + '.' + this.username;
	    var idTokenKey = keyPrefix + '.idToken';
	    var accessTokenKey = keyPrefix + '.accessToken';
	    var refreshTokenKey = keyPrefix + '.refreshToken';
	    var clockDriftKey = keyPrefix + '.clockDrift';

	    if (this.storage.getItem(idTokenKey)) {
	      var idToken = new _CognitoIdToken2.default({
	        IdToken: this.storage.getItem(idTokenKey)
	      });
	      var accessToken = new _CognitoAccessToken2.default({
	        AccessToken: this.storage.getItem(accessTokenKey)
	      });
	      var refreshToken = new _CognitoRefreshToken2.default({
	        RefreshToken: this.storage.getItem(refreshTokenKey)
	      });
	      var clockDrift = parseInt(this.storage.getItem(clockDriftKey), 0) || 0;

	      var sessionData = {
	        IdToken: idToken,
	        AccessToken: accessToken,
	        RefreshToken: refreshToken,
	        ClockDrift: clockDrift
	      };
	      var cachedSession = new _CognitoUserSession2.default(sessionData);
	      if (cachedSession.isValid()) {
	        this.signInUserSession = cachedSession;
	        return callback(null, this.signInUserSession);
	      }

	      if (refreshToken.getToken() == null) {
	        return callback(new Error('Cannot retrieve a new session. Please authenticate.'), null);
	      }

	      this.refreshSession(refreshToken, callback);
	    } else {
	      callback(new Error('Local storage is missing an ID Token, Please authenticate'), null);
	    }

	    return undefined;
	  };

	  /**
	   * This uses the refreshToken to retrieve a new session
	   * @param {CognitoRefreshToken} refreshToken A previous session's refresh token.
	   * @param {nodeCallback<CognitoUserSession>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.refreshSession = function refreshSession(refreshToken, callback) {
	    var _this10 = this;

	    var authParameters = {};
	    authParameters.REFRESH_TOKEN = refreshToken.getToken();
	    var keyPrefix = 'CognitoIdentityServiceProvider.' + this.pool.getClientId();
	    var lastUserKey = keyPrefix + '.LastAuthUser';

	    if (this.storage.getItem(lastUserKey)) {
	      this.username = this.storage.getItem(lastUserKey);
	      var deviceKeyKey = keyPrefix + '.' + this.username + '.deviceKey';
	      this.deviceKey = this.storage.getItem(deviceKeyKey);
	      authParameters.DEVICE_KEY = this.deviceKey;
	    }

	    var jsonReq = {
	      ClientId: this.pool.getClientId(),
	      AuthFlow: 'REFRESH_TOKEN_AUTH',
	      AuthParameters: authParameters
	    };
	    if (this.getUserContextData()) {
	      jsonReq.UserContextData = this.getUserContextData();
	    }
	    this.client.request('InitiateAuth', jsonReq, function (err, authResult) {
	      if (err) {
	        if (err.code === 'NotAuthorizedException') {
	          _this10.clearCachedTokens();
	        }
	        return callback(err, null);
	      }
	      if (authResult) {
	        var authenticationResult = authResult.AuthenticationResult;
	        if (!Object.prototype.hasOwnProperty.call(authenticationResult, 'RefreshToken')) {
	          authenticationResult.RefreshToken = refreshToken.getToken();
	        }
	        _this10.signInUserSession = _this10.getCognitoUserSession(authenticationResult);
	        _this10.cacheTokens();
	        return callback(null, _this10.signInUserSession);
	      }
	      return undefined;
	    });
	  };

	  /**
	   * This is used to save the session tokens to local storage
	   * @returns {void}
	   */


	  CognitoUser.prototype.cacheTokens = function cacheTokens() {
	    var keyPrefix = 'CognitoIdentityServiceProvider.' + this.pool.getClientId();
	    var idTokenKey = keyPrefix + '.' + this.username + '.idToken';
	    var accessTokenKey = keyPrefix + '.' + this.username + '.accessToken';
	    var refreshTokenKey = keyPrefix + '.' + this.username + '.refreshToken';
	    var clockDriftKey = keyPrefix + '.' + this.username + '.clockDrift';
	    var lastUserKey = keyPrefix + '.LastAuthUser';

	    this.storage.setItem(idTokenKey, this.signInUserSession.getIdToken().getJwtToken());
	    this.storage.setItem(accessTokenKey, this.signInUserSession.getAccessToken().getJwtToken());
	    this.storage.setItem(refreshTokenKey, this.signInUserSession.getRefreshToken().getToken());
	    this.storage.setItem(clockDriftKey, '' + this.signInUserSession.getClockDrift());
	    this.storage.setItem(lastUserKey, this.username);
	  };

	  /**
	   * This is used to cache the device key and device group and device password
	   * @returns {void}
	   */


	  CognitoUser.prototype.cacheDeviceKeyAndPassword = function cacheDeviceKeyAndPassword() {
	    var keyPrefix = 'CognitoIdentityServiceProvider.' + this.pool.getClientId() + '.' + this.username;
	    var deviceKeyKey = keyPrefix + '.deviceKey';
	    var randomPasswordKey = keyPrefix + '.randomPasswordKey';
	    var deviceGroupKeyKey = keyPrefix + '.deviceGroupKey';

	    this.storage.setItem(deviceKeyKey, this.deviceKey);
	    this.storage.setItem(randomPasswordKey, this.randomPassword);
	    this.storage.setItem(deviceGroupKeyKey, this.deviceGroupKey);
	  };

	  /**
	   * This is used to get current device key and device group and device password
	   * @returns {void}
	   */


	  CognitoUser.prototype.getCachedDeviceKeyAndPassword = function getCachedDeviceKeyAndPassword() {
	    var keyPrefix = 'CognitoIdentityServiceProvider.' + this.pool.getClientId() + '.' + this.username;
	    var deviceKeyKey = keyPrefix + '.deviceKey';
	    var randomPasswordKey = keyPrefix + '.randomPasswordKey';
	    var deviceGroupKeyKey = keyPrefix + '.deviceGroupKey';

	    if (this.storage.getItem(deviceKeyKey)) {
	      this.deviceKey = this.storage.getItem(deviceKeyKey);
	      this.randomPassword = this.storage.getItem(randomPasswordKey);
	      this.deviceGroupKey = this.storage.getItem(deviceGroupKeyKey);
	    }
	  };

	  /**
	   * This is used to clear the device key info from local storage
	   * @returns {void}
	   */


	  CognitoUser.prototype.clearCachedDeviceKeyAndPassword = function clearCachedDeviceKeyAndPassword() {
	    var keyPrefix = 'CognitoIdentityServiceProvider.' + this.pool.getClientId() + '.' + this.username;
	    var deviceKeyKey = keyPrefix + '.deviceKey';
	    var randomPasswordKey = keyPrefix + '.randomPasswordKey';
	    var deviceGroupKeyKey = keyPrefix + '.deviceGroupKey';

	    this.storage.removeItem(deviceKeyKey);
	    this.storage.removeItem(randomPasswordKey);
	    this.storage.removeItem(deviceGroupKeyKey);
	  };

	  /**
	   * This is used to clear the session tokens from local storage
	   * @returns {void}
	   */


	  CognitoUser.prototype.clearCachedTokens = function clearCachedTokens() {
	    var keyPrefix = 'CognitoIdentityServiceProvider.' + this.pool.getClientId();
	    var idTokenKey = keyPrefix + '.' + this.username + '.idToken';
	    var accessTokenKey = keyPrefix + '.' + this.username + '.accessToken';
	    var refreshTokenKey = keyPrefix + '.' + this.username + '.refreshToken';
	    var lastUserKey = keyPrefix + '.LastAuthUser';

	    this.storage.removeItem(idTokenKey);
	    this.storage.removeItem(accessTokenKey);
	    this.storage.removeItem(refreshTokenKey);
	    this.storage.removeItem(lastUserKey);
	  };

	  /**
	   * This is used to build a user session from tokens retrieved in the authentication result
	   * @param {object} authResult Successful auth response from server.
	   * @returns {CognitoUserSession} The new user session.
	   * @private
	   */


	  CognitoUser.prototype.getCognitoUserSession = function getCognitoUserSession(authResult) {
	    var idToken = new _CognitoIdToken2.default(authResult);
	    var accessToken = new _CognitoAccessToken2.default(authResult);
	    var refreshToken = new _CognitoRefreshToken2.default(authResult);

	    var sessionData = {
	      IdToken: idToken,
	      AccessToken: accessToken,
	      RefreshToken: refreshToken
	    };

	    return new _CognitoUserSession2.default(sessionData);
	  };

	  /**
	   * This is used to initiate a forgot password request
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {inputVerificationCode?} callback.inputVerificationCode
	   *    Optional callback raised instead of onSuccess with response data.
	   * @param {onSuccess} callback.onSuccess Called on success.
	   * @returns {void}
	   */


	  CognitoUser.prototype.forgotPassword = function forgotPassword(callback) {
	    var jsonReq = {
	      ClientId: this.pool.getClientId(),
	      Username: this.username
	    };
	    if (this.getUserContextData()) {
	      jsonReq.UserContextData = this.getUserContextData();
	    }
	    this.client.request('ForgotPassword', jsonReq, function (err, data) {
	      if (err) {
	        return callback.onFailure(err);
	      }
	      if (typeof callback.inputVerificationCode === 'function') {
	        return callback.inputVerificationCode(data);
	      }
	      return callback.onSuccess(data);
	    });
	  };

	  /**
	   * This is used to confirm a new password using a confirmationCode
	   * @param {string} confirmationCode Code entered by user.
	   * @param {string} newPassword Confirm new password.
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {onSuccess<void>} callback.onSuccess Called on success.
	   * @returns {void}
	   */


	  CognitoUser.prototype.confirmPassword = function confirmPassword(confirmationCode, newPassword, callback) {
	    var jsonReq = {
	      ClientId: this.pool.getClientId(),
	      Username: this.username,
	      ConfirmationCode: confirmationCode,
	      Password: newPassword
	    };
	    if (this.getUserContextData()) {
	      jsonReq.UserContextData = this.getUserContextData();
	    }
	    this.client.request('ConfirmForgotPassword', jsonReq, function (err) {
	      if (err) {
	        return callback.onFailure(err);
	      }
	      return callback.onSuccess();
	    });
	  };

	  /**
	   * This is used to initiate an attribute confirmation request
	   * @param {string} attributeName User attribute that needs confirmation.
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {inputVerificationCode} callback.inputVerificationCode Called on success.
	   * @returns {void}
	   */


	  CognitoUser.prototype.getAttributeVerificationCode = function getAttributeVerificationCode(attributeName, callback) {
	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback.onFailure(new Error('User is not authenticated'));
	    }

	    this.client.request('GetUserAttributeVerificationCode', {
	      AttributeName: attributeName,
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
	    }, function (err, data) {
	      if (err) {
	        return callback.onFailure(err);
	      }
	      if (typeof callback.inputVerificationCode === 'function') {
	        return callback.inputVerificationCode(data);
	      }
	      return callback.onSuccess();
	    });
	    return undefined;
	  };

	  /**
	   * This is used to confirm an attribute using a confirmation code
	   * @param {string} attributeName Attribute being confirmed.
	   * @param {string} confirmationCode Code entered by user.
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {onSuccess<string>} callback.onSuccess Called on success.
	   * @returns {void}
	   */


	  CognitoUser.prototype.verifyAttribute = function verifyAttribute(attributeName, confirmationCode, callback) {
	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback.onFailure(new Error('User is not authenticated'));
	    }

	    this.client.request('VerifyUserAttribute', {
	      AttributeName: attributeName,
	      Code: confirmationCode,
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
	    }, function (err) {
	      if (err) {
	        return callback.onFailure(err);
	      }
	      return callback.onSuccess('SUCCESS');
	    });
	    return undefined;
	  };

	  /**
	   * This is used to get the device information using the current device key
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {onSuccess<*>} callback.onSuccess Called on success with device data.
	   * @returns {void}
	   */


	  CognitoUser.prototype.getDevice = function getDevice(callback) {
	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback.onFailure(new Error('User is not authenticated'));
	    }

	    this.client.request('GetDevice', {
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
	      DeviceKey: this.deviceKey
	    }, function (err, data) {
	      if (err) {
	        return callback.onFailure(err);
	      }
	      return callback.onSuccess(data);
	    });
	    return undefined;
	  };

	  /**
	   * This is used to forget a specific device
	   * @param {string} deviceKey Device key.
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {onSuccess<string>} callback.onSuccess Called on success.
	   * @returns {void}
	   */


	  CognitoUser.prototype.forgetSpecificDevice = function forgetSpecificDevice(deviceKey, callback) {
	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback.onFailure(new Error('User is not authenticated'));
	    }

	    this.client.request('ForgetDevice', {
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
	      DeviceKey: deviceKey
	    }, function (err) {
	      if (err) {
	        return callback.onFailure(err);
	      }
	      return callback.onSuccess('SUCCESS');
	    });
	    return undefined;
	  };

	  /**
	   * This is used to forget the current device
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {onSuccess<string>} callback.onSuccess Called on success.
	   * @returns {void}
	   */


	  CognitoUser.prototype.forgetDevice = function forgetDevice(callback) {
	    var _this11 = this;

	    this.forgetSpecificDevice(this.deviceKey, {
	      onFailure: callback.onFailure,
	      onSuccess: function onSuccess(result) {
	        _this11.deviceKey = null;
	        _this11.deviceGroupKey = null;
	        _this11.randomPassword = null;
	        _this11.clearCachedDeviceKeyAndPassword();
	        return callback.onSuccess(result);
	      }
	    });
	  };

	  /**
	   * This is used to set the device status as remembered
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {onSuccess<string>} callback.onSuccess Called on success.
	   * @returns {void}
	   */


	  CognitoUser.prototype.setDeviceStatusRemembered = function setDeviceStatusRemembered(callback) {
	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback.onFailure(new Error('User is not authenticated'));
	    }

	    this.client.request('UpdateDeviceStatus', {
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
	      DeviceKey: this.deviceKey,
	      DeviceRememberedStatus: 'remembered'
	    }, function (err) {
	      if (err) {
	        return callback.onFailure(err);
	      }
	      return callback.onSuccess('SUCCESS');
	    });
	    return undefined;
	  };

	  /**
	   * This is used to set the device status as not remembered
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {onSuccess<string>} callback.onSuccess Called on success.
	   * @returns {void}
	   */


	  CognitoUser.prototype.setDeviceStatusNotRemembered = function setDeviceStatusNotRemembered(callback) {
	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback.onFailure(new Error('User is not authenticated'));
	    }

	    this.client.request('UpdateDeviceStatus', {
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
	      DeviceKey: this.deviceKey,
	      DeviceRememberedStatus: 'not_remembered'
	    }, function (err) {
	      if (err) {
	        return callback.onFailure(err);
	      }
	      return callback.onSuccess('SUCCESS');
	    });
	    return undefined;
	  };

	  /**
	   * This is used to list all devices for a user
	   *
	   * @param {int} limit the number of devices returned in a call
	   * @param {string} paginationToken the pagination token in case any was returned before
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {onSuccess<*>} callback.onSuccess Called on success with device list.
	   * @returns {void}
	   */


	  CognitoUser.prototype.listDevices = function listDevices(limit, paginationToken, callback) {
	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback.onFailure(new Error('User is not authenticated'));
	    }

	    this.client.request('ListDevices', {
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
	      Limit: limit,
	      PaginationToken: paginationToken
	    }, function (err, data) {
	      if (err) {
	        return callback.onFailure(err);
	      }
	      return callback.onSuccess(data);
	    });
	    return undefined;
	  };

	  /**
	   * This is used to globally revoke all tokens issued to a user
	   * @param {object} callback Result callback map.
	   * @param {onFailure} callback.onFailure Called on any error.
	   * @param {onSuccess<string>} callback.onSuccess Called on success.
	   * @returns {void}
	   */


	  CognitoUser.prototype.globalSignOut = function globalSignOut(callback) {
	    var _this12 = this;

	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback.onFailure(new Error('User is not authenticated'));
	    }

	    this.client.request('GlobalSignOut', {
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
	    }, function (err) {
	      if (err) {
	        return callback.onFailure(err);
	      }
	      _this12.clearCachedTokens();
	      return callback.onSuccess('SUCCESS');
	    });
	    return undefined;
	  };

	  /**
	   * This is used for the user to signOut of the application and clear the cached tokens.
	   * @returns {void}
	   */


	  CognitoUser.prototype.signOut = function signOut() {
	    this.signInUserSession = null;
	    this.clearCachedTokens();
	  };

	  /**
	   * This is used by a user trying to select a given MFA
	   * @param {string} answerChallenge the mfa the user wants
	   * @param {nodeCallback<string>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.sendMFASelectionAnswer = function sendMFASelectionAnswer(answerChallenge, callback) {
	    var _this13 = this;

	    var challengeResponses = {};
	    challengeResponses.USERNAME = this.username;
	    challengeResponses.ANSWER = answerChallenge;

	    var jsonReq = {
	      ChallengeName: 'SELECT_MFA_TYPE',
	      ChallengeResponses: challengeResponses,
	      ClientId: this.pool.getClientId(),
	      Session: this.Session
	    };
	    if (this.getUserContextData()) {
	      jsonReq.UserContextData = this.getUserContextData();
	    }
	    this.client.request('RespondToAuthChallenge', jsonReq, function (err, data) {
	      if (err) {
	        return callback.onFailure(err);
	      }
	      _this13.Session = data.Session;
	      if (answerChallenge === 'SMS_MFA') {
	        return callback.mfaRequired(data.challengeName, data.challengeParameters);
	      }
	      if (answerChallenge === 'SOFTWARE_TOKEN_MFA') {
	        return callback.totpRequired(data.challengeName, data.challengeParameters);
	      }
	      return undefined;
	    });
	  };

	  /**
	   * This returns the user context data for advanced security feature.
	   * @returns {void}
	   */


	  CognitoUser.prototype.getUserContextData = function getUserContextData() {
	    var pool = this.pool;
	    return pool.getUserContextData(this.username);
	  };

	  /**
	   * This is used by an authenticated or a user trying to authenticate to associate a TOTP MFA
	   * @param {nodeCallback<string>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.associateSoftwareToken = function associateSoftwareToken(callback) {
	    var _this14 = this;

	    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
	      this.client.request('AssociateSoftwareToken', {
	        Session: this.Session
	      }, function (err, data) {
	        if (err) {
	          return callback.onFailure(err);
	        }
	        _this14.Session = data.Session;
	        return callback.associateSecretCode(data.SecretCode);
	      });
	    } else {
	      this.client.request('AssociateSoftwareToken', {
	        AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
	      }, function (err, data) {
	        if (err) {
	          return callback.onFailure(err);
	        }
	        return callback.associateSecretCode(data.SecretCode);
	      });
	    }
	  };

	  /**
	   * This is used by an authenticated or a user trying to authenticate to verify a TOTP MFA
	   * @param {string} totpCode The MFA code entered by the user.
	   * @param {string} friendlyDeviceName The device name we are assigning to the device.
	   * @param {nodeCallback<string>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.verifySoftwareToken = function verifySoftwareToken(totpCode, friendlyDeviceName, callback) {
	    var _this15 = this;

	    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
	      this.client.request('VerifySoftwareToken', {
	        Session: this.Session,
	        UserCode: totpCode,
	        FriendlyDeviceName: friendlyDeviceName
	      }, function (err, data) {
	        if (err) {
	          return callback.onFailure(err);
	        }
	        _this15.Session = data.Session;
	        var challengeResponses = {};
	        challengeResponses.USERNAME = _this15.username;
	        var jsonReq = {
	          ChallengeName: 'MFA_SETUP',
	          ClientId: _this15.pool.getClientId(),
	          ChallengeResponses: challengeResponses,
	          Session: _this15.Session
	        };
	        if (_this15.getUserContextData()) {
	          jsonReq.UserContextData = _this15.getUserContextData();
	        }
	        _this15.client.request('RespondToAuthChallenge', jsonReq, function (errRespond, dataRespond) {
	          if (errRespond) {
	            return callback.onFailure(errRespond);
	          }
	          _this15.signInUserSession = _this15.getCognitoUserSession(dataRespond.AuthenticationResult);
	          _this15.cacheTokens();
	          return callback.onSuccess(_this15.signInUserSession);
	        });
	        return undefined;
	      });
	    } else {
	      this.client.request('VerifySoftwareToken', {
	        AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
	        UserCode: totpCode,
	        FriendlyDeviceName: friendlyDeviceName
	      }, function (err, data) {
	        if (err) {
	          return callback.onFailure(err);
	        }
	        return callback.onSuccess(data);
	      });
	    }
	  };

	  return CognitoUser;
	}();

	exports.default = CognitoUser;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	'use strict';

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*!
	 * Copyright 2016 Amazon.com,
	 * Inc. or its affiliates. All Rights Reserved.
	 *
	 * Licensed under the Amazon Software License (the "License").
	 * You may not use this file except in compliance with the
	 * License. A copy of the License is located at
	 *
	 *     http://aws.amazon.com/asl/
	 *
	 * or in the "license" file accompanying this file. This file is
	 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	 * CONDITIONS OF ANY KIND, express or implied. See the License
	 * for the specific language governing permissions and
	 * limitations under the License.
	 */

	/** @class */
	var CognitoUserAttribute = function () {
	  /**
	   * Constructs a new CognitoUserAttribute object
	   * @param {string=} Name The record's name
	   * @param {string=} Value The record's value
	   */
	  function CognitoUserAttribute() {
	    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	        Name = _ref.Name,
	        Value = _ref.Value;

	    _classCallCheck(this, CognitoUserAttribute);

	    this.Name = Name || '';
	    this.Value = Value || '';
	  }

	  /**
	   * @returns {string} the record's value.
	   */


	  CognitoUserAttribute.prototype.getValue = function getValue() {
	    return this.Value;
	  };

	  /**
	   * Sets the record's value.
	   * @param {string} value The new value.
	   * @returns {CognitoUserAttribute} The record for method chaining.
	   */


	  CognitoUserAttribute.prototype.setValue = function setValue(value) {
	    this.Value = value;
	    return this;
	  };

	  /**
	   * @returns {string} the record's name.
	   */


	  CognitoUserAttribute.prototype.getName = function getName() {
	    return this.Name;
	  };

	  /**
	   * Sets the record's name
	   * @param {string} name The new name.
	   * @returns {CognitoUserAttribute} The record for method chaining.
	   */


	  CognitoUserAttribute.prototype.setName = function setName(name) {
	    this.Name = name;
	    return this;
	  };

	  /**
	   * @returns {string} a string representation of the record.
	   */


	  CognitoUserAttribute.prototype.toString = function toString() {
	    return JSON.stringify(this);
	  };

	  /**
	   * @returns {object} a flat object representing the record.
	   */


	  CognitoUserAttribute.prototype.toJSON = function toJSON() {
	    return {
	      Name: this.Name,
	      Value: this.Value
	    };
	  };

	  return CognitoUserAttribute;
	}();

	exports.default = CognitoUserAttribute;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	'use strict';

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*!
	 * Copyright 2016 Amazon.com,
	 * Inc. or its affiliates. All Rights Reserved.
	 *
	 * Licensed under the Amazon Software License (the "License").
	 * You may not use this file except in compliance with the
	 * License. A copy of the License is located at
	 *
	 *     http://aws.amazon.com/asl/
	 *
	 * or in the "license" file accompanying this file. This file is
	 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	 * CONDITIONS OF ANY KIND, express or implied. See the License
	 * for the specific language governing permissions and
	 * limitations under the License.
	 */

	/** @class */
	var CognitoUserSession = function () {
	  /**
	   * Constructs a new CognitoUserSession object
	   * @param {CognitoIdToken} IdToken The session's Id token.
	   * @param {CognitoRefreshToken=} RefreshToken The session's refresh token.
	   * @param {CognitoAccessToken} AccessToken The session's access token.
	   * @param {int} ClockDrift The saved computer's clock drift or undefined to force calculation.
	   */
	  function CognitoUserSession() {
	    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	        IdToken = _ref.IdToken,
	        RefreshToken = _ref.RefreshToken,
	        AccessToken = _ref.AccessToken,
	        ClockDrift = _ref.ClockDrift;

	    _classCallCheck(this, CognitoUserSession);

	    if (AccessToken == null || IdToken == null) {
	      throw new Error('Id token and Access Token must be present.');
	    }

	    this.idToken = IdToken;
	    this.refreshToken = RefreshToken;
	    this.accessToken = AccessToken;
	    this.clockDrift = ClockDrift === undefined ? this.calculateClockDrift() : ClockDrift;
	  }

	  /**
	   * @returns {CognitoIdToken} the session's Id token
	   */


	  CognitoUserSession.prototype.getIdToken = function getIdToken() {
	    return this.idToken;
	  };

	  /**
	   * @returns {CognitoRefreshToken} the session's refresh token
	   */


	  CognitoUserSession.prototype.getRefreshToken = function getRefreshToken() {
	    return this.refreshToken;
	  };

	  /**
	   * @returns {CognitoAccessToken} the session's access token
	   */


	  CognitoUserSession.prototype.getAccessToken = function getAccessToken() {
	    return this.accessToken;
	  };

	  /**
	   * @returns {int} the session's clock drift
	   */


	  CognitoUserSession.prototype.getClockDrift = function getClockDrift() {
	    return this.clockDrift;
	  };

	  /**
	   * @returns {int} the computer's clock drift
	   */


	  CognitoUserSession.prototype.calculateClockDrift = function calculateClockDrift() {
	    var now = Math.floor(new Date() / 1000);
	    var iat = Math.min(this.accessToken.getIssuedAt(), this.idToken.getIssuedAt());

	    return now - iat;
	  };

	  /**
	   * Checks to see if the session is still valid based on session expiry information found
	   * in tokens and the current time (adjusted with clock drift)
	   * @returns {boolean} if the session is still valid
	   */


	  CognitoUserSession.prototype.isValid = function isValid() {
	    var now = Math.floor(new Date() / 1000);
	    var adjusted = now - this.clockDrift;

	    return adjusted < this.accessToken.getExpiration() && adjusted < this.idToken.getExpiration();
	  };

	  return CognitoUserSession;
	}();

	exports.default = CognitoUserSession;

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	'use strict';

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*!
	 * Copyright 2016 Amazon.com,
	 * Inc. or its affiliates. All Rights Reserved.
	 *
	 * Licensed under the Amazon Software License (the "License").
	 * You may not use this file except in compliance with the
	 * License. A copy of the License is located at
	 *
	 *     http://aws.amazon.com/asl/
	 *
	 * or in the "license" file accompanying this file. This file is
	 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	 * CONDITIONS OF ANY KIND, express or implied. See the License
	 * for the specific language governing permissions and
	 * limitations under the License.
	 */

	var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var weekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	/** @class */

	var DateHelper = function () {
	  function DateHelper() {
	    _classCallCheck(this, DateHelper);
	  }

	  /**
	   * @returns {string} The current time in "ddd MMM D HH:mm:ss UTC YYYY" format.
	   */
	  DateHelper.prototype.getNowString = function getNowString() {
	    var now = new Date();

	    var weekDay = weekNames[now.getUTCDay()];
	    var month = monthNames[now.getUTCMonth()];
	    var day = now.getUTCDate();

	    var hours = now.getUTCHours();
	    if (hours < 10) {
	      hours = '0' + hours;
	    }

	    var minutes = now.getUTCMinutes();
	    if (minutes < 10) {
	      minutes = '0' + minutes;
	    }

	    var seconds = now.getUTCSeconds();
	    if (seconds < 10) {
	      seconds = '0' + seconds;
	    }

	    var year = now.getUTCFullYear();

	    // ddd MMM D HH:mm:ss UTC YYYY
	    var dateNow = weekDay + ' ' + month + ' ' + day + ' ' + hours + ':' + minutes + ':' + seconds + ' UTC ' + year;

	    return dateNow;
	  };

	  return DateHelper;
	}();

	exports.default = DateHelper;

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	'use strict';

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*!
	 * Copyright 2016 Amazon.com,
	 * Inc. or its affiliates. All Rights Reserved.
	 *
	 * Licensed under the Amazon Software License (the "License").
	 * You may not use this file except in compliance with the
	 * License. A copy of the License is located at
	 *
	 *     http://aws.amazon.com/asl/
	 *
	 * or in the "license" file accompanying this file. This file is
	 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	 * CONDITIONS OF ANY KIND, express or implied. See the License
	 * for the specific language governing permissions and
	 * limitations under the License.
	 */

	var dataMemory = {};

	/** @class */

	var MemoryStorage = function () {
	  function MemoryStorage() {
	    _classCallCheck(this, MemoryStorage);
	  }

	  /**
	   * This is used to set a specific item in storage
	   * @param {string} key - the key for the item
	   * @param {object} value - the value
	   * @returns {string} value that was set
	   */
	  MemoryStorage.setItem = function setItem(key, value) {
	    dataMemory[key] = value;
	    return dataMemory[key];
	  };

	  /**
	   * This is used to get a specific key from storage
	   * @param {string} key - the key for the item
	   * This is used to clear the storage
	   * @returns {string} the data item
	   */


	  MemoryStorage.getItem = function getItem(key) {
	    return Object.prototype.hasOwnProperty.call(dataMemory, key) ? dataMemory[key] : undefined;
	  };

	  /**
	   * This is used to remove an item from storage
	   * @param {string} key - the key being set
	   * @returns {string} value - value that was deleted
	   */


	  MemoryStorage.removeItem = function removeItem(key) {
	    return delete dataMemory[key];
	  };

	  /**
	   * This is used to clear the storage
	   * @returns {string} nothing
	   */


	  MemoryStorage.clear = function clear() {
	    dataMemory = {};
	    return dataMemory;
	  };

	  return MemoryStorage;
	}();

	/** @class */


	var StorageHelper = function () {

	  /**
	   * This is used to get a storage object
	   * @returns {object} the storage
	   */
	  function StorageHelper() {
	    _classCallCheck(this, StorageHelper);

	    try {
	      this.storageWindow = window.localStorage;
	      this.storageWindow.setItem('aws.cognito.test-ls', 1);
	      this.storageWindow.removeItem('aws.cognito.test-ls');
	    } catch (exception) {
	      this.storageWindow = MemoryStorage;
	    }
	  }

	  /**
	   * This is used to return the storage
	   * @returns {object} the storage
	   */


	  StorageHelper.prototype.getStorage = function getStorage() {
	    return this.storageWindow;
	  };

	  return StorageHelper;
	}();

	exports.default = StorageHelper;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	var Buffer = __webpack_require__(1).Buffer
	var sha = __webpack_require__(26)
	var sha256 = __webpack_require__(27)
	var rng = __webpack_require__(25)
	var md5 = __webpack_require__(24)

	var algorithms = {
	  sha1: sha,
	  sha256: sha256,
	  md5: md5
	}

	var blocksize = 64
	var zeroBuffer = new Buffer(blocksize); zeroBuffer.fill(0)
	function hmac(fn, key, data) {
	  if(!Buffer.isBuffer(key)) key = new Buffer(key)
	  if(!Buffer.isBuffer(data)) data = new Buffer(data)

	  if(key.length > blocksize) {
	    key = fn(key)
	  } else if(key.length < blocksize) {
	    key = Buffer.concat([key, zeroBuffer], blocksize)
	  }

	  var ipad = new Buffer(blocksize), opad = new Buffer(blocksize)
	  for(var i = 0; i < blocksize; i++) {
	    ipad[i] = key[i] ^ 0x36
	    opad[i] = key[i] ^ 0x5C
	  }

	  var hash = fn(Buffer.concat([ipad, data]))
	  return fn(Buffer.concat([opad, hash]))
	}

	function hash(alg, key) {
	  alg = alg || 'sha1'
	  var fn = algorithms[alg]
	  var bufs = []
	  var length = 0
	  if(!fn) error('algorithm:', alg, 'is not yet supported')
	  return {
	    update: function (data) {
	      if(!Buffer.isBuffer(data)) data = new Buffer(data)
	        
	      bufs.push(data)
	      length += data.length
	      return this
	    },
	    digest: function (enc) {
	      var buf = Buffer.concat(bufs)
	      var r = key ? hmac(fn, key, buf) : fn(buf)
	      bufs = null
	      return enc ? r.toString(enc) : r
	    }
	  }
	}

	function error () {
	  var m = [].slice.call(arguments).join(' ')
	  throw new Error([
	    m,
	    'we accept pull requests',
	    'http://github.com/dominictarr/crypto-browserify'
	    ].join('\n'))
	}

	exports.createHash = function (alg) { return hash(alg) }
	exports.createHmac = function (alg, key) { return hash(alg, key) }
	exports.randomBytes = function(size, callback) {
	  if (callback && callback.call) {
	    try {
	      callback.call(this, undefined, new Buffer(rng(size)))
	    } catch (err) { callback(err) }
	  } else {
	    return new Buffer(rng(size))
	  }
	}

	function each(a, f) {
	  for(var i in a)
	    f(a[i], i)
	}

	// the least I can do is make error messages for the rest of the node.js/crypto api.
	each(['createCredentials'
	, 'createCipher'
	, 'createCipheriv'
	, 'createDecipher'
	, 'createDecipheriv'
	, 'createSign'
	, 'createVerify'
	, 'createDiffieHellman'
	, 'pbkdf2'], function (name) {
	  exports[name] = function () {
	    error('sorry,', name, 'is not implemented yet')
	  }
	})


/***/ }),
/* 15 */
/***/ (function(module, exports) {

	'use strict'

	exports.byteLength = byteLength
	exports.toByteArray = toByteArray
	exports.fromByteArray = fromByteArray

	var lookup = []
	var revLookup = []
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	for (var i = 0, len = code.length; i < len; ++i) {
	  lookup[i] = code[i]
	  revLookup[code.charCodeAt(i)] = i
	}

	revLookup['-'.charCodeAt(0)] = 62
	revLookup['_'.charCodeAt(0)] = 63

	function placeHoldersCount (b64) {
	  var len = b64.length
	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }

	  // the number of equal signs (place holders)
	  // if there are two placeholders, than the two characters before it
	  // represent one byte
	  // if there is only one, then the three characters before it represent 2 bytes
	  // this is just a cheap hack to not do indexOf twice
	  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
	}

	function byteLength (b64) {
	  // base64 is 4/3 + up to two characters of the original data
	  return (b64.length * 3 / 4) - placeHoldersCount(b64)
	}

	function toByteArray (b64) {
	  var i, l, tmp, placeHolders, arr
	  var len = b64.length
	  placeHolders = placeHoldersCount(b64)

	  arr = new Arr((len * 3 / 4) - placeHolders)

	  // if there are placeholders, only get up to the last complete 4 chars
	  l = placeHolders > 0 ? len - 4 : len

	  var L = 0

	  for (i = 0; i < l; i += 4) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
	    arr[L++] = (tmp >> 16) & 0xFF
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }

	  if (placeHolders === 2) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
	    arr[L++] = tmp & 0xFF
	  } else if (placeHolders === 1) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }

	  return arr
	}

	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	  var tmp
	  var output = []
	  for (var i = start; i < end; i += 3) {
	    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
	    output.push(tripletToBase64(tmp))
	  }
	  return output.join('')
	}

	function fromByteArray (uint8) {
	  var tmp
	  var len = uint8.length
	  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
	  var output = ''
	  var parts = []
	  var maxChunkLength = 16383 // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1]
	    output += lookup[tmp >> 2]
	    output += lookup[(tmp << 4) & 0x3F]
	    output += '=='
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
	    output += lookup[tmp >> 10]
	    output += lookup[(tmp >> 4) & 0x3F]
	    output += lookup[(tmp << 2) & 0x3F]
	    output += '='
	  }

	  parts.push(output)

	  return parts.join('')
	}


/***/ }),
/* 16 */
/***/ (function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ }),
/* 17 */
/***/ (function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * JavaScript Cookie v2.2.0
	 * https://github.com/js-cookie/js-cookie
	 *
	 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
	 * Released under the MIT license
	 */
	;(function (factory) {
		var registeredInModuleLoader = false;
		if (true) {
			!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
			registeredInModuleLoader = true;
		}
		if (true) {
			module.exports = factory();
			registeredInModuleLoader = true;
		}
		if (!registeredInModuleLoader) {
			var OldCookies = window.Cookies;
			var api = window.Cookies = factory();
			api.noConflict = function () {
				window.Cookies = OldCookies;
				return api;
			};
		}
	}(function () {
		function extend () {
			var i = 0;
			var result = {};
			for (; i < arguments.length; i++) {
				var attributes = arguments[ i ];
				for (var key in attributes) {
					result[key] = attributes[key];
				}
			}
			return result;
		}

		function init (converter) {
			function api (key, value, attributes) {
				var result;
				if (typeof document === 'undefined') {
					return;
				}

				// Write

				if (arguments.length > 1) {
					attributes = extend({
						path: '/'
					}, api.defaults, attributes);

					if (typeof attributes.expires === 'number') {
						var expires = new Date();
						expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
						attributes.expires = expires;
					}

					// We're using "expires" because "max-age" is not supported by IE
					attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

					try {
						result = JSON.stringify(value);
						if (/^[\{\[]/.test(result)) {
							value = result;
						}
					} catch (e) {}

					if (!converter.write) {
						value = encodeURIComponent(String(value))
							.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
					} else {
						value = converter.write(value, key);
					}

					key = encodeURIComponent(String(key));
					key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
					key = key.replace(/[\(\)]/g, escape);

					var stringifiedAttributes = '';

					for (var attributeName in attributes) {
						if (!attributes[attributeName]) {
							continue;
						}
						stringifiedAttributes += '; ' + attributeName;
						if (attributes[attributeName] === true) {
							continue;
						}
						stringifiedAttributes += '=' + attributes[attributeName];
					}
					return (document.cookie = key + '=' + value + stringifiedAttributes);
				}

				// Read

				if (!key) {
					result = {};
				}

				// To prevent the for loop in the first place assign an empty array
				// in case there are no cookies at all. Also prevents odd result when
				// calling "get()"
				var cookies = document.cookie ? document.cookie.split('; ') : [];
				var rdecode = /(%[0-9A-Z]{2})+/g;
				var i = 0;

				for (; i < cookies.length; i++) {
					var parts = cookies[i].split('=');
					var cookie = parts.slice(1).join('=');

					if (!this.json && cookie.charAt(0) === '"') {
						cookie = cookie.slice(1, -1);
					}

					try {
						var name = parts[0].replace(rdecode, decodeURIComponent);
						cookie = converter.read ?
							converter.read(cookie, name) : converter(cookie, name) ||
							cookie.replace(rdecode, decodeURIComponent);

						if (this.json) {
							try {
								cookie = JSON.parse(cookie);
							} catch (e) {}
						}

						if (key === name) {
							result = cookie;
							break;
						}

						if (!key) {
							result[name] = cookie;
						}
					} catch (e) {}
				}

				return result;
			}

			api.set = api;
			api.get = function (key) {
				return api.call(api, key);
			};
			api.getJSON = function () {
				return api.apply({
					json: true
				}, [].slice.call(arguments));
			};
			api.defaults = {};

			api.remove = function (key, attributes) {
				api(key, '', extend(attributes, {
					expires: -1
				}));
			};

			api.withConverter = init;

			return api;
		}

		return init(function () {});
	}));


/***/ }),
/* 19 */
/***/ (function(module, exports) {

	"use strict";

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*!
	 * Copyright 2016 Amazon.com,
	 * Inc. or its affiliates. All Rights Reserved.
	 *
	 * Licensed under the Amazon Software License (the "License").
	 * You may not use this file except in compliance with the
	 * License. A copy of the License is located at
	 *
	 *     http://aws.amazon.com/asl/
	 *
	 * or in the "license" file accompanying this file. This file is
	 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	 * CONDITIONS OF ANY KIND, express or implied. See the License
	 * for the specific language governing permissions and
	 * limitations under the License.
	 */

	/** @class */
	var AuthenticationDetails = function () {
	  /**
	   * Constructs a new AuthenticationDetails object
	   * @param {object=} data Creation options.
	   * @param {string} data.Username User being authenticated.
	   * @param {string} data.Password Plain-text password to authenticate with.
	   * @param {(AttributeArg[])?} data.ValidationData Application extra metadata.
	   * @param {(AttributeArg[])?} data.AuthParamaters Authentication paramaters for custom auth.
	   */
	  function AuthenticationDetails(data) {
	    _classCallCheck(this, AuthenticationDetails);

	    var _ref = data || {},
	        ValidationData = _ref.ValidationData,
	        Username = _ref.Username,
	        Password = _ref.Password,
	        AuthParameters = _ref.AuthParameters;

	    this.validationData = ValidationData || {};
	    this.authParameters = AuthParameters || {};
	    this.username = Username;
	    this.password = Password;
	  }

	  /**
	   * @returns {string} the record's username
	   */


	  AuthenticationDetails.prototype.getUsername = function getUsername() {
	    return this.username;
	  };

	  /**
	   * @returns {string} the record's password
	   */


	  AuthenticationDetails.prototype.getPassword = function getPassword() {
	    return this.password;
	  };

	  /**
	   * @returns {Array} the record's validationData
	   */


	  AuthenticationDetails.prototype.getValidationData = function getValidationData() {
	    return this.validationData;
	  };

	  /**
	   * @returns {Array} the record's authParameters
	   */


	  AuthenticationDetails.prototype.getAuthParameters = function getAuthParameters() {
	    return this.authParameters;
	  };

	  return AuthenticationDetails;
	}();

	exports.default = AuthenticationDetails;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _UserAgent = __webpack_require__(23);

	var _UserAgent2 = _interopRequireDefault(_UserAgent);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/** @class */
	var Client = function () {
	  /**
	   * Constructs a new AWS Cognito Identity Provider client object
	   * @param {string} region AWS region
	   * @param {string} endpoint endpoint
	   */
	  function Client(region, endpoint) {
	    _classCallCheck(this, Client);

	    this.endpoint = endpoint || 'https://cognito-idp.' + region + '.amazonaws.com/';
	    this.userAgent = _UserAgent2.default.prototype.userAgent || 'aws-amplify/0.1.x js';
	  }

	  /**
	   * Makes an unauthenticated request on AWS Cognito Identity Provider API
	   * using fetch
	   * @param {string} operation API operation
	   * @param {object} params Input parameters
	   * @param {function} callback Callback called when a response is returned
	   * @returns {void}
	  */


	  Client.prototype.request = function request(operation, params, callback) {
	    var headers = {
	      'Content-Type': 'application/x-amz-json-1.1',
	      'X-Amz-Target': 'AWSCognitoIdentityProviderService.' + operation,
	      'X-Amz-User-Agent': this.userAgent
	    };

	    var options = {
	      headers: headers,
	      method: 'POST',
	      mode: 'cors',
	      cache: 'no-cache',
	      body: JSON.stringify(params)
	    };

	    var response = void 0;

	    fetch(this.endpoint, options).then(function (resp) {
	      response = resp;
	      return resp;
	    }).then(function (resp) {
	      return resp.json().catch(function () {
	        return {};
	      });
	    }).then(function (data) {
	      if (response.ok) return callback(null, data);

	      // Taken from aws-sdk-js/lib/protocol/json.js
	      // eslint-disable-next-line no-underscore-dangle
	      var code = (data.__type || data.code).split('#').pop();
	      var error = {
	        code: code,
	        name: code,
	        message: data.message || data.Message || null
	      };
	      return callback(error);
	    }).catch(function () {
	      // Taken from aws-sdk-js/lib/protocol/json.js
	      var code = (response.headers.get('x-amzn-errortype') || 'UnknownError').split(':')[0];
	      var error = {
	        code: code,
	        name: code,
	        statusCode: response.status,
	        message: response.status.toString()
	      };
	      return callback(error);
	    });
	  };

	  return Client;
	}();

	exports.default = Client;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _Client = __webpack_require__(20);

	var _Client2 = _interopRequireDefault(_Client);

	var _CognitoUser = __webpack_require__(9);

	var _CognitoUser2 = _interopRequireDefault(_CognitoUser);

	var _StorageHelper = __webpack_require__(13);

	var _StorageHelper2 = _interopRequireDefault(_StorageHelper);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /*!
	                                                                                                                                                           * Copyright 2016 Amazon.com,
	                                                                                                                                                           * Inc. or its affiliates. All Rights Reserved.
	                                                                                                                                                           *
	                                                                                                                                                           * Licensed under the Amazon Software License (the "License").
	                                                                                                                                                           * You may not use this file except in compliance with the
	                                                                                                                                                           * License. A copy of the License is located at
	                                                                                                                                                           *
	                                                                                                                                                           *     http://aws.amazon.com/asl/
	                                                                                                                                                           *
	                                                                                                                                                           * or in the "license" file accompanying this file. This file is
	                                                                                                                                                           * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	                                                                                                                                                           * CONDITIONS OF ANY KIND, express or implied. See the License
	                                                                                                                                                           * for the specific language governing permissions and
	                                                                                                                                                           * limitations under the License.
	                                                                                                                                                           */

	/** @class */
	var CognitoUserPool = function () {
	  /**
	   * Constructs a new CognitoUserPool object
	   * @param {object} data Creation options.
	   * @param {string} data.UserPoolId Cognito user pool id.
	   * @param {string} data.ClientId User pool application client id.
	   * @param {object} data.Storage Optional storage object.
	   * @param {boolean} data.AdvancedSecurityDataCollectionFlag Optional:
	   *        boolean flag indicating if the data collection is enabled
	   *        to support cognito advanced security features. By default, this
	   *        flag is set to true.
	   */
	  function CognitoUserPool(data) {
	    _classCallCheck(this, CognitoUserPool);

	    var _ref = data || {},
	        UserPoolId = _ref.UserPoolId,
	        ClientId = _ref.ClientId,
	        endpoint = _ref.endpoint,
	        AdvancedSecurityDataCollectionFlag = _ref.AdvancedSecurityDataCollectionFlag;

	    if (!UserPoolId || !ClientId) {
	      throw new Error('Both UserPoolId and ClientId are required.');
	    }
	    if (!/^[\w-]+_.+$/.test(UserPoolId)) {
	      throw new Error('Invalid UserPoolId format.');
	    }
	    var region = UserPoolId.split('_')[0];

	    this.userPoolId = UserPoolId;
	    this.clientId = ClientId;

	    this.client = new _Client2.default(region, endpoint);

	    /**
	     * By default, AdvancedSecurityDataCollectionFlag is set to true,
	     * if no input value is provided.
	     */
	    this.advancedSecurityDataCollectionFlag = AdvancedSecurityDataCollectionFlag !== false;

	    this.storage = data.Storage || new _StorageHelper2.default().getStorage();
	  }

	  /**
	   * @returns {string} the user pool id
	   */


	  CognitoUserPool.prototype.getUserPoolId = function getUserPoolId() {
	    return this.userPoolId;
	  };

	  /**
	   * @returns {string} the client id
	   */


	  CognitoUserPool.prototype.getClientId = function getClientId() {
	    return this.clientId;
	  };

	  /**
	   * @typedef {object} SignUpResult
	   * @property {CognitoUser} user New user.
	   * @property {bool} userConfirmed If the user is already confirmed.
	   */
	  /**
	   * method for signing up a user
	   * @param {string} username User's username.
	   * @param {string} password Plain-text initial password entered by user.
	   * @param {(AttributeArg[])=} userAttributes New user attributes.
	   * @param {(AttributeArg[])=} validationData Application metadata.
	   * @param {nodeCallback<SignUpResult>} callback Called on error or with the new user.
	   * @returns {void}
	   */


	  CognitoUserPool.prototype.signUp = function signUp(username, password, userAttributes, validationData, callback) {
	    var _this = this;

	    var jsonReq = {
	      ClientId: this.clientId,
	      Username: username,
	      Password: password,
	      UserAttributes: userAttributes,
	      ValidationData: validationData
	    };
	    if (this.getUserContextData(username)) {
	      jsonReq.UserContextData = this.getUserContextData(username);
	    }
	    this.client.request('SignUp', jsonReq, function (err, data) {
	      if (err) {
	        return callback(err, null);
	      }

	      var cognitoUser = {
	        Username: username,
	        Pool: _this,
	        Storage: _this.storage
	      };

	      var returnData = {
	        user: new _CognitoUser2.default(cognitoUser),
	        userConfirmed: data.UserConfirmed,
	        userSub: data.UserSub
	      };

	      return callback(null, returnData);
	    });
	  };

	  /**
	   * method for getting the current user of the application from the local storage
	   *
	   * @returns {CognitoUser} the user retrieved from storage
	   */


	  CognitoUserPool.prototype.getCurrentUser = function getCurrentUser() {
	    var lastUserKey = 'CognitoIdentityServiceProvider.' + this.clientId + '.LastAuthUser';

	    var lastAuthUser = this.storage.getItem(lastUserKey);
	    if (lastAuthUser) {
	      var cognitoUser = {
	        Username: lastAuthUser,
	        Pool: this,
	        Storage: this.storage
	      };

	      return new _CognitoUser2.default(cognitoUser);
	    }

	    return null;
	  };

	  /**
	   * This method returns the encoded data string used for cognito advanced security feature.
	   * This would be generated only when developer has included the JS used for collecting the
	   * data on their client. Please refer to documentation to know more about using AdvancedSecurity
	   * features
	   * @param {string} username the username for the context data
	   * @returns {string} the user context data
	   **/


	  CognitoUserPool.prototype.getUserContextData = function getUserContextData(username) {
	    if (typeof AmazonCognitoAdvancedSecurityData === 'undefined') {
	      return undefined;
	    }
	    /* eslint-disable */
	    var amazonCognitoAdvancedSecurityDataConst = AmazonCognitoAdvancedSecurityData;
	    /* eslint-enable */

	    if (this.advancedSecurityDataCollectionFlag) {
	      var advancedSecurityData = amazonCognitoAdvancedSecurityDataConst.getData(username, this.userPoolId, this.clientId);
	      if (advancedSecurityData) {
	        var userContextData = {
	          EncodedData: advancedSecurityData
	        };
	        return userContextData;
	      }
	    }
	    return {};
	  };

	  return CognitoUserPool;
	}();

	exports.default = CognitoUserPool;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _jsCookie = __webpack_require__(18);

	var Cookies = _interopRequireWildcard(_jsCookie);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/** @class */
	var CookieStorage = function () {

	  /**
	   * Constructs a new CookieStorage object
	   * @param {object} data Creation options.
	   * @param {string} data.domain Cookies domain (mandatory).
	   * @param {string} data.path Cookies path (default: '/')
	   * @param {integer} data.expires Cookie expiration (in days, default: 365)
	   * @param {boolean} data.secure Cookie secure flag (default: true)
	   */
	  function CookieStorage(data) {
	    _classCallCheck(this, CookieStorage);

	    this.domain = data.domain;
	    if (data.path) {
	      this.path = data.path;
	    } else {
	      this.path = '/';
	    }
	    if (Object.prototype.hasOwnProperty.call(data, 'expires')) {
	      this.expires = data.expires;
	    } else {
	      this.expires = 365;
	    }
	    if (Object.prototype.hasOwnProperty.call(data, 'secure')) {
	      this.secure = data.secure;
	    } else {
	      this.secure = true;
	    }
	  }

	  /**
	   * This is used to set a specific item in storage
	   * @param {string} key - the key for the item
	   * @param {object} value - the value
	   * @returns {string} value that was set
	   */


	  CookieStorage.prototype.setItem = function setItem(key, value) {
	    Cookies.set(key, value, {
	      path: this.path,
	      expires: this.expires,
	      domain: this.domain,
	      secure: this.secure
	    });
	    return Cookies.get(key);
	  };

	  /**
	   * This is used to get a specific key from storage
	   * @param {string} key - the key for the item
	   * This is used to clear the storage
	   * @returns {string} the data item
	   */


	  CookieStorage.prototype.getItem = function getItem(key) {
	    return Cookies.get(key);
	  };

	  /**
	   * This is used to remove an item from storage
	   * @param {string} key - the key being set
	   * @returns {string} value - value that was deleted
	   */


	  CookieStorage.prototype.removeItem = function removeItem(key) {
	    return Cookies.remove(key, {
	      path: this.path,
	      domain: this.domain,
	      secure: this.secure
	    });
	  };

	  /**
	   * This is used to clear the storage
	   * @returns {string} nothing
	   */


	  CookieStorage.prototype.clear = function clear() {
	    var cookies = Cookies.get();
	    var index = void 0;
	    for (index = 0; index < cookies.length; ++index) {
	      Cookies.remove(cookies[index]);
	    }
	    return {};
	  };

	  return CookieStorage;
	}();

	exports.default = CookieStorage;

/***/ }),
/* 23 */
/***/ (function(module, exports) {

	'use strict';

	exports.__esModule = true;
	// class for defining the amzn user-agent
	exports.default = UserAgent;
	// constructor

	function UserAgent() {}
	// public
	UserAgent.prototype.userAgent = 'aws-amplify/0.1.x js';

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */

	var helpers = __webpack_require__(2);

	/*
	 * Perform a simple self-test to see if the VM is working
	 */
	function md5_vm_test()
	{
	  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
	}

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	function core_md5(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;

	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;

	    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
	    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
	    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
	    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
	    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
	    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
	    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
	    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
	    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
	    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
	    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

	    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
	    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
	    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
	    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
	    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
	    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
	    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
	    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
	    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
	    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
	    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
	    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

	    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
	    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
	    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
	    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
	    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
	    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
	    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
	    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
	    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
	    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
	    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
	    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
	    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

	    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
	    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
	    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
	    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
	    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
	    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
	    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
	    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
	    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
	    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
	    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	  }
	  return Array(a, b, c, d);

	}

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t)
	{
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t)
	{
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t)
	{
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}

	module.exports = function md5(buf) {
	  return helpers.hash(buf, core_md5, 16);
	};


/***/ }),
/* 25 */
/***/ (function(module, exports) {

	// Original code adapted from Robert Kieffer.
	// details at https://github.com/broofa/node-uuid
	(function() {
	  var _global = this;

	  var mathRNG, whatwgRNG;

	  // NOTE: Math.random() does not guarantee "cryptographic quality"
	  mathRNG = function(size) {
	    var bytes = new Array(size);
	    var r;

	    for (var i = 0, r; i < size; i++) {
	      if ((i & 0x03) == 0) r = Math.random() * 0x100000000;
	      bytes[i] = r >>> ((i & 0x03) << 3) & 0xff;
	    }

	    return bytes;
	  }

	  if (_global.crypto && crypto.getRandomValues) {
	    whatwgRNG = function(size) {
	      var bytes = new Uint8Array(size);
	      crypto.getRandomValues(bytes);
	      return bytes;
	    }
	  }

	  module.exports = whatwgRNG || mathRNG;

	}())


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
	 * in FIPS PUB 180-1
	 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for details.
	 */

	var helpers = __webpack_require__(2);

	/*
	 * Calculate the SHA-1 of an array of big-endian words, and a bit length
	 */
	function core_sha1(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << (24 - len % 32);
	  x[((len + 64 >> 9) << 4) + 15] = len;

	  var w = Array(80);
	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;
	  var e = -1009589776;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;
	    var olde = e;

	    for(var j = 0; j < 80; j++)
	    {
	      if(j < 16) w[j] = x[i + j];
	      else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
	      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
	                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
	      e = d;
	      d = c;
	      c = rol(b, 30);
	      b = a;
	      a = t;
	    }

	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	    e = safe_add(e, olde);
	  }
	  return Array(a, b, c, d, e);

	}

	/*
	 * Perform the appropriate triplet combination function for the current
	 * iteration
	 */
	function sha1_ft(t, b, c, d)
	{
	  if(t < 20) return (b & c) | ((~b) & d);
	  if(t < 40) return b ^ c ^ d;
	  if(t < 60) return (b & c) | (b & d) | (c & d);
	  return b ^ c ^ d;
	}

	/*
	 * Determine the appropriate additive constant for the current iteration
	 */
	function sha1_kt(t)
	{
	  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
	         (t < 60) ? -1894007588 : -899497514;
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}

	module.exports = function sha1(buf) {
	  return helpers.hash(buf, core_sha1, 20, true);
	};


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	
	/**
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
	 * in FIPS 180-2
	 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 *
	 */

	var helpers = __webpack_require__(2);

	var safe_add = function(x, y) {
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	};

	var S = function(X, n) {
	  return (X >>> n) | (X << (32 - n));
	};

	var R = function(X, n) {
	  return (X >>> n);
	};

	var Ch = function(x, y, z) {
	  return ((x & y) ^ ((~x) & z));
	};

	var Maj = function(x, y, z) {
	  return ((x & y) ^ (x & z) ^ (y & z));
	};

	var Sigma0256 = function(x) {
	  return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
	};

	var Sigma1256 = function(x) {
	  return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
	};

	var Gamma0256 = function(x) {
	  return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
	};

	var Gamma1256 = function(x) {
	  return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
	};

	var core_sha256 = function(m, l) {
	  var K = new Array(0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0xFC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x6CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2);
	  var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
	    var W = new Array(64);
	    var a, b, c, d, e, f, g, h, i, j;
	    var T1, T2;
	  /* append padding */
	  m[l >> 5] |= 0x80 << (24 - l % 32);
	  m[((l + 64 >> 9) << 4) + 15] = l;
	  for (var i = 0; i < m.length; i += 16) {
	    a = HASH[0]; b = HASH[1]; c = HASH[2]; d = HASH[3]; e = HASH[4]; f = HASH[5]; g = HASH[6]; h = HASH[7];
	    for (var j = 0; j < 64; j++) {
	      if (j < 16) {
	        W[j] = m[j + i];
	      } else {
	        W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
	      }
	      T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
	      T2 = safe_add(Sigma0256(a), Maj(a, b, c));
	      h = g; g = f; f = e; e = safe_add(d, T1); d = c; c = b; b = a; a = safe_add(T1, T2);
	    }
	    HASH[0] = safe_add(a, HASH[0]); HASH[1] = safe_add(b, HASH[1]); HASH[2] = safe_add(c, HASH[2]); HASH[3] = safe_add(d, HASH[3]);
	    HASH[4] = safe_add(e, HASH[4]); HASH[5] = safe_add(f, HASH[5]); HASH[6] = safe_add(g, HASH[6]); HASH[7] = safe_add(h, HASH[7]);
	  }
	  return HASH;
	};

	module.exports = function sha256(buf) {
	  return helpers.hash(buf, core_sha256, 32, true);
	};


/***/ })
/******/ ])
});
;