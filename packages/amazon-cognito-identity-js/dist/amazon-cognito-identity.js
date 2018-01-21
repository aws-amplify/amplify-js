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

	var _AuthenticationDetails = __webpack_require__(58);

	Object.defineProperty(exports, 'AuthenticationDetails', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_AuthenticationDetails).default;
	  }
	});

	var _AuthenticationHelper = __webpack_require__(26);

	Object.defineProperty(exports, 'AuthenticationHelper', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_AuthenticationHelper).default;
	  }
	});

	var _CognitoAccessToken = __webpack_require__(28);

	Object.defineProperty(exports, 'CognitoAccessToken', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CognitoAccessToken).default;
	  }
	});

	var _CognitoIdToken = __webpack_require__(29);

	Object.defineProperty(exports, 'CognitoIdToken', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CognitoIdToken).default;
	  }
	});

	var _CognitoRefreshToken = __webpack_require__(31);

	Object.defineProperty(exports, 'CognitoRefreshToken', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CognitoRefreshToken).default;
	  }
	});

	var _CognitoUser = __webpack_require__(32);

	Object.defineProperty(exports, 'CognitoUser', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CognitoUser).default;
	  }
	});

	var _CognitoUserAttribute = __webpack_require__(33);

	Object.defineProperty(exports, 'CognitoUserAttribute', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CognitoUserAttribute).default;
	  }
	});

	var _CognitoUserPool = __webpack_require__(60);

	Object.defineProperty(exports, 'CognitoUserPool', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CognitoUserPool).default;
	  }
	});

	var _CognitoUserSession = __webpack_require__(34);

	Object.defineProperty(exports, 'CognitoUserSession', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CognitoUserSession).default;
	  }
	});

	var _CookieStorage = __webpack_require__(61);

	Object.defineProperty(exports, 'CookieStorage', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_CookieStorage).default;
	  }
	});

	var _DateHelper = __webpack_require__(35);

	Object.defineProperty(exports, 'DateHelper', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_DateHelper).default;
	  }
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	/* eslint-disable node/no-deprecated-api */
	var buffer = __webpack_require__(3)
	var Buffer = buffer.Buffer

	// alternative to using Object.keys for old browsers
	function copyProps (src, dst) {
	  for (var key in src) {
	    dst[key] = src[key]
	  }
	}
	if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
	  module.exports = buffer
	} else {
	  // Copy properties from require('buffer')
	  copyProps(buffer, exports)
	  exports.Buffer = SafeBuffer
	}

	function SafeBuffer (arg, encodingOrOffset, length) {
	  return Buffer(arg, encodingOrOffset, length)
	}

	// Copy static methods from Buffer
	copyProps(Buffer, SafeBuffer)

	SafeBuffer.from = function (arg, encodingOrOffset, length) {
	  if (typeof arg === 'number') {
	    throw new TypeError('Argument must not be a number')
	  }
	  return Buffer(arg, encodingOrOffset, length)
	}

	SafeBuffer.alloc = function (size, fill, encoding) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  var buf = Buffer(size)
	  if (fill !== undefined) {
	    if (typeof encoding === 'string') {
	      buf.fill(fill, encoding)
	    } else {
	      buf.fill(fill)
	    }
	  } else {
	    buf.fill(0)
	  }
	  return buf
	}

	SafeBuffer.allocUnsafe = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return Buffer(size)
	}

	SafeBuffer.allocUnsafeSlow = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return buffer.SlowBuffer(size)
	}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(37)
	var ieee754 = __webpack_require__(42)
	var isArray = __webpack_require__(15)

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
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

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

	// a duplex stream is just a stream that is both readable and writable.
	// Since JS doesn't have multiple prototypal inheritance, this class
	// prototypally inherits from Readable, and then parasitically from
	// Writable.

	'use strict';

	/*<replacement>*/

	var processNextTick = __webpack_require__(8);
	/*</replacement>*/

	/*<replacement>*/
	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) {
	    keys.push(key);
	  }return keys;
	};
	/*</replacement>*/

	module.exports = Duplex;

	/*<replacement>*/
	var util = __webpack_require__(6);
	util.inherits = __webpack_require__(1);
	/*</replacement>*/

	var Readable = __webpack_require__(16);
	var Writable = __webpack_require__(11);

	util.inherits(Duplex, Readable);

	var keys = objectKeys(Writable.prototype);
	for (var v = 0; v < keys.length; v++) {
	  var method = keys[v];
	  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
	}

	function Duplex(options) {
	  if (!(this instanceof Duplex)) return new Duplex(options);

	  Readable.call(this, options);
	  Writable.call(this, options);

	  if (options && options.readable === false) this.readable = false;

	  if (options && options.writable === false) this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

	  this.once('end', onend);
	}

	// the no-half-open enforcer
	function onend() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended) return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  processNextTick(onEndNT, this);
	}

	function onEndNT(self) {
	  self.end();
	}

	Object.defineProperty(Duplex.prototype, 'destroyed', {
	  get: function () {
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return false;
	    }
	    return this._readableState.destroyed && this._writableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._readableState.destroyed = value;
	    this._writableState.destroyed = value;
	  }
	});

	Duplex.prototype._destroy = function (err, cb) {
	  this.push(null);
	  this.end();

	  processNextTick(cb, err);
	};

	function forEach(xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	var Buffer = __webpack_require__(2).Buffer

	// prototype class for hash functions
	function Hash (blockSize, finalSize) {
	  this._block = Buffer.alloc(blockSize)
	  this._finalSize = finalSize
	  this._blockSize = blockSize
	  this._len = 0
	}

	Hash.prototype.update = function (data, enc) {
	  if (typeof data === 'string') {
	    enc = enc || 'utf8'
	    data = Buffer.from(data, enc)
	  }

	  var block = this._block
	  var blockSize = this._blockSize
	  var length = data.length
	  var accum = this._len

	  for (var offset = 0; offset < length;) {
	    var assigned = accum % blockSize
	    var remainder = Math.min(length - offset, blockSize - assigned)

	    for (var i = 0; i < remainder; i++) {
	      block[assigned + i] = data[offset + i]
	    }

	    accum += remainder
	    offset += remainder

	    if ((accum % blockSize) === 0) {
	      this._update(block)
	    }
	  }

	  this._len += length
	  return this
	}

	Hash.prototype.digest = function (enc) {
	  var rem = this._len % this._blockSize

	  this._block[rem] = 0x80

	  // zero (rem + 1) trailing bits, where (rem + 1) is the smallest
	  // non-negative solution to the equation (length + 1 + (rem + 1)) === finalSize mod blockSize
	  this._block.fill(0, rem + 1)

	  if (rem >= this._finalSize) {
	    this._update(this._block)
	    this._block.fill(0)
	  }

	  var bits = this._len * 8

	  // uint32
	  if (bits <= 0xffffffff) {
	    this._block.writeUInt32BE(bits, this._blockSize - 4)

	  // uint64
	  } else {
	    var lowBits = bits & 0xffffffff
	    var highBits = (bits - lowBits) / 0x100000000

	    this._block.writeUInt32BE(highBits, this._blockSize - 8)
	    this._block.writeUInt32BE(lowBits, this._blockSize - 4)
	  }

	  this._update(this._block)
	  var hash = this._hash()

	  return enc ? hash.toString(enc) : hash
	}

	Hash.prototype._update = function () {
	  throw new Error('_update must be implemented by subclass')
	}

	module.exports = Hash


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright Joyent, Inc. and other Node contributors.
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

	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.

	function isArray(arg) {
	  if (Array.isArray) {
	    return Array.isArray(arg);
	  }
	  return objectToString(arg) === '[object Array]';
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = Buffer.isBuffer;

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	if (!process.version ||
	    process.version.indexOf('v0.') === 0 ||
	    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
	  module.exports = nextTick;
	} else {
	  module.exports = process.nextTick;
	}

	function nextTick(fn, arg1, arg2, arg3) {
	  if (typeof fn !== 'function') {
	    throw new TypeError('"callback" argument must be a function');
	  }
	  var len = arguments.length;
	  var args, i;
	  switch (len) {
	  case 0:
	  case 1:
	    return process.nextTick(fn);
	  case 2:
	    return process.nextTick(function afterTickOne() {
	      fn.call(null, arg1);
	    });
	  case 3:
	    return process.nextTick(function afterTickTwo() {
	      fn.call(null, arg1, arg2);
	    });
	  case 4:
	    return process.nextTick(function afterTickThree() {
	      fn.call(null, arg1, arg2, arg3);
	    });
	  default:
	    args = new Array(len - 1);
	    i = 0;
	    while (i < args.length) {
	      args[i++] = arguments[i];
	    }
	    return process.nextTick(function afterTick() {
	      fn.apply(null, args);
	    });
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	var Buffer = __webpack_require__(2).Buffer
	var Transform = __webpack_require__(25).Transform
	var StringDecoder = __webpack_require__(56).StringDecoder
	var inherits = __webpack_require__(1)

	function CipherBase (hashMode) {
	  Transform.call(this)
	  this.hashMode = typeof hashMode === 'string'
	  if (this.hashMode) {
	    this[hashMode] = this._finalOrDigest
	  } else {
	    this.final = this._finalOrDigest
	  }
	  if (this._final) {
	    this.__final = this._final
	    this._final = null
	  }
	  this._decoder = null
	  this._encoding = null
	}
	inherits(CipherBase, Transform)

	CipherBase.prototype.update = function (data, inputEnc, outputEnc) {
	  if (typeof data === 'string') {
	    data = Buffer.from(data, inputEnc)
	  }

	  var outData = this._update(data)
	  if (this.hashMode) return this

	  if (outputEnc) {
	    outData = this._toString(outData, outputEnc)
	  }

	  return outData
	}

	CipherBase.prototype.setAutoPadding = function () {}
	CipherBase.prototype.getAuthTag = function () {
	  throw new Error('trying to get auth tag in unsupported state')
	}

	CipherBase.prototype.setAuthTag = function () {
	  throw new Error('trying to set auth tag in unsupported state')
	}

	CipherBase.prototype.setAAD = function () {
	  throw new Error('trying to set aad in unsupported state')
	}

	CipherBase.prototype._transform = function (data, _, next) {
	  var err
	  try {
	    if (this.hashMode) {
	      this._update(data)
	    } else {
	      this.push(this._update(data))
	    }
	  } catch (e) {
	    err = e
	  } finally {
	    next(err)
	  }
	}
	CipherBase.prototype._flush = function (done) {
	  var err
	  try {
	    this.push(this.__final())
	  } catch (e) {
	    err = e
	  }

	  done(err)
	}
	CipherBase.prototype._finalOrDigest = function (outputEnc) {
	  var outData = this.__final() || Buffer.alloc(0)
	  if (outputEnc) {
	    outData = this._toString(outData, outputEnc, true)
	  }
	  return outData
	}

	CipherBase.prototype._toString = function (value, enc, fin) {
	  if (!this._decoder) {
	    this._decoder = new StringDecoder(enc)
	    this._encoding = enc
	  }

	  if (this._encoding !== enc) throw new Error('can\'t switch encodings')

	  var out = this._decoder.write(value)
	  if (fin) {
	    out += this._decoder.end()
	  }

	  return out
	}

	module.exports = CipherBase


/***/ }),
/* 10 */
/***/ (function(module, exports) {

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

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, setImmediate, global) {// Copyright Joyent, Inc. and other Node contributors.
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

	// A bit simpler than readable streams.
	// Implement an async ._write(chunk, encoding, cb), and it'll handle all
	// the drain event emission and buffering.

	'use strict';

	/*<replacement>*/

	var processNextTick = __webpack_require__(8);
	/*</replacement>*/

	module.exports = Writable;

	/* <replacement> */
	function WriteReq(chunk, encoding, cb) {
	  this.chunk = chunk;
	  this.encoding = encoding;
	  this.callback = cb;
	  this.next = null;
	}

	// It seems a linked list but it is not
	// there will be only 2 of these for each stream
	function CorkedRequest(state) {
	  var _this = this;

	  this.next = null;
	  this.entry = null;
	  this.finish = function () {
	    onCorkedFinish(_this, state);
	  };
	}
	/* </replacement> */

	/*<replacement>*/
	var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
	/*</replacement>*/

	/*<replacement>*/
	var Duplex;
	/*</replacement>*/

	Writable.WritableState = WritableState;

	/*<replacement>*/
	var util = __webpack_require__(6);
	util.inherits = __webpack_require__(1);
	/*</replacement>*/

	/*<replacement>*/
	var internalUtil = {
	  deprecate: __webpack_require__(57)
	};
	/*</replacement>*/

	/*<replacement>*/
	var Stream = __webpack_require__(19);
	/*</replacement>*/

	/*<replacement>*/
	var Buffer = __webpack_require__(2).Buffer;
	var OurUint8Array = global.Uint8Array || function () {};
	function _uint8ArrayToBuffer(chunk) {
	  return Buffer.from(chunk);
	}
	function _isUint8Array(obj) {
	  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
	}
	/*</replacement>*/

	var destroyImpl = __webpack_require__(18);

	util.inherits(Writable, Stream);

	function nop() {}

	function WritableState(options, stream) {
	  Duplex = Duplex || __webpack_require__(4);

	  options = options || {};

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

	  // cast to ints.
	  this.highWaterMark = Math.floor(this.highWaterMark);

	  // if _final has been called
	  this.finalCalled = false;

	  // drain event flag.
	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // has it been destroyed
	  this.destroyed = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function (er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.bufferedRequest = null;
	  this.lastBufferedRequest = null;

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;

	  // count buffered requests
	  this.bufferedRequestCount = 0;

	  // allocate the first CorkedRequest, there is always
	  // one allocated and free to use, and we maintain at most two
	  this.corkedRequestsFree = new CorkedRequest(this);
	}

	WritableState.prototype.getBuffer = function getBuffer() {
	  var current = this.bufferedRequest;
	  var out = [];
	  while (current) {
	    out.push(current);
	    current = current.next;
	  }
	  return out;
	};

	(function () {
	  try {
	    Object.defineProperty(WritableState.prototype, 'buffer', {
	      get: internalUtil.deprecate(function () {
	        return this.getBuffer();
	      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
	    });
	  } catch (_) {}
	})();

	// Test _writableState for inheritance to account for Duplex streams,
	// whose prototype chain only points to Readable.
	var realHasInstance;
	if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
	  realHasInstance = Function.prototype[Symbol.hasInstance];
	  Object.defineProperty(Writable, Symbol.hasInstance, {
	    value: function (object) {
	      if (realHasInstance.call(this, object)) return true;

	      return object && object._writableState instanceof WritableState;
	    }
	  });
	} else {
	  realHasInstance = function (object) {
	    return object instanceof this;
	  };
	}

	function Writable(options) {
	  Duplex = Duplex || __webpack_require__(4);

	  // Writable ctor is applied to Duplexes, too.
	  // `realHasInstance` is necessary because using plain `instanceof`
	  // would return false, as no `_writableState` property is attached.

	  // Trying to use the custom `instanceof` for Writable here will also break the
	  // Node.js LazyTransform implementation, which has a non-trivial getter for
	  // `_writableState` that would lead to infinite recursion.
	  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
	    return new Writable(options);
	  }

	  this._writableState = new WritableState(options, this);

	  // legacy.
	  this.writable = true;

	  if (options) {
	    if (typeof options.write === 'function') this._write = options.write;

	    if (typeof options.writev === 'function') this._writev = options.writev;

	    if (typeof options.destroy === 'function') this._destroy = options.destroy;

	    if (typeof options.final === 'function') this._final = options.final;
	  }

	  Stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function () {
	  this.emit('error', new Error('Cannot pipe, not readable'));
	};

	function writeAfterEnd(stream, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream.emit('error', er);
	  processNextTick(cb, er);
	}

	// Checks that a user-supplied chunk is valid, especially for the particular
	// mode the stream is in. Currently this means that `null` is never accepted
	// and undefined/non-string values are only allowed in object mode.
	function validChunk(stream, state, chunk, cb) {
	  var valid = true;
	  var er = false;

	  if (chunk === null) {
	    er = new TypeError('May not write null values to stream');
	  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  if (er) {
	    stream.emit('error', er);
	    processNextTick(cb, er);
	    valid = false;
	  }
	  return valid;
	}

	Writable.prototype.write = function (chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;
	  var isBuf = _isUint8Array(chunk) && !state.objectMode;

	  if (isBuf && !Buffer.isBuffer(chunk)) {
	    chunk = _uint8ArrayToBuffer(chunk);
	  }

	  if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

	  if (typeof cb !== 'function') cb = nop;

	  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
	  }

	  return ret;
	};

	Writable.prototype.cork = function () {
	  var state = this._writableState;

	  state.corked++;
	};

	Writable.prototype.uncork = function () {
	  var state = this._writableState;

	  if (state.corked) {
	    state.corked--;

	    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
	  }
	};

	Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
	  // node::ParseEncoding() requires lower case.
	  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
	  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
	  this._writableState.defaultEncoding = encoding;
	  return this;
	};

	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
	    chunk = Buffer.from(chunk, encoding);
	  }
	  return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
	  if (!isBuf) {
	    var newChunk = decodeChunk(state, chunk, encoding);
	    if (chunk !== newChunk) {
	      isBuf = true;
	      encoding = 'buffer';
	      chunk = newChunk;
	    }
	  }
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret) state.needDrain = true;

	  if (state.writing || state.corked) {
	    var last = state.lastBufferedRequest;
	    state.lastBufferedRequest = {
	      chunk: chunk,
	      encoding: encoding,
	      isBuf: isBuf,
	      callback: cb,
	      next: null
	    };
	    if (last) {
	      last.next = state.lastBufferedRequest;
	    } else {
	      state.bufferedRequest = state.lastBufferedRequest;
	    }
	    state.bufferedRequestCount += 1;
	  } else {
	    doWrite(stream, state, false, len, chunk, encoding, cb);
	  }

	  return ret;
	}

	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
	  --state.pendingcb;

	  if (sync) {
	    // defer the callback if we are being called synchronously
	    // to avoid piling up things on the stack
	    processNextTick(cb, er);
	    // this can emit finish, and it will always happen
	    // after error
	    processNextTick(finishMaybe, stream, state);
	    stream._writableState.errorEmitted = true;
	    stream.emit('error', er);
	  } else {
	    // the caller expect this to happen before if
	    // it is async
	    cb(er);
	    stream._writableState.errorEmitted = true;
	    stream.emit('error', er);
	    // this can emit finish, but finish must
	    // always follow error
	    finishMaybe(stream, state);
	  }
	}

	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate(state);

	  if (er) onwriteError(stream, state, sync, er, cb);else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(state);

	    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
	      clearBuffer(stream, state);
	    }

	    if (sync) {
	      /*<replacement>*/
	      asyncWrite(afterWrite, stream, state, finished, cb);
	      /*</replacement>*/
	    } else {
	      afterWrite(stream, state, finished, cb);
	    }
	  }
	}

	function afterWrite(stream, state, finished, cb) {
	  if (!finished) onwriteDrain(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}

	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;
	  var entry = state.bufferedRequest;

	  if (stream._writev && entry && entry.next) {
	    // Fast case, write everything using _writev()
	    var l = state.bufferedRequestCount;
	    var buffer = new Array(l);
	    var holder = state.corkedRequestsFree;
	    holder.entry = entry;

	    var count = 0;
	    var allBuffers = true;
	    while (entry) {
	      buffer[count] = entry;
	      if (!entry.isBuf) allBuffers = false;
	      entry = entry.next;
	      count += 1;
	    }
	    buffer.allBuffers = allBuffers;

	    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

	    // doWrite is almost always async, defer these to save a bit of time
	    // as the hot path ends with doWrite
	    state.pendingcb++;
	    state.lastBufferedRequest = null;
	    if (holder.next) {
	      state.corkedRequestsFree = holder.next;
	      holder.next = null;
	    } else {
	      state.corkedRequestsFree = new CorkedRequest(state);
	    }
	  } else {
	    // Slow case, write chunks one-by-one
	    while (entry) {
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;

	      doWrite(stream, state, false, len, chunk, encoding, cb);
	      entry = entry.next;
	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        break;
	      }
	    }

	    if (entry === null) state.lastBufferedRequest = null;
	  }

	  state.bufferedRequestCount = 0;
	  state.bufferedRequest = entry;
	  state.bufferProcessing = false;
	}

	Writable.prototype._write = function (chunk, encoding, cb) {
	  cb(new Error('_write() is not implemented'));
	};

	Writable.prototype._writev = null;

	Writable.prototype.end = function (chunk, encoding, cb) {
	  var state = this._writableState;

	  if (typeof chunk === 'function') {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending && !state.finished) endWritable(this, state, cb);
	};

	function needFinish(state) {
	  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
	}
	function callFinal(stream, state) {
	  stream._final(function (err) {
	    state.pendingcb--;
	    if (err) {
	      stream.emit('error', err);
	    }
	    state.prefinished = true;
	    stream.emit('prefinish');
	    finishMaybe(stream, state);
	  });
	}
	function prefinish(stream, state) {
	  if (!state.prefinished && !state.finalCalled) {
	    if (typeof stream._final === 'function') {
	      state.pendingcb++;
	      state.finalCalled = true;
	      processNextTick(callFinal, stream, state);
	    } else {
	      state.prefinished = true;
	      stream.emit('prefinish');
	    }
	  }
	}

	function finishMaybe(stream, state) {
	  var need = needFinish(state);
	  if (need) {
	    prefinish(stream, state);
	    if (state.pendingcb === 0) {
	      state.finished = true;
	      stream.emit('finish');
	    }
	  }
	  return need;
	}

	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
	  }
	  state.ended = true;
	  stream.writable = false;
	}

	function onCorkedFinish(corkReq, state, err) {
	  var entry = corkReq.entry;
	  corkReq.entry = null;
	  while (entry) {
	    var cb = entry.callback;
	    state.pendingcb--;
	    cb(err);
	    entry = entry.next;
	  }
	  if (state.corkedRequestsFree) {
	    state.corkedRequestsFree.next = corkReq;
	  } else {
	    state.corkedRequestsFree = corkReq;
	  }
	}

	Object.defineProperty(Writable.prototype, 'destroyed', {
	  get: function () {
	    if (this._writableState === undefined) {
	      return false;
	    }
	    return this._writableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._writableState) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._writableState.destroyed = value;
	  }
	});

	Writable.prototype.destroy = destroyImpl.destroy;
	Writable.prototype._undestroy = destroyImpl.undestroy;
	Writable.prototype._destroy = function (err, cb) {
	  this.end();
	  cb(err);
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7), __webpack_require__(62).setImmediate, (function() { return this; }())))

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(16);
	exports.Stream = exports;
	exports.Readable = exports;
	exports.Writable = __webpack_require__(11);
	exports.Duplex = __webpack_require__(4);
	exports.Transform = __webpack_require__(17);
	exports.PassThrough = __webpack_require__(46);


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict'
	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */

	var makeHash = __webpack_require__(39)

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	function core_md5 (x, len) {
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32)
	  x[(((len + 64) >>> 9) << 4) + 14] = len

	  var a = 1732584193
	  var b = -271733879
	  var c = -1732584194
	  var d = 271733878

	  for (var i = 0; i < x.length; i += 16) {
	    var olda = a
	    var oldb = b
	    var oldc = c
	    var oldd = d

	    a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936)
	    d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586)
	    c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819)
	    b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330)
	    a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897)
	    d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426)
	    c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341)
	    b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983)
	    a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416)
	    d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417)
	    c = md5_ff(c, d, a, b, x[i + 10], 17, -42063)
	    b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162)
	    a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682)
	    d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101)
	    c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290)
	    b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329)

	    a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510)
	    d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632)
	    c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713)
	    b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302)
	    a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691)
	    d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083)
	    c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335)
	    b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848)
	    a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438)
	    d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690)
	    c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961)
	    b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501)
	    a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467)
	    d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784)
	    c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473)
	    b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734)

	    a = md5_hh(a, b, c, d, x[i + 5], 4, -378558)
	    d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463)
	    c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562)
	    b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556)
	    a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060)
	    d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353)
	    c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632)
	    b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640)
	    a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174)
	    d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222)
	    c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979)
	    b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189)
	    a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487)
	    d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835)
	    c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520)
	    b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651)

	    a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844)
	    d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415)
	    c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905)
	    b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055)
	    a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571)
	    d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606)
	    c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523)
	    b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799)
	    a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359)
	    d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744)
	    c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380)
	    b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649)
	    a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070)
	    d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379)
	    c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259)
	    b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551)

	    a = safe_add(a, olda)
	    b = safe_add(b, oldb)
	    c = safe_add(c, oldc)
	    d = safe_add(d, oldd)
	  }

	  return [a, b, c, d]
	}

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn (q, a, b, x, s, t) {
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
	}

	function md5_ff (a, b, c, d, x, s, t) {
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
	}

	function md5_gg (a, b, c, d, x, s, t) {
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
	}

	function md5_hh (a, b, c, d, x, s, t) {
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t)
	}

	function md5_ii (a, b, c, d, x, s, t) {
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add (x, y) {
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF)
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
	  return (msw << 16) | (lsw & 0xFFFF)
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol (num, cnt) {
	  return (num << cnt) | (num >>> (32 - cnt))
	}

	module.exports = function md5 (buf) {
	  return makeHash(buf, core_md5)
	}


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict'
	var inherits = __webpack_require__(1)
	var Legacy = __webpack_require__(40)
	var Base = __webpack_require__(9)
	var Buffer = __webpack_require__(2).Buffer
	var md5 = __webpack_require__(13)
	var RIPEMD160 = __webpack_require__(21)

	var sha = __webpack_require__(22)

	var ZEROS = Buffer.alloc(128)

	function Hmac (alg, key) {
	  Base.call(this, 'digest')
	  if (typeof key === 'string') {
	    key = Buffer.from(key)
	  }

	  var blocksize = (alg === 'sha512' || alg === 'sha384') ? 128 : 64

	  this._alg = alg
	  this._key = key
	  if (key.length > blocksize) {
	    var hash = alg === 'rmd160' ? new RIPEMD160() : sha(alg)
	    key = hash.update(key).digest()
	  } else if (key.length < blocksize) {
	    key = Buffer.concat([key, ZEROS], blocksize)
	  }

	  var ipad = this._ipad = Buffer.allocUnsafe(blocksize)
	  var opad = this._opad = Buffer.allocUnsafe(blocksize)

	  for (var i = 0; i < blocksize; i++) {
	    ipad[i] = key[i] ^ 0x36
	    opad[i] = key[i] ^ 0x5C
	  }
	  this._hash = alg === 'rmd160' ? new RIPEMD160() : sha(alg)
	  this._hash.update(ipad)
	}

	inherits(Hmac, Base)

	Hmac.prototype._update = function (data) {
	  this._hash.update(data)
	}

	Hmac.prototype._final = function () {
	  var h = this._hash.digest()
	  var hash = this._alg === 'rmd160' ? new RIPEMD160() : sha(this._alg)
	  return hash.update(this._opad).update(h).digest()
	}

	module.exports = function createHmac (alg, key) {
	  alg = alg.toLowerCase()
	  if (alg === 'rmd160' || alg === 'ripemd160') {
	    return new Hmac('rmd160', key)
	  }
	  if (alg === 'md5') {
	    return new Legacy(md5, key)
	  }
	  return new Hmac(alg, key)
	}


/***/ }),
/* 15 */
/***/ (function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
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

	'use strict';

	/*<replacement>*/

	var processNextTick = __webpack_require__(8);
	/*</replacement>*/

	module.exports = Readable;

	/*<replacement>*/
	var isArray = __webpack_require__(15);
	/*</replacement>*/

	/*<replacement>*/
	var Duplex;
	/*</replacement>*/

	Readable.ReadableState = ReadableState;

	/*<replacement>*/
	var EE = __webpack_require__(10).EventEmitter;

	var EElistenerCount = function (emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/

	/*<replacement>*/
	var Stream = __webpack_require__(19);
	/*</replacement>*/

	// TODO(bmeurer): Change this back to const once hole checks are
	// properly optimized away early in Ignition+TurboFan.
	/*<replacement>*/
	var Buffer = __webpack_require__(2).Buffer;
	var OurUint8Array = global.Uint8Array || function () {};
	function _uint8ArrayToBuffer(chunk) {
	  return Buffer.from(chunk);
	}
	function _isUint8Array(obj) {
	  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
	}
	/*</replacement>*/

	/*<replacement>*/
	var util = __webpack_require__(6);
	util.inherits = __webpack_require__(1);
	/*</replacement>*/

	/*<replacement>*/
	var debugUtil = __webpack_require__(63);
	var debug = void 0;
	if (debugUtil && debugUtil.debuglog) {
	  debug = debugUtil.debuglog('stream');
	} else {
	  debug = function () {};
	}
	/*</replacement>*/

	var BufferList = __webpack_require__(47);
	var destroyImpl = __webpack_require__(18);
	var StringDecoder;

	util.inherits(Readable, Stream);

	var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

	function prependListener(emitter, event, fn) {
	  // Sadly this is not cacheable as some libraries bundle their own
	  // event emitter implementation with them.
	  if (typeof emitter.prependListener === 'function') {
	    return emitter.prependListener(event, fn);
	  } else {
	    // This is a hack to make sure that our error handler is attached before any
	    // userland ones.  NEVER DO THIS. This is here only because this code needs
	    // to continue to work with older versions of Node.js that do not include
	    // the prependListener() method. The goal is to eventually remove this hack.
	    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
	  }
	}

	function ReadableState(options, stream) {
	  Duplex = Duplex || __webpack_require__(4);

	  options = options || {};

	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

	  // cast to ints.
	  this.highWaterMark = Math.floor(this.highWaterMark);

	  // A linked list is used to store data chunks instead of an array because the
	  // linked list can remove elements from the beginning faster than
	  // array.shift()
	  this.buffer = new BufferList();
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the event 'readable'/'data' is emitted
	  // immediately, or on a later tick.  We set this to true at first, because
	  // any actions that shouldn't happen until "later" should generally also
	  // not happen before the first read call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;
	  this.resumeScheduled = false;

	  // has it been destroyed
	  this.destroyed = false;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    if (!StringDecoder) StringDecoder = __webpack_require__(20).StringDecoder;
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}

	function Readable(options) {
	  Duplex = Duplex || __webpack_require__(4);

	  if (!(this instanceof Readable)) return new Readable(options);

	  this._readableState = new ReadableState(options, this);

	  // legacy
	  this.readable = true;

	  if (options) {
	    if (typeof options.read === 'function') this._read = options.read;

	    if (typeof options.destroy === 'function') this._destroy = options.destroy;
	  }

	  Stream.call(this);
	}

	Object.defineProperty(Readable.prototype, 'destroyed', {
	  get: function () {
	    if (this._readableState === undefined) {
	      return false;
	    }
	    return this._readableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._readableState) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._readableState.destroyed = value;
	  }
	});

	Readable.prototype.destroy = destroyImpl.destroy;
	Readable.prototype._undestroy = destroyImpl.undestroy;
	Readable.prototype._destroy = function (err, cb) {
	  this.push(null);
	  cb(err);
	};

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function (chunk, encoding) {
	  var state = this._readableState;
	  var skipChunkCheck;

	  if (!state.objectMode) {
	    if (typeof chunk === 'string') {
	      encoding = encoding || state.defaultEncoding;
	      if (encoding !== state.encoding) {
	        chunk = Buffer.from(chunk, encoding);
	        encoding = '';
	      }
	      skipChunkCheck = true;
	    }
	  } else {
	    skipChunkCheck = true;
	  }

	  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function (chunk) {
	  return readableAddChunk(this, chunk, null, true, false);
	};

	function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
	  var state = stream._readableState;
	  if (chunk === null) {
	    state.reading = false;
	    onEofChunk(stream, state);
	  } else {
	    var er;
	    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
	    if (er) {
	      stream.emit('error', er);
	    } else if (state.objectMode || chunk && chunk.length > 0) {
	      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
	        chunk = _uint8ArrayToBuffer(chunk);
	      }

	      if (addToFront) {
	        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
	      } else if (state.ended) {
	        stream.emit('error', new Error('stream.push() after EOF'));
	      } else {
	        state.reading = false;
	        if (state.decoder && !encoding) {
	          chunk = state.decoder.write(chunk);
	          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
	        } else {
	          addChunk(stream, state, chunk, false);
	        }
	      }
	    } else if (!addToFront) {
	      state.reading = false;
	    }
	  }

	  return needMoreData(state);
	}

	function addChunk(stream, state, chunk, addToFront) {
	  if (state.flowing && state.length === 0 && !state.sync) {
	    stream.emit('data', chunk);
	    stream.read(0);
	  } else {
	    // update the buffer info.
	    state.length += state.objectMode ? 1 : chunk.length;
	    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

	    if (state.needReadable) emitReadable(stream);
	  }
	  maybeReadMore(stream, state);
	}

	function chunkInvalid(state, chunk) {
	  var er;
	  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}

	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
	  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
	}

	Readable.prototype.isPaused = function () {
	  return this._readableState.flowing === false;
	};

	// backwards compatibility.
	Readable.prototype.setEncoding = function (enc) {
	  if (!StringDecoder) StringDecoder = __webpack_require__(20).StringDecoder;
	  this._readableState.decoder = new StringDecoder(enc);
	  this._readableState.encoding = enc;
	  return this;
	};

	// Don't raise the hwm > 8MB
	var MAX_HWM = 0x800000;
	function computeNewHighWaterMark(n) {
	  if (n >= MAX_HWM) {
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2 to prevent increasing hwm excessively in
	    // tiny amounts
	    n--;
	    n |= n >>> 1;
	    n |= n >>> 2;
	    n |= n >>> 4;
	    n |= n >>> 8;
	    n |= n >>> 16;
	    n++;
	  }
	  return n;
	}

	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function howMuchToRead(n, state) {
	  if (n <= 0 || state.length === 0 && state.ended) return 0;
	  if (state.objectMode) return 1;
	  if (n !== n) {
	    // Only flow one buffer at a time
	    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
	  }
	  // If we're asking for more than the current hwm, then raise the hwm.
	  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
	  if (n <= state.length) return n;
	  // Don't have enough
	  if (!state.ended) {
	    state.needReadable = true;
	    return 0;
	  }
	  return state.length;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function (n) {
	  debug('read', n);
	  n = parseInt(n, 10);
	  var state = this._readableState;
	  var nOrig = n;

	  if (n !== 0) state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
	    debug('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
	    return null;
	  }

	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0) endReadable(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug('reading or ended', doRead);
	  } else if (doRead) {
	    debug('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0) state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	    // If _read pushed data synchronously, then `reading` will be false,
	    // and we need to re-evaluate how much data we can return to the user.
	    if (!state.reading) n = howMuchToRead(nOrig, state);
	  }

	  var ret;
	  if (n > 0) ret = fromList(n, state);else ret = null;

	  if (ret === null) {
	    state.needReadable = true;
	    n = 0;
	  } else {
	    state.length -= n;
	  }

	  if (state.length === 0) {
	    // If we have nothing in the buffer, then we want to know
	    // as soon as we *do* get something into the buffer.
	    if (!state.ended) state.needReadable = true;

	    // If we tried to read() past the EOF, then emit end on the next tick.
	    if (nOrig !== n && state.ended) endReadable(this);
	  }

	  if (ret !== null) this.emit('data', ret);

	  return ret;
	};

	function onEofChunk(stream, state) {
	  if (state.ended) return;
	  if (state.decoder) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // emit 'readable' now to make sure it gets picked up.
	  emitReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
	  }
	}

	function emitReadable_(stream) {
	  debug('emit readable');
	  stream.emit('readable');
	  flow(stream);
	}

	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    processNextTick(maybeReadMore_, stream, state);
	  }
	}

	function maybeReadMore_(stream, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
	    debug('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;else len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function (n) {
	  this.emit('error', new Error('_read() is not implemented'));
	};

	Readable.prototype.pipe = function (dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

	  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

	  var endFn = doEnd ? onend : unpipe;
	  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable, unpipeInfo) {
	    debug('onunpipe');
	    if (readable === src) {
	      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
	        unpipeInfo.hasUnpiped = true;
	        cleanup();
	      }
	    }
	  }

	  function onend() {
	    debug('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);

	  var cleanedUp = false;
	  function cleanup() {
	    debug('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', unpipe);
	    src.removeListener('data', ondata);

	    cleanedUp = true;

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
	  }

	  // If the user pushes more data while we're writing to dest then we'll end up
	  // in ondata again. However, we only want to increase awaitDrain once because
	  // dest will only emit one 'drain' event for the multiple writes.
	  // => Introduce a guard on increasing awaitDrain.
	  var increasedAwaitDrain = false;
	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug('ondata');
	    increasedAwaitDrain = false;
	    var ret = dest.write(chunk);
	    if (false === ret && !increasedAwaitDrain) {
	      // If the user unpiped during `dest.write()`, it is possible
	      // to get stuck in a permanently paused state if that write
	      // also returned false.
	      // => Check whether `dest` is still a piping destination.
	      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
	        debug('false write response, pause', src._readableState.awaitDrain);
	        src._readableState.awaitDrain++;
	        increasedAwaitDrain = true;
	      }
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
	  }

	  // Make sure our error handler is attached before userland ones.
	  prependListener(dest, 'error', onerror);

	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    debug('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug('pipe resume');
	    src.resume();
	  }

	  return dest;
	};

	function pipeOnDrain(src) {
	  return function () {
	    var state = src._readableState;
	    debug('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain) state.awaitDrain--;
	    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
	      state.flowing = true;
	      flow(src);
	    }
	  };
	}

	Readable.prototype.unpipe = function (dest) {
	  var state = this._readableState;
	  var unpipeInfo = { hasUnpiped: false };

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0) return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes) return this;

	    if (!dest) dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest) dest.emit('unpipe', this, unpipeInfo);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;

	    for (var i = 0; i < len; i++) {
	      dests[i].emit('unpipe', this, unpipeInfo);
	    }return this;
	  }

	  // try to find the right one.
	  var index = indexOf(state.pipes, dest);
	  if (index === -1) return this;

	  state.pipes.splice(index, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1) state.pipes = state.pipes[0];

	  dest.emit('unpipe', this, unpipeInfo);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function (ev, fn) {
	  var res = Stream.prototype.on.call(this, ev, fn);

	  if (ev === 'data') {
	    // Start flowing on next tick if stream isn't explicitly paused
	    if (this._readableState.flowing !== false) this.resume();
	  } else if (ev === 'readable') {
	    var state = this._readableState;
	    if (!state.endEmitted && !state.readableListening) {
	      state.readableListening = state.needReadable = true;
	      state.emittedReadable = false;
	      if (!state.reading) {
	        processNextTick(nReadingNextTick, this);
	      } else if (state.length) {
	        emitReadable(this);
	      }
	    }
	  }

	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	function nReadingNextTick(self) {
	  debug('readable nexttick read 0');
	  self.read(0);
	}

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function () {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug('resume');
	    state.flowing = true;
	    resume(this, state);
	  }
	  return this;
	};

	function resume(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    processNextTick(resume_, stream, state);
	  }
	}

	function resume_(stream, state) {
	  if (!state.reading) {
	    debug('resume read 0');
	    stream.read(0);
	  }

	  state.resumeScheduled = false;
	  state.awaitDrain = 0;
	  stream.emit('resume');
	  flow(stream);
	  if (state.flowing && !state.reading) stream.read(0);
	}

	Readable.prototype.pause = function () {
	  debug('call pause flowing=%j', this._readableState.flowing);
	  if (false !== this._readableState.flowing) {
	    debug('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  return this;
	};

	function flow(stream) {
	  var state = stream._readableState;
	  debug('flow', state.flowing);
	  while (state.flowing && stream.read() !== null) {}
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function (stream) {
	  var state = this._readableState;
	  var paused = false;

	  var self = this;
	  stream.on('end', function () {
	    debug('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length) self.push(chunk);
	    }

	    self.push(null);
	  });

	  stream.on('data', function (chunk) {
	    debug('wrapped data');
	    if (state.decoder) chunk = state.decoder.write(chunk);

	    // don't skip over falsy values in objectMode
	    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

	    var ret = self.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (this[i] === undefined && typeof stream[i] === 'function') {
	      this[i] = function (method) {
	        return function () {
	          return stream[method].apply(stream, arguments);
	        };
	      }(i);
	    }
	  }

	  // proxy certain important events.
	  for (var n = 0; n < kProxyEvents.length; n++) {
	    stream.on(kProxyEvents[n], self.emit.bind(self, kProxyEvents[n]));
	  }

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  self._read = function (n) {
	    debug('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return self;
	};

	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromList(n, state) {
	  // nothing buffered
	  if (state.length === 0) return null;

	  var ret;
	  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
	    // read it all, truncate the list
	    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
	    state.buffer.clear();
	  } else {
	    // read part of list
	    ret = fromListPartial(n, state.buffer, state.decoder);
	  }

	  return ret;
	}

	// Extracts only enough buffered data to satisfy the amount requested.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromListPartial(n, list, hasStrings) {
	  var ret;
	  if (n < list.head.data.length) {
	    // slice is the same for buffers and strings
	    ret = list.head.data.slice(0, n);
	    list.head.data = list.head.data.slice(n);
	  } else if (n === list.head.data.length) {
	    // first chunk is a perfect match
	    ret = list.shift();
	  } else {
	    // result spans more than one buffer
	    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
	  }
	  return ret;
	}

	// Copies a specified amount of characters from the list of buffered data
	// chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBufferString(n, list) {
	  var p = list.head;
	  var c = 1;
	  var ret = p.data;
	  n -= ret.length;
	  while (p = p.next) {
	    var str = p.data;
	    var nb = n > str.length ? str.length : n;
	    if (nb === str.length) ret += str;else ret += str.slice(0, n);
	    n -= nb;
	    if (n === 0) {
	      if (nb === str.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = str.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	// Copies a specified amount of bytes from the list of buffered data chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBuffer(n, list) {
	  var ret = Buffer.allocUnsafe(n);
	  var p = list.head;
	  var c = 1;
	  p.data.copy(ret);
	  n -= p.data.length;
	  while (p = p.next) {
	    var buf = p.data;
	    var nb = n > buf.length ? buf.length : n;
	    buf.copy(ret, ret.length - n, 0, nb);
	    n -= nb;
	    if (n === 0) {
	      if (nb === buf.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = buf.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	function endReadable(stream) {
	  var state = stream._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

	  if (!state.endEmitted) {
	    state.ended = true;
	    processNextTick(endReadableNT, state, stream);
	  }
	}

	function endReadableNT(state, stream) {
	  // Check that we didn't get one last unshift.
	  if (!state.endEmitted && state.length === 0) {
	    state.endEmitted = true;
	    stream.readable = false;
	    stream.emit('end');
	  }
	}

	function forEach(xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	function indexOf(xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(7)))

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

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

	// a transform stream is a readable/writable stream where you do
	// something with the data.  Sometimes it's called a "filter",
	// but that's not a great name for it, since that implies a thing where
	// some bits pass through, and others are simply ignored.  (That would
	// be a valid example of a transform, of course.)
	//
	// While the output is causally related to the input, it's not a
	// necessarily symmetric or synchronous transformation.  For example,
	// a zlib stream might take multiple plain-text writes(), and then
	// emit a single compressed chunk some time in the future.
	//
	// Here's how this works:
	//
	// The Transform stream has all the aspects of the readable and writable
	// stream classes.  When you write(chunk), that calls _write(chunk,cb)
	// internally, and returns false if there's a lot of pending writes
	// buffered up.  When you call read(), that calls _read(n) until
	// there's enough pending readable data buffered up.
	//
	// In a transform stream, the written data is placed in a buffer.  When
	// _read(n) is called, it transforms the queued up data, calling the
	// buffered _write cb's as it consumes chunks.  If consuming a single
	// written chunk would result in multiple output chunks, then the first
	// outputted bit calls the readcb, and subsequent chunks just go into
	// the read buffer, and will cause it to emit 'readable' if necessary.
	//
	// This way, back-pressure is actually determined by the reading side,
	// since _read has to be called to start processing a new chunk.  However,
	// a pathological inflate type of transform can cause excessive buffering
	// here.  For example, imagine a stream where every byte of input is
	// interpreted as an integer from 0-255, and then results in that many
	// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
	// 1kb of data being output.  In this case, you could write a very small
	// amount of input, and end up with a very large amount of output.  In
	// such a pathological inflating mechanism, there'd be no way to tell
	// the system to stop doing the transform.  A single 4MB write could
	// cause the system to run out of memory.
	//
	// However, even in such a pathological case, only a single written chunk
	// would be consumed, and then the rest would wait (un-transformed) until
	// the results of the previous transformed chunk were consumed.

	'use strict';

	module.exports = Transform;

	var Duplex = __webpack_require__(4);

	/*<replacement>*/
	var util = __webpack_require__(6);
	util.inherits = __webpack_require__(1);
	/*</replacement>*/

	util.inherits(Transform, Duplex);

	function TransformState(stream) {
	  this.afterTransform = function (er, data) {
	    return afterTransform(stream, er, data);
	  };

	  this.needTransform = false;
	  this.transforming = false;
	  this.writecb = null;
	  this.writechunk = null;
	  this.writeencoding = null;
	}

	function afterTransform(stream, er, data) {
	  var ts = stream._transformState;
	  ts.transforming = false;

	  var cb = ts.writecb;

	  if (!cb) {
	    return stream.emit('error', new Error('write callback called multiple times'));
	  }

	  ts.writechunk = null;
	  ts.writecb = null;

	  if (data !== null && data !== undefined) stream.push(data);

	  cb(er);

	  var rs = stream._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    stream._read(rs.highWaterMark);
	  }
	}

	function Transform(options) {
	  if (!(this instanceof Transform)) return new Transform(options);

	  Duplex.call(this, options);

	  this._transformState = new TransformState(this);

	  var stream = this;

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;

	  if (options) {
	    if (typeof options.transform === 'function') this._transform = options.transform;

	    if (typeof options.flush === 'function') this._flush = options.flush;
	  }

	  // When the writable side finishes, then flush out anything remaining.
	  this.once('prefinish', function () {
	    if (typeof this._flush === 'function') this._flush(function (er, data) {
	      done(stream, er, data);
	    });else done(stream);
	  });
	}

	Transform.prototype.push = function (chunk, encoding) {
	  this._transformState.needTransform = false;
	  return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function (chunk, encoding, cb) {
	  throw new Error('_transform() is not implemented');
	};

	Transform.prototype._write = function (chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function (n) {
	  var ts = this._transformState;

	  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};

	Transform.prototype._destroy = function (err, cb) {
	  var _this = this;

	  Duplex.prototype._destroy.call(this, err, function (err2) {
	    cb(err2);
	    _this.emit('close');
	  });
	};

	function done(stream, er, data) {
	  if (er) return stream.emit('error', er);

	  if (data !== null && data !== undefined) stream.push(data);

	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  var ws = stream._writableState;
	  var ts = stream._transformState;

	  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

	  if (ts.transforming) throw new Error('Calling transform done when still transforming');

	  return stream.push(null);
	}

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	/*<replacement>*/

	var processNextTick = __webpack_require__(8);
	/*</replacement>*/

	// undocumented cb() API, needed for core, not for public API
	function destroy(err, cb) {
	  var _this = this;

	  var readableDestroyed = this._readableState && this._readableState.destroyed;
	  var writableDestroyed = this._writableState && this._writableState.destroyed;

	  if (readableDestroyed || writableDestroyed) {
	    if (cb) {
	      cb(err);
	    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
	      processNextTick(emitErrorNT, this, err);
	    }
	    return;
	  }

	  // we set destroyed to true before firing error callbacks in order
	  // to make it re-entrance safe in case destroy() is called within callbacks

	  if (this._readableState) {
	    this._readableState.destroyed = true;
	  }

	  // if this is a duplex stream mark the writable part as destroyed as well
	  if (this._writableState) {
	    this._writableState.destroyed = true;
	  }

	  this._destroy(err || null, function (err) {
	    if (!cb && err) {
	      processNextTick(emitErrorNT, _this, err);
	      if (_this._writableState) {
	        _this._writableState.errorEmitted = true;
	      }
	    } else if (cb) {
	      cb(err);
	    }
	  });
	}

	function undestroy() {
	  if (this._readableState) {
	    this._readableState.destroyed = false;
	    this._readableState.reading = false;
	    this._readableState.ended = false;
	    this._readableState.endEmitted = false;
	  }

	  if (this._writableState) {
	    this._writableState.destroyed = false;
	    this._writableState.ended = false;
	    this._writableState.ending = false;
	    this._writableState.finished = false;
	    this._writableState.errorEmitted = false;
	  }
	}

	function emitErrorNT(self, err) {
	  self.emit('error', err);
	}

	module.exports = {
	  destroy: destroy,
	  undestroy: undestroy
	};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(10).EventEmitter;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var Buffer = __webpack_require__(2).Buffer;

	var isEncoding = Buffer.isEncoding || function (encoding) {
	  encoding = '' + encoding;
	  switch (encoding && encoding.toLowerCase()) {
	    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
	      return true;
	    default:
	      return false;
	  }
	};

	function _normalizeEncoding(enc) {
	  if (!enc) return 'utf8';
	  var retried;
	  while (true) {
	    switch (enc) {
	      case 'utf8':
	      case 'utf-8':
	        return 'utf8';
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return 'utf16le';
	      case 'latin1':
	      case 'binary':
	        return 'latin1';
	      case 'base64':
	      case 'ascii':
	      case 'hex':
	        return enc;
	      default:
	        if (retried) return; // undefined
	        enc = ('' + enc).toLowerCase();
	        retried = true;
	    }
	  }
	};

	// Do not cache `Buffer.isEncoding` when checking encoding names as some
	// modules monkey-patch it to support additional encodings
	function normalizeEncoding(enc) {
	  var nenc = _normalizeEncoding(enc);
	  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
	  return nenc || enc;
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters.
	exports.StringDecoder = StringDecoder;
	function StringDecoder(encoding) {
	  this.encoding = normalizeEncoding(encoding);
	  var nb;
	  switch (this.encoding) {
	    case 'utf16le':
	      this.text = utf16Text;
	      this.end = utf16End;
	      nb = 4;
	      break;
	    case 'utf8':
	      this.fillLast = utf8FillLast;
	      nb = 4;
	      break;
	    case 'base64':
	      this.text = base64Text;
	      this.end = base64End;
	      nb = 3;
	      break;
	    default:
	      this.write = simpleWrite;
	      this.end = simpleEnd;
	      return;
	  }
	  this.lastNeed = 0;
	  this.lastTotal = 0;
	  this.lastChar = Buffer.allocUnsafe(nb);
	}

	StringDecoder.prototype.write = function (buf) {
	  if (buf.length === 0) return '';
	  var r;
	  var i;
	  if (this.lastNeed) {
	    r = this.fillLast(buf);
	    if (r === undefined) return '';
	    i = this.lastNeed;
	    this.lastNeed = 0;
	  } else {
	    i = 0;
	  }
	  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
	  return r || '';
	};

	StringDecoder.prototype.end = utf8End;

	// Returns only complete characters in a Buffer
	StringDecoder.prototype.text = utf8Text;

	// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
	StringDecoder.prototype.fillLast = function (buf) {
	  if (this.lastNeed <= buf.length) {
	    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
	    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
	  }
	  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
	  this.lastNeed -= buf.length;
	};

	// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
	// continuation byte.
	function utf8CheckByte(byte) {
	  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
	  return -1;
	}

	// Checks at most 3 bytes at the end of a Buffer in order to detect an
	// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
	// needed to complete the UTF-8 character (if applicable) are returned.
	function utf8CheckIncomplete(self, buf, i) {
	  var j = buf.length - 1;
	  if (j < i) return 0;
	  var nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) self.lastNeed = nb - 1;
	    return nb;
	  }
	  if (--j < i) return 0;
	  nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) self.lastNeed = nb - 2;
	    return nb;
	  }
	  if (--j < i) return 0;
	  nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) {
	      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
	    }
	    return nb;
	  }
	  return 0;
	}

	// Validates as many continuation bytes for a multi-byte UTF-8 character as
	// needed or are available. If we see a non-continuation byte where we expect
	// one, we "replace" the validated continuation bytes we've seen so far with
	// UTF-8 replacement characters ('\ufffd'), to match v8's UTF-8 decoding
	// behavior. The continuation byte check is included three times in the case
	// where all of the continuation bytes for a character exist in the same buffer.
	// It is also done this way as a slight performance increase instead of using a
	// loop.
	function utf8CheckExtraBytes(self, buf, p) {
	  if ((buf[0] & 0xC0) !== 0x80) {
	    self.lastNeed = 0;
	    return '\ufffd'.repeat(p);
	  }
	  if (self.lastNeed > 1 && buf.length > 1) {
	    if ((buf[1] & 0xC0) !== 0x80) {
	      self.lastNeed = 1;
	      return '\ufffd'.repeat(p + 1);
	    }
	    if (self.lastNeed > 2 && buf.length > 2) {
	      if ((buf[2] & 0xC0) !== 0x80) {
	        self.lastNeed = 2;
	        return '\ufffd'.repeat(p + 2);
	      }
	    }
	  }
	}

	// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
	function utf8FillLast(buf) {
	  var p = this.lastTotal - this.lastNeed;
	  var r = utf8CheckExtraBytes(this, buf, p);
	  if (r !== undefined) return r;
	  if (this.lastNeed <= buf.length) {
	    buf.copy(this.lastChar, p, 0, this.lastNeed);
	    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
	  }
	  buf.copy(this.lastChar, p, 0, buf.length);
	  this.lastNeed -= buf.length;
	}

	// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
	// partial character, the character's bytes are buffered until the required
	// number of bytes are available.
	function utf8Text(buf, i) {
	  var total = utf8CheckIncomplete(this, buf, i);
	  if (!this.lastNeed) return buf.toString('utf8', i);
	  this.lastTotal = total;
	  var end = buf.length - (total - this.lastNeed);
	  buf.copy(this.lastChar, 0, end);
	  return buf.toString('utf8', i, end);
	}

	// For UTF-8, a replacement character for each buffered byte of a (partial)
	// character needs to be added to the output.
	function utf8End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) return r + '\ufffd'.repeat(this.lastTotal - this.lastNeed);
	  return r;
	}

	// UTF-16LE typically needs two bytes per character, but even if we have an even
	// number of bytes available, we need to check if we end on a leading/high
	// surrogate. In that case, we need to wait for the next two bytes in order to
	// decode the last character properly.
	function utf16Text(buf, i) {
	  if ((buf.length - i) % 2 === 0) {
	    var r = buf.toString('utf16le', i);
	    if (r) {
	      var c = r.charCodeAt(r.length - 1);
	      if (c >= 0xD800 && c <= 0xDBFF) {
	        this.lastNeed = 2;
	        this.lastTotal = 4;
	        this.lastChar[0] = buf[buf.length - 2];
	        this.lastChar[1] = buf[buf.length - 1];
	        return r.slice(0, -1);
	      }
	    }
	    return r;
	  }
	  this.lastNeed = 1;
	  this.lastTotal = 2;
	  this.lastChar[0] = buf[buf.length - 1];
	  return buf.toString('utf16le', i, buf.length - 1);
	}

	// For UTF-16LE we do not explicitly append special replacement characters if we
	// end on a partial character, we simply let v8 handle that.
	function utf16End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) {
	    var end = this.lastTotal - this.lastNeed;
	    return r + this.lastChar.toString('utf16le', 0, end);
	  }
	  return r;
	}

	function base64Text(buf, i) {
	  var n = (buf.length - i) % 3;
	  if (n === 0) return buf.toString('base64', i);
	  this.lastNeed = 3 - n;
	  this.lastTotal = 3;
	  if (n === 1) {
	    this.lastChar[0] = buf[buf.length - 1];
	  } else {
	    this.lastChar[0] = buf[buf.length - 2];
	    this.lastChar[1] = buf[buf.length - 1];
	  }
	  return buf.toString('base64', i, buf.length - n);
	}

	function base64End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
	  return r;
	}

	// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
	function simpleWrite(buf) {
	  return buf.toString(this.encoding);
	}

	function simpleEnd(buf) {
	  return buf && buf.length ? this.write(buf) : '';
	}

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {'use strict'
	var inherits = __webpack_require__(1)
	var HashBase = __webpack_require__(41)

	function RIPEMD160 () {
	  HashBase.call(this, 64)

	  // state
	  this._a = 0x67452301
	  this._b = 0xefcdab89
	  this._c = 0x98badcfe
	  this._d = 0x10325476
	  this._e = 0xc3d2e1f0
	}

	inherits(RIPEMD160, HashBase)

	RIPEMD160.prototype._update = function () {
	  var m = new Array(16)
	  for (var i = 0; i < 16; ++i) m[i] = this._block.readInt32LE(i * 4)

	  var al = this._a
	  var bl = this._b
	  var cl = this._c
	  var dl = this._d
	  var el = this._e

	  // Mj = 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
	  // K = 0x00000000
	  // Sj = 11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8
	  al = fn1(al, bl, cl, dl, el, m[0], 0x00000000, 11); cl = rotl(cl, 10)
	  el = fn1(el, al, bl, cl, dl, m[1], 0x00000000, 14); bl = rotl(bl, 10)
	  dl = fn1(dl, el, al, bl, cl, m[2], 0x00000000, 15); al = rotl(al, 10)
	  cl = fn1(cl, dl, el, al, bl, m[3], 0x00000000, 12); el = rotl(el, 10)
	  bl = fn1(bl, cl, dl, el, al, m[4], 0x00000000, 5); dl = rotl(dl, 10)
	  al = fn1(al, bl, cl, dl, el, m[5], 0x00000000, 8); cl = rotl(cl, 10)
	  el = fn1(el, al, bl, cl, dl, m[6], 0x00000000, 7); bl = rotl(bl, 10)
	  dl = fn1(dl, el, al, bl, cl, m[7], 0x00000000, 9); al = rotl(al, 10)
	  cl = fn1(cl, dl, el, al, bl, m[8], 0x00000000, 11); el = rotl(el, 10)
	  bl = fn1(bl, cl, dl, el, al, m[9], 0x00000000, 13); dl = rotl(dl, 10)
	  al = fn1(al, bl, cl, dl, el, m[10], 0x00000000, 14); cl = rotl(cl, 10)
	  el = fn1(el, al, bl, cl, dl, m[11], 0x00000000, 15); bl = rotl(bl, 10)
	  dl = fn1(dl, el, al, bl, cl, m[12], 0x00000000, 6); al = rotl(al, 10)
	  cl = fn1(cl, dl, el, al, bl, m[13], 0x00000000, 7); el = rotl(el, 10)
	  bl = fn1(bl, cl, dl, el, al, m[14], 0x00000000, 9); dl = rotl(dl, 10)
	  al = fn1(al, bl, cl, dl, el, m[15], 0x00000000, 8); cl = rotl(cl, 10)

	  // Mj = 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8
	  // K = 0x5a827999
	  // Sj = 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12
	  el = fn2(el, al, bl, cl, dl, m[7], 0x5a827999, 7); bl = rotl(bl, 10)
	  dl = fn2(dl, el, al, bl, cl, m[4], 0x5a827999, 6); al = rotl(al, 10)
	  cl = fn2(cl, dl, el, al, bl, m[13], 0x5a827999, 8); el = rotl(el, 10)
	  bl = fn2(bl, cl, dl, el, al, m[1], 0x5a827999, 13); dl = rotl(dl, 10)
	  al = fn2(al, bl, cl, dl, el, m[10], 0x5a827999, 11); cl = rotl(cl, 10)
	  el = fn2(el, al, bl, cl, dl, m[6], 0x5a827999, 9); bl = rotl(bl, 10)
	  dl = fn2(dl, el, al, bl, cl, m[15], 0x5a827999, 7); al = rotl(al, 10)
	  cl = fn2(cl, dl, el, al, bl, m[3], 0x5a827999, 15); el = rotl(el, 10)
	  bl = fn2(bl, cl, dl, el, al, m[12], 0x5a827999, 7); dl = rotl(dl, 10)
	  al = fn2(al, bl, cl, dl, el, m[0], 0x5a827999, 12); cl = rotl(cl, 10)
	  el = fn2(el, al, bl, cl, dl, m[9], 0x5a827999, 15); bl = rotl(bl, 10)
	  dl = fn2(dl, el, al, bl, cl, m[5], 0x5a827999, 9); al = rotl(al, 10)
	  cl = fn2(cl, dl, el, al, bl, m[2], 0x5a827999, 11); el = rotl(el, 10)
	  bl = fn2(bl, cl, dl, el, al, m[14], 0x5a827999, 7); dl = rotl(dl, 10)
	  al = fn2(al, bl, cl, dl, el, m[11], 0x5a827999, 13); cl = rotl(cl, 10)
	  el = fn2(el, al, bl, cl, dl, m[8], 0x5a827999, 12); bl = rotl(bl, 10)

	  // Mj = 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12
	  // K = 0x6ed9eba1
	  // Sj = 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5
	  dl = fn3(dl, el, al, bl, cl, m[3], 0x6ed9eba1, 11); al = rotl(al, 10)
	  cl = fn3(cl, dl, el, al, bl, m[10], 0x6ed9eba1, 13); el = rotl(el, 10)
	  bl = fn3(bl, cl, dl, el, al, m[14], 0x6ed9eba1, 6); dl = rotl(dl, 10)
	  al = fn3(al, bl, cl, dl, el, m[4], 0x6ed9eba1, 7); cl = rotl(cl, 10)
	  el = fn3(el, al, bl, cl, dl, m[9], 0x6ed9eba1, 14); bl = rotl(bl, 10)
	  dl = fn3(dl, el, al, bl, cl, m[15], 0x6ed9eba1, 9); al = rotl(al, 10)
	  cl = fn3(cl, dl, el, al, bl, m[8], 0x6ed9eba1, 13); el = rotl(el, 10)
	  bl = fn3(bl, cl, dl, el, al, m[1], 0x6ed9eba1, 15); dl = rotl(dl, 10)
	  al = fn3(al, bl, cl, dl, el, m[2], 0x6ed9eba1, 14); cl = rotl(cl, 10)
	  el = fn3(el, al, bl, cl, dl, m[7], 0x6ed9eba1, 8); bl = rotl(bl, 10)
	  dl = fn3(dl, el, al, bl, cl, m[0], 0x6ed9eba1, 13); al = rotl(al, 10)
	  cl = fn3(cl, dl, el, al, bl, m[6], 0x6ed9eba1, 6); el = rotl(el, 10)
	  bl = fn3(bl, cl, dl, el, al, m[13], 0x6ed9eba1, 5); dl = rotl(dl, 10)
	  al = fn3(al, bl, cl, dl, el, m[11], 0x6ed9eba1, 12); cl = rotl(cl, 10)
	  el = fn3(el, al, bl, cl, dl, m[5], 0x6ed9eba1, 7); bl = rotl(bl, 10)
	  dl = fn3(dl, el, al, bl, cl, m[12], 0x6ed9eba1, 5); al = rotl(al, 10)

	  // Mj = 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2
	  // K = 0x8f1bbcdc
	  // Sj = 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12
	  cl = fn4(cl, dl, el, al, bl, m[1], 0x8f1bbcdc, 11); el = rotl(el, 10)
	  bl = fn4(bl, cl, dl, el, al, m[9], 0x8f1bbcdc, 12); dl = rotl(dl, 10)
	  al = fn4(al, bl, cl, dl, el, m[11], 0x8f1bbcdc, 14); cl = rotl(cl, 10)
	  el = fn4(el, al, bl, cl, dl, m[10], 0x8f1bbcdc, 15); bl = rotl(bl, 10)
	  dl = fn4(dl, el, al, bl, cl, m[0], 0x8f1bbcdc, 14); al = rotl(al, 10)
	  cl = fn4(cl, dl, el, al, bl, m[8], 0x8f1bbcdc, 15); el = rotl(el, 10)
	  bl = fn4(bl, cl, dl, el, al, m[12], 0x8f1bbcdc, 9); dl = rotl(dl, 10)
	  al = fn4(al, bl, cl, dl, el, m[4], 0x8f1bbcdc, 8); cl = rotl(cl, 10)
	  el = fn4(el, al, bl, cl, dl, m[13], 0x8f1bbcdc, 9); bl = rotl(bl, 10)
	  dl = fn4(dl, el, al, bl, cl, m[3], 0x8f1bbcdc, 14); al = rotl(al, 10)
	  cl = fn4(cl, dl, el, al, bl, m[7], 0x8f1bbcdc, 5); el = rotl(el, 10)
	  bl = fn4(bl, cl, dl, el, al, m[15], 0x8f1bbcdc, 6); dl = rotl(dl, 10)
	  al = fn4(al, bl, cl, dl, el, m[14], 0x8f1bbcdc, 8); cl = rotl(cl, 10)
	  el = fn4(el, al, bl, cl, dl, m[5], 0x8f1bbcdc, 6); bl = rotl(bl, 10)
	  dl = fn4(dl, el, al, bl, cl, m[6], 0x8f1bbcdc, 5); al = rotl(al, 10)
	  cl = fn4(cl, dl, el, al, bl, m[2], 0x8f1bbcdc, 12); el = rotl(el, 10)

	  // Mj = 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
	  // K = 0xa953fd4e
	  // Sj = 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
	  bl = fn5(bl, cl, dl, el, al, m[4], 0xa953fd4e, 9); dl = rotl(dl, 10)
	  al = fn5(al, bl, cl, dl, el, m[0], 0xa953fd4e, 15); cl = rotl(cl, 10)
	  el = fn5(el, al, bl, cl, dl, m[5], 0xa953fd4e, 5); bl = rotl(bl, 10)
	  dl = fn5(dl, el, al, bl, cl, m[9], 0xa953fd4e, 11); al = rotl(al, 10)
	  cl = fn5(cl, dl, el, al, bl, m[7], 0xa953fd4e, 6); el = rotl(el, 10)
	  bl = fn5(bl, cl, dl, el, al, m[12], 0xa953fd4e, 8); dl = rotl(dl, 10)
	  al = fn5(al, bl, cl, dl, el, m[2], 0xa953fd4e, 13); cl = rotl(cl, 10)
	  el = fn5(el, al, bl, cl, dl, m[10], 0xa953fd4e, 12); bl = rotl(bl, 10)
	  dl = fn5(dl, el, al, bl, cl, m[14], 0xa953fd4e, 5); al = rotl(al, 10)
	  cl = fn5(cl, dl, el, al, bl, m[1], 0xa953fd4e, 12); el = rotl(el, 10)
	  bl = fn5(bl, cl, dl, el, al, m[3], 0xa953fd4e, 13); dl = rotl(dl, 10)
	  al = fn5(al, bl, cl, dl, el, m[8], 0xa953fd4e, 14); cl = rotl(cl, 10)
	  el = fn5(el, al, bl, cl, dl, m[11], 0xa953fd4e, 11); bl = rotl(bl, 10)
	  dl = fn5(dl, el, al, bl, cl, m[6], 0xa953fd4e, 8); al = rotl(al, 10)
	  cl = fn5(cl, dl, el, al, bl, m[15], 0xa953fd4e, 5); el = rotl(el, 10)
	  bl = fn5(bl, cl, dl, el, al, m[13], 0xa953fd4e, 6); dl = rotl(dl, 10)

	  var ar = this._a
	  var br = this._b
	  var cr = this._c
	  var dr = this._d
	  var er = this._e

	  // M'j = 5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12
	  // K' = 0x50a28be6
	  // S'j = 8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6
	  ar = fn5(ar, br, cr, dr, er, m[5], 0x50a28be6, 8); cr = rotl(cr, 10)
	  er = fn5(er, ar, br, cr, dr, m[14], 0x50a28be6, 9); br = rotl(br, 10)
	  dr = fn5(dr, er, ar, br, cr, m[7], 0x50a28be6, 9); ar = rotl(ar, 10)
	  cr = fn5(cr, dr, er, ar, br, m[0], 0x50a28be6, 11); er = rotl(er, 10)
	  br = fn5(br, cr, dr, er, ar, m[9], 0x50a28be6, 13); dr = rotl(dr, 10)
	  ar = fn5(ar, br, cr, dr, er, m[2], 0x50a28be6, 15); cr = rotl(cr, 10)
	  er = fn5(er, ar, br, cr, dr, m[11], 0x50a28be6, 15); br = rotl(br, 10)
	  dr = fn5(dr, er, ar, br, cr, m[4], 0x50a28be6, 5); ar = rotl(ar, 10)
	  cr = fn5(cr, dr, er, ar, br, m[13], 0x50a28be6, 7); er = rotl(er, 10)
	  br = fn5(br, cr, dr, er, ar, m[6], 0x50a28be6, 7); dr = rotl(dr, 10)
	  ar = fn5(ar, br, cr, dr, er, m[15], 0x50a28be6, 8); cr = rotl(cr, 10)
	  er = fn5(er, ar, br, cr, dr, m[8], 0x50a28be6, 11); br = rotl(br, 10)
	  dr = fn5(dr, er, ar, br, cr, m[1], 0x50a28be6, 14); ar = rotl(ar, 10)
	  cr = fn5(cr, dr, er, ar, br, m[10], 0x50a28be6, 14); er = rotl(er, 10)
	  br = fn5(br, cr, dr, er, ar, m[3], 0x50a28be6, 12); dr = rotl(dr, 10)
	  ar = fn5(ar, br, cr, dr, er, m[12], 0x50a28be6, 6); cr = rotl(cr, 10)

	  // M'j = 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2
	  // K' = 0x5c4dd124
	  // S'j = 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11
	  er = fn4(er, ar, br, cr, dr, m[6], 0x5c4dd124, 9); br = rotl(br, 10)
	  dr = fn4(dr, er, ar, br, cr, m[11], 0x5c4dd124, 13); ar = rotl(ar, 10)
	  cr = fn4(cr, dr, er, ar, br, m[3], 0x5c4dd124, 15); er = rotl(er, 10)
	  br = fn4(br, cr, dr, er, ar, m[7], 0x5c4dd124, 7); dr = rotl(dr, 10)
	  ar = fn4(ar, br, cr, dr, er, m[0], 0x5c4dd124, 12); cr = rotl(cr, 10)
	  er = fn4(er, ar, br, cr, dr, m[13], 0x5c4dd124, 8); br = rotl(br, 10)
	  dr = fn4(dr, er, ar, br, cr, m[5], 0x5c4dd124, 9); ar = rotl(ar, 10)
	  cr = fn4(cr, dr, er, ar, br, m[10], 0x5c4dd124, 11); er = rotl(er, 10)
	  br = fn4(br, cr, dr, er, ar, m[14], 0x5c4dd124, 7); dr = rotl(dr, 10)
	  ar = fn4(ar, br, cr, dr, er, m[15], 0x5c4dd124, 7); cr = rotl(cr, 10)
	  er = fn4(er, ar, br, cr, dr, m[8], 0x5c4dd124, 12); br = rotl(br, 10)
	  dr = fn4(dr, er, ar, br, cr, m[12], 0x5c4dd124, 7); ar = rotl(ar, 10)
	  cr = fn4(cr, dr, er, ar, br, m[4], 0x5c4dd124, 6); er = rotl(er, 10)
	  br = fn4(br, cr, dr, er, ar, m[9], 0x5c4dd124, 15); dr = rotl(dr, 10)
	  ar = fn4(ar, br, cr, dr, er, m[1], 0x5c4dd124, 13); cr = rotl(cr, 10)
	  er = fn4(er, ar, br, cr, dr, m[2], 0x5c4dd124, 11); br = rotl(br, 10)

	  // M'j = 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13
	  // K' = 0x6d703ef3
	  // S'j = 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5
	  dr = fn3(dr, er, ar, br, cr, m[15], 0x6d703ef3, 9); ar = rotl(ar, 10)
	  cr = fn3(cr, dr, er, ar, br, m[5], 0x6d703ef3, 7); er = rotl(er, 10)
	  br = fn3(br, cr, dr, er, ar, m[1], 0x6d703ef3, 15); dr = rotl(dr, 10)
	  ar = fn3(ar, br, cr, dr, er, m[3], 0x6d703ef3, 11); cr = rotl(cr, 10)
	  er = fn3(er, ar, br, cr, dr, m[7], 0x6d703ef3, 8); br = rotl(br, 10)
	  dr = fn3(dr, er, ar, br, cr, m[14], 0x6d703ef3, 6); ar = rotl(ar, 10)
	  cr = fn3(cr, dr, er, ar, br, m[6], 0x6d703ef3, 6); er = rotl(er, 10)
	  br = fn3(br, cr, dr, er, ar, m[9], 0x6d703ef3, 14); dr = rotl(dr, 10)
	  ar = fn3(ar, br, cr, dr, er, m[11], 0x6d703ef3, 12); cr = rotl(cr, 10)
	  er = fn3(er, ar, br, cr, dr, m[8], 0x6d703ef3, 13); br = rotl(br, 10)
	  dr = fn3(dr, er, ar, br, cr, m[12], 0x6d703ef3, 5); ar = rotl(ar, 10)
	  cr = fn3(cr, dr, er, ar, br, m[2], 0x6d703ef3, 14); er = rotl(er, 10)
	  br = fn3(br, cr, dr, er, ar, m[10], 0x6d703ef3, 13); dr = rotl(dr, 10)
	  ar = fn3(ar, br, cr, dr, er, m[0], 0x6d703ef3, 13); cr = rotl(cr, 10)
	  er = fn3(er, ar, br, cr, dr, m[4], 0x6d703ef3, 7); br = rotl(br, 10)
	  dr = fn3(dr, er, ar, br, cr, m[13], 0x6d703ef3, 5); ar = rotl(ar, 10)

	  // M'j = 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14
	  // K' = 0x7a6d76e9
	  // S'j = 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8
	  cr = fn2(cr, dr, er, ar, br, m[8], 0x7a6d76e9, 15); er = rotl(er, 10)
	  br = fn2(br, cr, dr, er, ar, m[6], 0x7a6d76e9, 5); dr = rotl(dr, 10)
	  ar = fn2(ar, br, cr, dr, er, m[4], 0x7a6d76e9, 8); cr = rotl(cr, 10)
	  er = fn2(er, ar, br, cr, dr, m[1], 0x7a6d76e9, 11); br = rotl(br, 10)
	  dr = fn2(dr, er, ar, br, cr, m[3], 0x7a6d76e9, 14); ar = rotl(ar, 10)
	  cr = fn2(cr, dr, er, ar, br, m[11], 0x7a6d76e9, 14); er = rotl(er, 10)
	  br = fn2(br, cr, dr, er, ar, m[15], 0x7a6d76e9, 6); dr = rotl(dr, 10)
	  ar = fn2(ar, br, cr, dr, er, m[0], 0x7a6d76e9, 14); cr = rotl(cr, 10)
	  er = fn2(er, ar, br, cr, dr, m[5], 0x7a6d76e9, 6); br = rotl(br, 10)
	  dr = fn2(dr, er, ar, br, cr, m[12], 0x7a6d76e9, 9); ar = rotl(ar, 10)
	  cr = fn2(cr, dr, er, ar, br, m[2], 0x7a6d76e9, 12); er = rotl(er, 10)
	  br = fn2(br, cr, dr, er, ar, m[13], 0x7a6d76e9, 9); dr = rotl(dr, 10)
	  ar = fn2(ar, br, cr, dr, er, m[9], 0x7a6d76e9, 12); cr = rotl(cr, 10)
	  er = fn2(er, ar, br, cr, dr, m[7], 0x7a6d76e9, 5); br = rotl(br, 10)
	  dr = fn2(dr, er, ar, br, cr, m[10], 0x7a6d76e9, 15); ar = rotl(ar, 10)
	  cr = fn2(cr, dr, er, ar, br, m[14], 0x7a6d76e9, 8); er = rotl(er, 10)

	  // M'j = 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
	  // K' = 0x00000000
	  // S'j = 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
	  br = fn1(br, cr, dr, er, ar, m[12], 0x00000000, 8); dr = rotl(dr, 10)
	  ar = fn1(ar, br, cr, dr, er, m[15], 0x00000000, 5); cr = rotl(cr, 10)
	  er = fn1(er, ar, br, cr, dr, m[10], 0x00000000, 12); br = rotl(br, 10)
	  dr = fn1(dr, er, ar, br, cr, m[4], 0x00000000, 9); ar = rotl(ar, 10)
	  cr = fn1(cr, dr, er, ar, br, m[1], 0x00000000, 12); er = rotl(er, 10)
	  br = fn1(br, cr, dr, er, ar, m[5], 0x00000000, 5); dr = rotl(dr, 10)
	  ar = fn1(ar, br, cr, dr, er, m[8], 0x00000000, 14); cr = rotl(cr, 10)
	  er = fn1(er, ar, br, cr, dr, m[7], 0x00000000, 6); br = rotl(br, 10)
	  dr = fn1(dr, er, ar, br, cr, m[6], 0x00000000, 8); ar = rotl(ar, 10)
	  cr = fn1(cr, dr, er, ar, br, m[2], 0x00000000, 13); er = rotl(er, 10)
	  br = fn1(br, cr, dr, er, ar, m[13], 0x00000000, 6); dr = rotl(dr, 10)
	  ar = fn1(ar, br, cr, dr, er, m[14], 0x00000000, 5); cr = rotl(cr, 10)
	  er = fn1(er, ar, br, cr, dr, m[0], 0x00000000, 15); br = rotl(br, 10)
	  dr = fn1(dr, er, ar, br, cr, m[3], 0x00000000, 13); ar = rotl(ar, 10)
	  cr = fn1(cr, dr, er, ar, br, m[9], 0x00000000, 11); er = rotl(er, 10)
	  br = fn1(br, cr, dr, er, ar, m[11], 0x00000000, 11); dr = rotl(dr, 10)

	  // change state
	  var t = (this._b + cl + dr) | 0
	  this._b = (this._c + dl + er) | 0
	  this._c = (this._d + el + ar) | 0
	  this._d = (this._e + al + br) | 0
	  this._e = (this._a + bl + cr) | 0
	  this._a = t
	}

	RIPEMD160.prototype._digest = function () {
	  // create padding and handle blocks
	  this._block[this._blockOffset++] = 0x80
	  if (this._blockOffset > 56) {
	    this._block.fill(0, this._blockOffset, 64)
	    this._update()
	    this._blockOffset = 0
	  }

	  this._block.fill(0, this._blockOffset, 56)
	  this._block.writeUInt32LE(this._length[0], 56)
	  this._block.writeUInt32LE(this._length[1], 60)
	  this._update()

	  // produce result
	  var buffer = new Buffer(20)
	  buffer.writeInt32LE(this._a, 0)
	  buffer.writeInt32LE(this._b, 4)
	  buffer.writeInt32LE(this._c, 8)
	  buffer.writeInt32LE(this._d, 12)
	  buffer.writeInt32LE(this._e, 16)
	  return buffer
	}

	function rotl (x, n) {
	  return (x << n) | (x >>> (32 - n))
	}

	function fn1 (a, b, c, d, e, m, k, s) {
	  return (rotl((a + (b ^ c ^ d) + m + k) | 0, s) + e) | 0
	}

	function fn2 (a, b, c, d, e, m, k, s) {
	  return (rotl((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + e) | 0
	}

	function fn3 (a, b, c, d, e, m, k, s) {
	  return (rotl((a + ((b | (~c)) ^ d) + m + k) | 0, s) + e) | 0
	}

	function fn4 (a, b, c, d, e, m, k, s) {
	  return (rotl((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + e) | 0
	}

	function fn5 (a, b, c, d, e, m, k, s) {
	  return (rotl((a + (b ^ (c | (~d))) + m + k) | 0, s) + e) | 0
	}

	module.exports = RIPEMD160

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	var exports = module.exports = function SHA (algorithm) {
	  algorithm = algorithm.toLowerCase()

	  var Algorithm = exports[algorithm]
	  if (!Algorithm) throw new Error(algorithm + ' is not supported (we accept pull requests)')

	  return new Algorithm()
	}

	exports.sha = __webpack_require__(52)
	exports.sha1 = __webpack_require__(53)
	exports.sha224 = __webpack_require__(54)
	exports.sha256 = __webpack_require__(23)
	exports.sha384 = __webpack_require__(55)
	exports.sha512 = __webpack_require__(24)


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
	 * in FIPS 180-2
	 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 *
	 */

	var inherits = __webpack_require__(1)
	var Hash = __webpack_require__(5)
	var Buffer = __webpack_require__(2).Buffer

	var K = [
	  0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
	  0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
	  0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
	  0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
	  0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
	  0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
	  0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
	  0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
	  0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
	  0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
	  0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
	  0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
	  0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
	  0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
	  0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
	  0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
	]

	var W = new Array(64)

	function Sha256 () {
	  this.init()

	  this._w = W // new Array(64)

	  Hash.call(this, 64, 56)
	}

	inherits(Sha256, Hash)

	Sha256.prototype.init = function () {
	  this._a = 0x6a09e667
	  this._b = 0xbb67ae85
	  this._c = 0x3c6ef372
	  this._d = 0xa54ff53a
	  this._e = 0x510e527f
	  this._f = 0x9b05688c
	  this._g = 0x1f83d9ab
	  this._h = 0x5be0cd19

	  return this
	}

	function ch (x, y, z) {
	  return z ^ (x & (y ^ z))
	}

	function maj (x, y, z) {
	  return (x & y) | (z & (x | y))
	}

	function sigma0 (x) {
	  return (x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10)
	}

	function sigma1 (x) {
	  return (x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7)
	}

	function gamma0 (x) {
	  return (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ (x >>> 3)
	}

	function gamma1 (x) {
	  return (x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ (x >>> 10)
	}

	Sha256.prototype._update = function (M) {
	  var W = this._w

	  var a = this._a | 0
	  var b = this._b | 0
	  var c = this._c | 0
	  var d = this._d | 0
	  var e = this._e | 0
	  var f = this._f | 0
	  var g = this._g | 0
	  var h = this._h | 0

	  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
	  for (; i < 64; ++i) W[i] = (gamma1(W[i - 2]) + W[i - 7] + gamma0(W[i - 15]) + W[i - 16]) | 0

	  for (var j = 0; j < 64; ++j) {
	    var T1 = (h + sigma1(e) + ch(e, f, g) + K[j] + W[j]) | 0
	    var T2 = (sigma0(a) + maj(a, b, c)) | 0

	    h = g
	    g = f
	    f = e
	    e = (d + T1) | 0
	    d = c
	    c = b
	    b = a
	    a = (T1 + T2) | 0
	  }

	  this._a = (a + this._a) | 0
	  this._b = (b + this._b) | 0
	  this._c = (c + this._c) | 0
	  this._d = (d + this._d) | 0
	  this._e = (e + this._e) | 0
	  this._f = (f + this._f) | 0
	  this._g = (g + this._g) | 0
	  this._h = (h + this._h) | 0
	}

	Sha256.prototype._hash = function () {
	  var H = Buffer.allocUnsafe(32)

	  H.writeInt32BE(this._a, 0)
	  H.writeInt32BE(this._b, 4)
	  H.writeInt32BE(this._c, 8)
	  H.writeInt32BE(this._d, 12)
	  H.writeInt32BE(this._e, 16)
	  H.writeInt32BE(this._f, 20)
	  H.writeInt32BE(this._g, 24)
	  H.writeInt32BE(this._h, 28)

	  return H
	}

	module.exports = Sha256


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	var inherits = __webpack_require__(1)
	var Hash = __webpack_require__(5)
	var Buffer = __webpack_require__(2).Buffer

	var K = [
	  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
	  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
	  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
	  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
	  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
	  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
	  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
	  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
	  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
	  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
	  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
	  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
	  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
	  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
	  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
	  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
	  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
	  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
	  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
	  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
	  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
	  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
	  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
	  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
	  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
	  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
	  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
	  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
	  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
	  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
	  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
	  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
	  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
	  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
	  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
	  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
	  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
	  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
	  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
	  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
	]

	var W = new Array(160)

	function Sha512 () {
	  this.init()
	  this._w = W

	  Hash.call(this, 128, 112)
	}

	inherits(Sha512, Hash)

	Sha512.prototype.init = function () {
	  this._ah = 0x6a09e667
	  this._bh = 0xbb67ae85
	  this._ch = 0x3c6ef372
	  this._dh = 0xa54ff53a
	  this._eh = 0x510e527f
	  this._fh = 0x9b05688c
	  this._gh = 0x1f83d9ab
	  this._hh = 0x5be0cd19

	  this._al = 0xf3bcc908
	  this._bl = 0x84caa73b
	  this._cl = 0xfe94f82b
	  this._dl = 0x5f1d36f1
	  this._el = 0xade682d1
	  this._fl = 0x2b3e6c1f
	  this._gl = 0xfb41bd6b
	  this._hl = 0x137e2179

	  return this
	}

	function Ch (x, y, z) {
	  return z ^ (x & (y ^ z))
	}

	function maj (x, y, z) {
	  return (x & y) | (z & (x | y))
	}

	function sigma0 (x, xl) {
	  return (x >>> 28 | xl << 4) ^ (xl >>> 2 | x << 30) ^ (xl >>> 7 | x << 25)
	}

	function sigma1 (x, xl) {
	  return (x >>> 14 | xl << 18) ^ (x >>> 18 | xl << 14) ^ (xl >>> 9 | x << 23)
	}

	function Gamma0 (x, xl) {
	  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7)
	}

	function Gamma0l (x, xl) {
	  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7 | xl << 25)
	}

	function Gamma1 (x, xl) {
	  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6)
	}

	function Gamma1l (x, xl) {
	  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6 | xl << 26)
	}

	function getCarry (a, b) {
	  return (a >>> 0) < (b >>> 0) ? 1 : 0
	}

	Sha512.prototype._update = function (M) {
	  var W = this._w

	  var ah = this._ah | 0
	  var bh = this._bh | 0
	  var ch = this._ch | 0
	  var dh = this._dh | 0
	  var eh = this._eh | 0
	  var fh = this._fh | 0
	  var gh = this._gh | 0
	  var hh = this._hh | 0

	  var al = this._al | 0
	  var bl = this._bl | 0
	  var cl = this._cl | 0
	  var dl = this._dl | 0
	  var el = this._el | 0
	  var fl = this._fl | 0
	  var gl = this._gl | 0
	  var hl = this._hl | 0

	  for (var i = 0; i < 32; i += 2) {
	    W[i] = M.readInt32BE(i * 4)
	    W[i + 1] = M.readInt32BE(i * 4 + 4)
	  }
	  for (; i < 160; i += 2) {
	    var xh = W[i - 15 * 2]
	    var xl = W[i - 15 * 2 + 1]
	    var gamma0 = Gamma0(xh, xl)
	    var gamma0l = Gamma0l(xl, xh)

	    xh = W[i - 2 * 2]
	    xl = W[i - 2 * 2 + 1]
	    var gamma1 = Gamma1(xh, xl)
	    var gamma1l = Gamma1l(xl, xh)

	    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
	    var Wi7h = W[i - 7 * 2]
	    var Wi7l = W[i - 7 * 2 + 1]

	    var Wi16h = W[i - 16 * 2]
	    var Wi16l = W[i - 16 * 2 + 1]

	    var Wil = (gamma0l + Wi7l) | 0
	    var Wih = (gamma0 + Wi7h + getCarry(Wil, gamma0l)) | 0
	    Wil = (Wil + gamma1l) | 0
	    Wih = (Wih + gamma1 + getCarry(Wil, gamma1l)) | 0
	    Wil = (Wil + Wi16l) | 0
	    Wih = (Wih + Wi16h + getCarry(Wil, Wi16l)) | 0

	    W[i] = Wih
	    W[i + 1] = Wil
	  }

	  for (var j = 0; j < 160; j += 2) {
	    Wih = W[j]
	    Wil = W[j + 1]

	    var majh = maj(ah, bh, ch)
	    var majl = maj(al, bl, cl)

	    var sigma0h = sigma0(ah, al)
	    var sigma0l = sigma0(al, ah)
	    var sigma1h = sigma1(eh, el)
	    var sigma1l = sigma1(el, eh)

	    // t1 = h + sigma1 + ch + K[j] + W[j]
	    var Kih = K[j]
	    var Kil = K[j + 1]

	    var chh = Ch(eh, fh, gh)
	    var chl = Ch(el, fl, gl)

	    var t1l = (hl + sigma1l) | 0
	    var t1h = (hh + sigma1h + getCarry(t1l, hl)) | 0
	    t1l = (t1l + chl) | 0
	    t1h = (t1h + chh + getCarry(t1l, chl)) | 0
	    t1l = (t1l + Kil) | 0
	    t1h = (t1h + Kih + getCarry(t1l, Kil)) | 0
	    t1l = (t1l + Wil) | 0
	    t1h = (t1h + Wih + getCarry(t1l, Wil)) | 0

	    // t2 = sigma0 + maj
	    var t2l = (sigma0l + majl) | 0
	    var t2h = (sigma0h + majh + getCarry(t2l, sigma0l)) | 0

	    hh = gh
	    hl = gl
	    gh = fh
	    gl = fl
	    fh = eh
	    fl = el
	    el = (dl + t1l) | 0
	    eh = (dh + t1h + getCarry(el, dl)) | 0
	    dh = ch
	    dl = cl
	    ch = bh
	    cl = bl
	    bh = ah
	    bl = al
	    al = (t1l + t2l) | 0
	    ah = (t1h + t2h + getCarry(al, t1l)) | 0
	  }

	  this._al = (this._al + al) | 0
	  this._bl = (this._bl + bl) | 0
	  this._cl = (this._cl + cl) | 0
	  this._dl = (this._dl + dl) | 0
	  this._el = (this._el + el) | 0
	  this._fl = (this._fl + fl) | 0
	  this._gl = (this._gl + gl) | 0
	  this._hl = (this._hl + hl) | 0

	  this._ah = (this._ah + ah + getCarry(this._al, al)) | 0
	  this._bh = (this._bh + bh + getCarry(this._bl, bl)) | 0
	  this._ch = (this._ch + ch + getCarry(this._cl, cl)) | 0
	  this._dh = (this._dh + dh + getCarry(this._dl, dl)) | 0
	  this._eh = (this._eh + eh + getCarry(this._el, el)) | 0
	  this._fh = (this._fh + fh + getCarry(this._fl, fl)) | 0
	  this._gh = (this._gh + gh + getCarry(this._gl, gl)) | 0
	  this._hh = (this._hh + hh + getCarry(this._hl, hl)) | 0
	}

	Sha512.prototype._hash = function () {
	  var H = Buffer.allocUnsafe(64)

	  function writeInt64BE (h, l, offset) {
	    H.writeInt32BE(h, offset)
	    H.writeInt32BE(l, offset + 4)
	  }

	  writeInt64BE(this._ah, this._al, 0)
	  writeInt64BE(this._bh, this._bl, 8)
	  writeInt64BE(this._ch, this._cl, 16)
	  writeInt64BE(this._dh, this._dl, 24)
	  writeInt64BE(this._eh, this._el, 32)
	  writeInt64BE(this._fh, this._fl, 40)
	  writeInt64BE(this._gh, this._gl, 48)
	  writeInt64BE(this._hh, this._hl, 56)

	  return H
	}

	module.exports = Sha512


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

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

	module.exports = Stream;

	var EE = __webpack_require__(10).EventEmitter;
	var inherits = __webpack_require__(1);

	inherits(Stream, EE);
	Stream.Readable = __webpack_require__(12);
	Stream.Writable = __webpack_require__(50);
	Stream.Duplex = __webpack_require__(45);
	Stream.Transform = __webpack_require__(49);
	Stream.PassThrough = __webpack_require__(48);

	// Backwards-compat with node 0.4.x
	Stream.Stream = Stream;



	// old-style streams.  Note that the pipe method (the only relevant
	// part of this class) is overridden in the Readable class.

	function Stream() {
	  EE.call(this);
	}

	Stream.prototype.pipe = function(dest, options) {
	  var source = this;

	  function ondata(chunk) {
	    if (dest.writable) {
	      if (false === dest.write(chunk) && source.pause) {
	        source.pause();
	      }
	    }
	  }

	  source.on('data', ondata);

	  function ondrain() {
	    if (source.readable && source.resume) {
	      source.resume();
	    }
	  }

	  dest.on('drain', ondrain);

	  // If the 'end' option is not supplied, dest.end() will be called when
	  // source gets the 'end' or 'close' events.  Only dest.end() once.
	  if (!dest._isStdio && (!options || options.end !== false)) {
	    source.on('end', onend);
	    source.on('close', onclose);
	  }

	  var didOnEnd = false;
	  function onend() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    dest.end();
	  }


	  function onclose() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    if (typeof dest.destroy === 'function') dest.destroy();
	  }

	  // don't leave dangling pipes when there are errors.
	  function onerror(er) {
	    cleanup();
	    if (EE.listenerCount(this, 'error') === 0) {
	      throw er; // Unhandled stream error in pipe.
	    }
	  }

	  source.on('error', onerror);
	  dest.on('error', onerror);

	  // remove all the event listeners that were added.
	  function cleanup() {
	    source.removeListener('data', ondata);
	    dest.removeListener('drain', ondrain);

	    source.removeListener('end', onend);
	    source.removeListener('close', onclose);

	    source.removeListener('error', onerror);
	    dest.removeListener('error', onerror);

	    source.removeListener('end', cleanup);
	    source.removeListener('close', cleanup);

	    dest.removeListener('close', cleanup);
	  }

	  source.on('end', cleanup);
	  source.on('close', cleanup);

	  dest.on('close', cleanup);

	  dest.emit('pipe', source);

	  // Allow for unix-like usage: A.pipe(B).pipe(C)
	  return dest;
	};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _buffer = __webpack_require__(3);

	var _randombytes = __webpack_require__(44);

	var _randombytes2 = _interopRequireDefault(_randombytes);

	var _createHmac = __webpack_require__(14);

	var _createHmac2 = _interopRequireDefault(_createHmac);

	var _createHash = __webpack_require__(38);

	var _createHash2 = _interopRequireDefault(_createHash);

	var _BigInteger = __webpack_require__(27);

	var _BigInteger2 = _interopRequireDefault(_BigInteger);

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
	    var hexRandom = (0, _randombytes2.default)(128).toString('hex');

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
	    return (0, _randombytes2.default)(40).toString('base64');
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

	    var hexRandom = (0, _randombytes2.default)(16).toString('hex');
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
	    var hashHex = (0, _createHash2.default)('sha256').update(buf).digest('hex');
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
	    var prk = (0, _createHmac2.default)('sha256', salt).update(ikm).digest();
	    var infoBitsUpdate = _buffer.Buffer.concat([this.infoBits, _buffer.Buffer.from(String.fromCharCode(1), 'utf8')]);
	    var hmac = (0, _createHmac2.default)('sha256', prk).update(infoBitsUpdate).digest();
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
/* 27 */
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
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _CognitoJwtToken2 = __webpack_require__(30);

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
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _CognitoJwtToken2 = __webpack_require__(30);

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
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _buffer = __webpack_require__(3);

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
/* 31 */
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
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _buffer = __webpack_require__(3);

	var _createHmac = __webpack_require__(14);

	var _createHmac2 = _interopRequireDefault(_createHmac);

	var _BigInteger = __webpack_require__(27);

	var _BigInteger2 = _interopRequireDefault(_BigInteger);

	var _AuthenticationHelper = __webpack_require__(26);

	var _AuthenticationHelper2 = _interopRequireDefault(_AuthenticationHelper);

	var _CognitoAccessToken = __webpack_require__(28);

	var _CognitoAccessToken2 = _interopRequireDefault(_CognitoAccessToken);

	var _CognitoIdToken = __webpack_require__(29);

	var _CognitoIdToken2 = _interopRequireDefault(_CognitoIdToken);

	var _CognitoRefreshToken = __webpack_require__(31);

	var _CognitoRefreshToken2 = _interopRequireDefault(_CognitoRefreshToken);

	var _CognitoUserSession = __webpack_require__(34);

	var _CognitoUserSession2 = _interopRequireDefault(_CognitoUserSession);

	var _DateHelper = __webpack_require__(35);

	var _DateHelper2 = _interopRequireDefault(_DateHelper);

	var _CognitoUserAttribute = __webpack_require__(33);

	var _CognitoUserAttribute2 = _interopRequireDefault(_CognitoUserAttribute);

	var _StorageHelper = __webpack_require__(36);

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


	  CognitoUser.prototype.authenticateUser = function authenticateUser(authDetails, callback) {
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

	          var signatureString = (0, _createHmac2.default)('sha256', hkdf).update(_buffer.Buffer.concat([_buffer.Buffer.from(_this2.pool.getUserPoolId().split('_')[1], 'utf8'), _buffer.Buffer.from(_this2.username, 'utf8'), _buffer.Buffer.from(challengeParameters.SECRET_BLOCK, 'base64'), _buffer.Buffer.from(dateNow, 'utf8')])).digest('base64');

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
	  * @param {object} dataAuthenticate authentication data
	  * @param {object} authenticationHelper helper created
	  * @param {callback} callback passed on from caller
	  * @returns {void}
	  */


	  CognitoUser.prototype.authenticateUserInternal = function authenticateUserInternal(dataAuthenticate, authenticationHelper, callback) {
	    var _this3 = this;

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

	      _this3.verifierDevices = deviceSecretVerifierConfig.PasswordVerifier;
	      _this3.deviceGroupKey = newDeviceMetadata.DeviceGroupKey;
	      _this3.randomPassword = authenticationHelper.getRandomPassword();

	      _this3.client.request('ConfirmDevice', {
	        DeviceKey: newDeviceMetadata.DeviceKey,
	        AccessToken: _this3.signInUserSession.getAccessToken().getJwtToken(),
	        DeviceSecretVerifierConfig: deviceSecretVerifierConfig,
	        DeviceName: navigator.userAgent
	      }, function (errConfirm, dataConfirm) {
	        if (errConfirm) {
	          return callback.onFailure(errConfirm);
	        }

	        _this3.deviceKey = dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey;
	        _this3.cacheDeviceKeyAndPassword();
	        if (dataConfirm.UserConfirmationNecessary === true) {
	          return callback.onSuccess(_this3.signInUserSession, dataConfirm.UserConfirmationNecessary);
	        }
	        return callback.onSuccess(_this3.signInUserSession);
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
	    var _this4 = this;

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
	      return _this4.authenticateUserInternal(dataAuthenticate, authenticationHelper, callback);
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
	    var _this5 = this;

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
	        ClientId: _this5.pool.getClientId(),
	        ChallengeResponses: authParameters
	      };
	      if (_this5.getUserContextData()) {
	        jsonReq.UserContextData = _this5.getUserContextData();
	      }
	      _this5.client.request('RespondToAuthChallenge', jsonReq, function (err, data) {
	        if (err) {
	          return callback.onFailure(err);
	        }

	        var challengeParameters = data.ChallengeParameters;

	        var serverBValue = new _BigInteger2.default(challengeParameters.SRP_B, 16);
	        var salt = new _BigInteger2.default(challengeParameters.SALT, 16);

	        authenticationHelper.getPasswordAuthenticationKey(_this5.deviceKey, _this5.randomPassword, serverBValue, salt, function (errHkdf, hkdf) {
	          // getPasswordAuthenticationKey callback start
	          if (errHkdf) {
	            return callback.onFailure(errHkdf);
	          }

	          var dateNow = dateHelper.getNowString();

	          var signatureString = (0, _createHmac2.default)('sha256', hkdf).update(_buffer.Buffer.concat([_buffer.Buffer.from(_this5.deviceGroupKey, 'utf8'), _buffer.Buffer.from(_this5.deviceKey, 'utf8'), _buffer.Buffer.from(challengeParameters.SECRET_BLOCK, 'base64'), _buffer.Buffer.from(dateNow, 'utf8')])).digest('base64');

	          var challengeResponses = {};

	          challengeResponses.USERNAME = _this5.username;
	          challengeResponses.PASSWORD_CLAIM_SECRET_BLOCK = challengeParameters.SECRET_BLOCK;
	          challengeResponses.TIMESTAMP = dateNow;
	          challengeResponses.PASSWORD_CLAIM_SIGNATURE = signatureString;
	          challengeResponses.DEVICE_KEY = _this5.deviceKey;

	          var jsonReqResp = {
	            ChallengeName: 'DEVICE_PASSWORD_VERIFIER',
	            ClientId: _this5.pool.getClientId(),
	            ChallengeResponses: challengeResponses,
	            Session: data.Session
	          };
	          if (_this5.getUserContextData()) {
	            jsonReqResp.UserContextData = _this5.getUserContextData();
	          }

	          _this5.client.request('RespondToAuthChallenge', jsonReqResp, function (errAuthenticate, dataAuthenticate) {
	            if (errAuthenticate) {
	              return callback.onFailure(errAuthenticate);
	            }

	            _this5.signInUserSession = _this5.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
	            _this5.cacheTokens();

	            return callback.onSuccess(_this5.signInUserSession);
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
	    var _this6 = this;

	    var challengeResponses = {};
	    challengeResponses.USERNAME = this.username;
	    challengeResponses.ANSWER = answerChallenge;
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

	      var challengeName = data.ChallengeName;

	      if (challengeName === 'CUSTOM_CHALLENGE') {
	        _this6.Session = data.Session;
	        return callback.customChallenge(data.ChallengeParameters);
	      }

	      _this6.signInUserSession = _this6.getCognitoUserSession(data.AuthenticationResult);
	      _this6.cacheTokens();
	      return callback.onSuccess(_this6.signInUserSession);
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
	    var _this7 = this;

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
	        _this7.getDeviceResponse(callback);
	        return undefined;
	      }

	      _this7.signInUserSession = _this7.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
	      _this7.cacheTokens();

	      if (dataAuthenticate.AuthenticationResult.NewDeviceMetadata == null) {
	        return callback.onSuccess(_this7.signInUserSession);
	      }

	      var authenticationHelper = new _AuthenticationHelper2.default(_this7.pool.getUserPoolId().split('_')[1]);
	      authenticationHelper.generateHashDevice(dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey, dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey, function (errGenHash) {
	        if (errGenHash) {
	          return callback.onFailure(errGenHash);
	        }

	        var deviceSecretVerifierConfig = {
	          Salt: _buffer.Buffer.from(authenticationHelper.getSaltDevices(), 'hex').toString('base64'),
	          PasswordVerifier: _buffer.Buffer.from(authenticationHelper.getVerifierDevices(), 'hex').toString('base64')
	        };

	        _this7.verifierDevices = deviceSecretVerifierConfig.PasswordVerifier;
	        _this7.deviceGroupKey = dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey;
	        _this7.randomPassword = authenticationHelper.getRandomPassword();

	        _this7.client.request('ConfirmDevice', {
	          DeviceKey: dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey,
	          AccessToken: _this7.signInUserSession.getAccessToken().getJwtToken(),
	          DeviceSecretVerifierConfig: deviceSecretVerifierConfig,
	          DeviceName: navigator.userAgent
	        }, function (errConfirm, dataConfirm) {
	          if (errConfirm) {
	            return callback.onFailure(errConfirm);
	          }

	          _this7.deviceKey = dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey;
	          _this7.cacheDeviceKeyAndPassword();
	          if (dataConfirm.UserConfirmationNecessary === true) {
	            return callback.onSuccess(_this7.signInUserSession, dataConfirm.UserConfirmationNecessary);
	          }
	          return callback.onSuccess(_this7.signInUserSession);
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
	    var _this8 = this;

	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback(new Error('User is not authenticated'), null);
	    }

	    this.client.request('DeleteUser', {
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
	    }, function (err) {
	      if (err) {
	        return callback(err, null);
	      }
	      _this8.clearCachedTokens();
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
	    var _this9 = this;

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
	          _this9.clearCachedTokens();
	        }
	        return callback(err, null);
	      }
	      if (authResult) {
	        var authenticationResult = authResult.AuthenticationResult;
	        if (!Object.prototype.hasOwnProperty.call(authenticationResult, 'RefreshToken')) {
	          authenticationResult.RefreshToken = refreshToken.getToken();
	        }
	        _this9.signInUserSession = _this9.getCognitoUserSession(authenticationResult);
	        _this9.cacheTokens();
	        return callback(null, _this9.signInUserSession);
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
	    var _this10 = this;

	    this.forgetSpecificDevice(this.deviceKey, {
	      onFailure: callback.onFailure,
	      onSuccess: function onSuccess(result) {
	        _this10.deviceKey = null;
	        _this10.deviceGroupKey = null;
	        _this10.randomPassword = null;
	        _this10.clearCachedDeviceKeyAndPassword();
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
	    var _this11 = this;

	    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
	      return callback.onFailure(new Error('User is not authenticated'));
	    }

	    this.client.request('GlobalSignOut', {
	      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
	    }, function (err) {
	      if (err) {
	        return callback.onFailure(err);
	      }
	      _this11.clearCachedTokens();
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
	    var _this12 = this;

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
	      _this12.Session = data.Session;
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
	    var _this13 = this;

	    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
	      this.client.request('AssociateSoftwareToken', {
	        Session: this.Session
	      }, function (err, data) {
	        if (err) {
	          return callback.onFailure(err);
	        }
	        _this13.Session = data.Session;
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
	   * This is used by an authenticated or a user trying to authenticate to associate a TOTP MFA
	   * @param {string} totpCode The MFA code entered by the user.
	   * @param {string} friendlyDeviceName The device name we are assigning to the device.
	   * @param {nodeCallback<string>} callback Called on success or error.
	   * @returns {void}
	   */


	  CognitoUser.prototype.verifySoftwareToken = function verifySoftwareToken(totpCode, friendlyDeviceName, callback) {
	    var _this14 = this;

	    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
	      this.client.request('VerifySoftwareToken', {
	        Session: this.Session,
	        UserCode: totpCode,
	        FriendlyDeviceName: friendlyDeviceName
	      }, function (err, data) {
	        if (err) {
	          return callback.onFailure(err);
	        }
	        _this14.Session = data.Session;
	        var challengeResponses = {};
	        challengeResponses.USERNAME = _this14.username;
	        var jsonReq = {
	          ChallengeName: 'MFA_SETUP',
	          ClientId: _this14.pool.getClientId(),
	          ChallengeResponses: challengeResponses,
	          Session: _this14.Session
	        };
	        if (_this14.getUserContextData()) {
	          jsonReq.UserContextData = _this14.getUserContextData();
	        }
	        _this14.client.request('RespondToAuthChallenge', jsonReq, function (errRespond, dataRespond) {
	          if (errRespond) {
	            return callback.onFailure(errRespond);
	          }
	          _this14.signInUserSession = _this14.getCognitoUserSession(dataRespond.AuthenticationResult);
	          _this14.cacheTokens();
	          return callback.onSuccess(_this14.signInUserSession);
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
	        return callback(null, data);
	      });
	    }
	  };

	  return CognitoUser;
	}();

	exports.default = CognitoUser;

/***/ }),
/* 33 */
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
/* 34 */
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
/* 35 */
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
/* 36 */
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
/* 37 */
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
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {'use strict'
	var inherits = __webpack_require__(1)
	var md5 = __webpack_require__(13)
	var RIPEMD160 = __webpack_require__(21)
	var sha = __webpack_require__(22)

	var Base = __webpack_require__(9)

	function HashNoConstructor (hash) {
	  Base.call(this, 'digest')

	  this._hash = hash
	  this.buffers = []
	}

	inherits(HashNoConstructor, Base)

	HashNoConstructor.prototype._update = function (data) {
	  this.buffers.push(data)
	}

	HashNoConstructor.prototype._final = function () {
	  var buf = Buffer.concat(this.buffers)
	  var r = this._hash(buf)
	  this.buffers = null

	  return r
	}

	function Hash (hash) {
	  Base.call(this, 'digest')

	  this._hash = hash
	}

	inherits(Hash, Base)

	Hash.prototype._update = function (data) {
	  this._hash.update(data)
	}

	Hash.prototype._final = function () {
	  return this._hash.digest()
	}

	module.exports = function createHash (alg) {
	  alg = alg.toLowerCase()
	  if (alg === 'md5') return new HashNoConstructor(md5)
	  if (alg === 'rmd160' || alg === 'ripemd160') return new Hash(new RIPEMD160())

	  return new Hash(sha(alg))
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {'use strict'
	var intSize = 4
	var zeroBuffer = new Buffer(intSize)
	zeroBuffer.fill(0)

	var charSize = 8
	var hashSize = 16

	function toArray (buf) {
	  if ((buf.length % intSize) !== 0) {
	    var len = buf.length + (intSize - (buf.length % intSize))
	    buf = Buffer.concat([buf, zeroBuffer], len)
	  }

	  var arr = new Array(buf.length >>> 2)
	  for (var i = 0, j = 0; i < buf.length; i += intSize, j++) {
	    arr[j] = buf.readInt32LE(i)
	  }

	  return arr
	}

	module.exports = function hash (buf, fn) {
	  var arr = fn(toArray(buf), buf.length * charSize)
	  buf = new Buffer(hashSize)
	  for (var i = 0; i < arr.length; i++) {
	    buf.writeInt32LE(arr[i], i << 2, true)
	  }
	  return buf
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict'
	var inherits = __webpack_require__(1)
	var Buffer = __webpack_require__(2).Buffer

	var Base = __webpack_require__(9)

	var ZEROS = Buffer.alloc(128)
	var blocksize = 64

	function Hmac (alg, key) {
	  Base.call(this, 'digest')
	  if (typeof key === 'string') {
	    key = Buffer.from(key)
	  }

	  this._alg = alg
	  this._key = key

	  if (key.length > blocksize) {
	    key = alg(key)
	  } else if (key.length < blocksize) {
	    key = Buffer.concat([key, ZEROS], blocksize)
	  }

	  var ipad = this._ipad = Buffer.allocUnsafe(blocksize)
	  var opad = this._opad = Buffer.allocUnsafe(blocksize)

	  for (var i = 0; i < blocksize; i++) {
	    ipad[i] = key[i] ^ 0x36
	    opad[i] = key[i] ^ 0x5C
	  }

	  this._hash = [ipad]
	}

	inherits(Hmac, Base)

	Hmac.prototype._update = function (data) {
	  this._hash.push(data)
	}

	Hmac.prototype._final = function () {
	  var h = this._alg(Buffer.concat(this._hash))
	  return this._alg(Buffer.concat([this._opad, h]))
	}
	module.exports = Hmac


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {'use strict'
	var Transform = __webpack_require__(25).Transform
	var inherits = __webpack_require__(1)

	function HashBase (blockSize) {
	  Transform.call(this)

	  this._block = new Buffer(blockSize)
	  this._blockSize = blockSize
	  this._blockOffset = 0
	  this._length = [0, 0, 0, 0]

	  this._finalized = false
	}

	inherits(HashBase, Transform)

	HashBase.prototype._transform = function (chunk, encoding, callback) {
	  var error = null
	  try {
	    if (encoding !== 'buffer') chunk = new Buffer(chunk, encoding)
	    this.update(chunk)
	  } catch (err) {
	    error = err
	  }

	  callback(error)
	}

	HashBase.prototype._flush = function (callback) {
	  var error = null
	  try {
	    this.push(this._digest())
	  } catch (err) {
	    error = err
	  }

	  callback(error)
	}

	HashBase.prototype.update = function (data, encoding) {
	  if (!Buffer.isBuffer(data) && typeof data !== 'string') throw new TypeError('Data must be a string or a buffer')
	  if (this._finalized) throw new Error('Digest already called')
	  if (!Buffer.isBuffer(data)) data = new Buffer(data, encoding || 'binary')

	  // consume data
	  var block = this._block
	  var offset = 0
	  while (this._blockOffset + data.length - offset >= this._blockSize) {
	    for (var i = this._blockOffset; i < this._blockSize;) block[i++] = data[offset++]
	    this._update()
	    this._blockOffset = 0
	  }
	  while (offset < data.length) block[this._blockOffset++] = data[offset++]

	  // update length
	  for (var j = 0, carry = data.length * 8; carry > 0; ++j) {
	    this._length[j] += carry
	    carry = (this._length[j] / 0x0100000000) | 0
	    if (carry > 0) this._length[j] -= 0x0100000000 * carry
	  }

	  return this
	}

	HashBase.prototype._update = function (data) {
	  throw new Error('_update is not implemented')
	}

	HashBase.prototype.digest = function (encoding) {
	  if (this._finalized) throw new Error('Digest already called')
	  this._finalized = true

	  var digest = this._digest()
	  if (encoding !== undefined) digest = digest.toString(encoding)
	  return digest
	}

	HashBase.prototype._digest = function () {
	  throw new Error('_digest is not implemented')
	}

	module.exports = HashBase

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ }),
/* 42 */
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
/* 43 */
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
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {'use strict'

	function oldBrowser () {
	  throw new Error('Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11')
	}

	var Buffer = __webpack_require__(2).Buffer
	var crypto = global.crypto || global.msCrypto

	if (crypto && crypto.getRandomValues) {
	  module.exports = randomBytes
	} else {
	  module.exports = oldBrowser
	}

	function randomBytes (size, cb) {
	  // phantomjs needs to throw
	  if (size > 65536) throw new Error('requested too many random bytes')
	  // in case browserify  isn't using the Uint8Array version
	  var rawBytes = new global.Uint8Array(size)

	  // This will not work in older browsers.
	  // See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
	  if (size > 0) {  // getRandomValues fails on IE if size == 0
	    crypto.getRandomValues(rawBytes)
	  }

	  // XXX: phantomjs doesn't like a buffer being passed here
	  var bytes = Buffer.from(rawBytes.buffer)

	  if (typeof cb === 'function') {
	    return process.nextTick(function () {
	      cb(null, bytes)
	    })
	  }

	  return bytes
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(7)))

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(4);


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

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

	// a passthrough stream.
	// basically just the most minimal sort of Transform stream.
	// Every written chunk gets output as-is.

	'use strict';

	module.exports = PassThrough;

	var Transform = __webpack_require__(17);

	/*<replacement>*/
	var util = __webpack_require__(6);
	util.inherits = __webpack_require__(1);
	/*</replacement>*/

	util.inherits(PassThrough, Transform);

	function PassThrough(options) {
	  if (!(this instanceof PassThrough)) return new PassThrough(options);

	  Transform.call(this, options);
	}

	PassThrough.prototype._transform = function (chunk, encoding, cb) {
	  cb(null, chunk);
	};

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	/*<replacement>*/

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Buffer = __webpack_require__(2).Buffer;
	/*</replacement>*/

	function copyBuffer(src, target, offset) {
	  src.copy(target, offset);
	}

	module.exports = function () {
	  function BufferList() {
	    _classCallCheck(this, BufferList);

	    this.head = null;
	    this.tail = null;
	    this.length = 0;
	  }

	  BufferList.prototype.push = function push(v) {
	    var entry = { data: v, next: null };
	    if (this.length > 0) this.tail.next = entry;else this.head = entry;
	    this.tail = entry;
	    ++this.length;
	  };

	  BufferList.prototype.unshift = function unshift(v) {
	    var entry = { data: v, next: this.head };
	    if (this.length === 0) this.tail = entry;
	    this.head = entry;
	    ++this.length;
	  };

	  BufferList.prototype.shift = function shift() {
	    if (this.length === 0) return;
	    var ret = this.head.data;
	    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
	    --this.length;
	    return ret;
	  };

	  BufferList.prototype.clear = function clear() {
	    this.head = this.tail = null;
	    this.length = 0;
	  };

	  BufferList.prototype.join = function join(s) {
	    if (this.length === 0) return '';
	    var p = this.head;
	    var ret = '' + p.data;
	    while (p = p.next) {
	      ret += s + p.data;
	    }return ret;
	  };

	  BufferList.prototype.concat = function concat(n) {
	    if (this.length === 0) return Buffer.alloc(0);
	    if (this.length === 1) return this.head.data;
	    var ret = Buffer.allocUnsafe(n >>> 0);
	    var p = this.head;
	    var i = 0;
	    while (p) {
	      copyBuffer(p.data, ret, i);
	      i += p.data.length;
	      p = p.next;
	    }
	    return ret;
	  };

	  return BufferList;
	}();

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(12).PassThrough


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(12).Transform


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(11);


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";

	    if (global.setImmediate) {
	        return;
	    }

	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;

	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }

	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }

	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }

	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }

	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }

	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }

	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };

	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }

	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }

	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };

	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }

	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }

	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }

	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();

	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();

	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();

	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();

	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }

	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(7)))

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-0, as defined
	 * in FIPS PUB 180-1
	 * This source code is derived from sha1.js of the same repository.
	 * The difference between SHA-0 and SHA-1 is just a bitwise rotate left
	 * operation was added.
	 */

	var inherits = __webpack_require__(1)
	var Hash = __webpack_require__(5)
	var Buffer = __webpack_require__(2).Buffer

	var K = [
	  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
	]

	var W = new Array(80)

	function Sha () {
	  this.init()
	  this._w = W

	  Hash.call(this, 64, 56)
	}

	inherits(Sha, Hash)

	Sha.prototype.init = function () {
	  this._a = 0x67452301
	  this._b = 0xefcdab89
	  this._c = 0x98badcfe
	  this._d = 0x10325476
	  this._e = 0xc3d2e1f0

	  return this
	}

	function rotl5 (num) {
	  return (num << 5) | (num >>> 27)
	}

	function rotl30 (num) {
	  return (num << 30) | (num >>> 2)
	}

	function ft (s, b, c, d) {
	  if (s === 0) return (b & c) | ((~b) & d)
	  if (s === 2) return (b & c) | (b & d) | (c & d)
	  return b ^ c ^ d
	}

	Sha.prototype._update = function (M) {
	  var W = this._w

	  var a = this._a | 0
	  var b = this._b | 0
	  var c = this._c | 0
	  var d = this._d | 0
	  var e = this._e | 0

	  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
	  for (; i < 80; ++i) W[i] = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]

	  for (var j = 0; j < 80; ++j) {
	    var s = ~~(j / 20)
	    var t = (rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0

	    e = d
	    d = c
	    c = rotl30(b)
	    b = a
	    a = t
	  }

	  this._a = (a + this._a) | 0
	  this._b = (b + this._b) | 0
	  this._c = (c + this._c) | 0
	  this._d = (d + this._d) | 0
	  this._e = (e + this._e) | 0
	}

	Sha.prototype._hash = function () {
	  var H = Buffer.allocUnsafe(20)

	  H.writeInt32BE(this._a | 0, 0)
	  H.writeInt32BE(this._b | 0, 4)
	  H.writeInt32BE(this._c | 0, 8)
	  H.writeInt32BE(this._d | 0, 12)
	  H.writeInt32BE(this._e | 0, 16)

	  return H
	}

	module.exports = Sha


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
	 * in FIPS PUB 180-1
	 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for details.
	 */

	var inherits = __webpack_require__(1)
	var Hash = __webpack_require__(5)
	var Buffer = __webpack_require__(2).Buffer

	var K = [
	  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
	]

	var W = new Array(80)

	function Sha1 () {
	  this.init()
	  this._w = W

	  Hash.call(this, 64, 56)
	}

	inherits(Sha1, Hash)

	Sha1.prototype.init = function () {
	  this._a = 0x67452301
	  this._b = 0xefcdab89
	  this._c = 0x98badcfe
	  this._d = 0x10325476
	  this._e = 0xc3d2e1f0

	  return this
	}

	function rotl1 (num) {
	  return (num << 1) | (num >>> 31)
	}

	function rotl5 (num) {
	  return (num << 5) | (num >>> 27)
	}

	function rotl30 (num) {
	  return (num << 30) | (num >>> 2)
	}

	function ft (s, b, c, d) {
	  if (s === 0) return (b & c) | ((~b) & d)
	  if (s === 2) return (b & c) | (b & d) | (c & d)
	  return b ^ c ^ d
	}

	Sha1.prototype._update = function (M) {
	  var W = this._w

	  var a = this._a | 0
	  var b = this._b | 0
	  var c = this._c | 0
	  var d = this._d | 0
	  var e = this._e | 0

	  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
	  for (; i < 80; ++i) W[i] = rotl1(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16])

	  for (var j = 0; j < 80; ++j) {
	    var s = ~~(j / 20)
	    var t = (rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0

	    e = d
	    d = c
	    c = rotl30(b)
	    b = a
	    a = t
	  }

	  this._a = (a + this._a) | 0
	  this._b = (b + this._b) | 0
	  this._c = (c + this._c) | 0
	  this._d = (d + this._d) | 0
	  this._e = (e + this._e) | 0
	}

	Sha1.prototype._hash = function () {
	  var H = Buffer.allocUnsafe(20)

	  H.writeInt32BE(this._a | 0, 0)
	  H.writeInt32BE(this._b | 0, 4)
	  H.writeInt32BE(this._c | 0, 8)
	  H.writeInt32BE(this._d | 0, 12)
	  H.writeInt32BE(this._e | 0, 16)

	  return H
	}

	module.exports = Sha1


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
	 * in FIPS 180-2
	 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 *
	 */

	var inherits = __webpack_require__(1)
	var Sha256 = __webpack_require__(23)
	var Hash = __webpack_require__(5)
	var Buffer = __webpack_require__(2).Buffer

	var W = new Array(64)

	function Sha224 () {
	  this.init()

	  this._w = W // new Array(64)

	  Hash.call(this, 64, 56)
	}

	inherits(Sha224, Sha256)

	Sha224.prototype.init = function () {
	  this._a = 0xc1059ed8
	  this._b = 0x367cd507
	  this._c = 0x3070dd17
	  this._d = 0xf70e5939
	  this._e = 0xffc00b31
	  this._f = 0x68581511
	  this._g = 0x64f98fa7
	  this._h = 0xbefa4fa4

	  return this
	}

	Sha224.prototype._hash = function () {
	  var H = Buffer.allocUnsafe(28)

	  H.writeInt32BE(this._a, 0)
	  H.writeInt32BE(this._b, 4)
	  H.writeInt32BE(this._c, 8)
	  H.writeInt32BE(this._d, 12)
	  H.writeInt32BE(this._e, 16)
	  H.writeInt32BE(this._f, 20)
	  H.writeInt32BE(this._g, 24)

	  return H
	}

	module.exports = Sha224


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	var inherits = __webpack_require__(1)
	var SHA512 = __webpack_require__(24)
	var Hash = __webpack_require__(5)
	var Buffer = __webpack_require__(2).Buffer

	var W = new Array(160)

	function Sha384 () {
	  this.init()
	  this._w = W

	  Hash.call(this, 128, 112)
	}

	inherits(Sha384, SHA512)

	Sha384.prototype.init = function () {
	  this._ah = 0xcbbb9d5d
	  this._bh = 0x629a292a
	  this._ch = 0x9159015a
	  this._dh = 0x152fecd8
	  this._eh = 0x67332667
	  this._fh = 0x8eb44a87
	  this._gh = 0xdb0c2e0d
	  this._hh = 0x47b5481d

	  this._al = 0xc1059ed8
	  this._bl = 0x367cd507
	  this._cl = 0x3070dd17
	  this._dl = 0xf70e5939
	  this._el = 0xffc00b31
	  this._fl = 0x68581511
	  this._gl = 0x64f98fa7
	  this._hl = 0xbefa4fa4

	  return this
	}

	Sha384.prototype._hash = function () {
	  var H = Buffer.allocUnsafe(48)

	  function writeInt64BE (h, l, offset) {
	    H.writeInt32BE(h, offset)
	    H.writeInt32BE(l, offset + 4)
	  }

	  writeInt64BE(this._ah, this._al, 0)
	  writeInt64BE(this._bh, this._bl, 8)
	  writeInt64BE(this._ch, this._cl, 16)
	  writeInt64BE(this._dh, this._dl, 24)
	  writeInt64BE(this._eh, this._el, 32)
	  writeInt64BE(this._fh, this._fl, 40)

	  return H
	}

	module.exports = Sha384


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

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

	var Buffer = __webpack_require__(3).Buffer;

	var isBufferEncoding = Buffer.isEncoding
	  || function(encoding) {
	       switch (encoding && encoding.toLowerCase()) {
	         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
	         default: return false;
	       }
	     }


	function assertEncoding(encoding) {
	  if (encoding && !isBufferEncoding(encoding)) {
	    throw new Error('Unknown encoding: ' + encoding);
	  }
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters. CESU-8 is handled as part of the UTF-8 encoding.
	//
	// @TODO Handling all encodings inside a single object makes it very difficult
	// to reason about this code, so it should be split up in the future.
	// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
	// points as used by CESU-8.
	var StringDecoder = exports.StringDecoder = function(encoding) {
	  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
	  assertEncoding(encoding);
	  switch (this.encoding) {
	    case 'utf8':
	      // CESU-8 represents each of Surrogate Pair by 3-bytes
	      this.surrogateSize = 3;
	      break;
	    case 'ucs2':
	    case 'utf16le':
	      // UTF-16 represents each of Surrogate Pair by 2-bytes
	      this.surrogateSize = 2;
	      this.detectIncompleteChar = utf16DetectIncompleteChar;
	      break;
	    case 'base64':
	      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
	      this.surrogateSize = 3;
	      this.detectIncompleteChar = base64DetectIncompleteChar;
	      break;
	    default:
	      this.write = passThroughWrite;
	      return;
	  }

	  // Enough space to store all bytes of a single character. UTF-8 needs 4
	  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
	  this.charBuffer = new Buffer(6);
	  // Number of bytes received for the current incomplete multi-byte character.
	  this.charReceived = 0;
	  // Number of bytes expected for the current incomplete multi-byte character.
	  this.charLength = 0;
	};


	// write decodes the given buffer and returns it as JS string that is
	// guaranteed to not contain any partial multi-byte characters. Any partial
	// character found at the end of the buffer is buffered up, and will be
	// returned when calling write again with the remaining bytes.
	//
	// Note: Converting a Buffer containing an orphan surrogate to a String
	// currently works, but converting a String to a Buffer (via `new Buffer`, or
	// Buffer#write) will replace incomplete surrogates with the unicode
	// replacement character. See https://codereview.chromium.org/121173009/ .
	StringDecoder.prototype.write = function(buffer) {
	  var charStr = '';
	  // if our last write ended with an incomplete multibyte character
	  while (this.charLength) {
	    // determine how many remaining bytes this buffer has to offer for this char
	    var available = (buffer.length >= this.charLength - this.charReceived) ?
	        this.charLength - this.charReceived :
	        buffer.length;

	    // add the new bytes to the char buffer
	    buffer.copy(this.charBuffer, this.charReceived, 0, available);
	    this.charReceived += available;

	    if (this.charReceived < this.charLength) {
	      // still not enough chars in this buffer? wait for more ...
	      return '';
	    }

	    // remove bytes belonging to the current character from the buffer
	    buffer = buffer.slice(available, buffer.length);

	    // get the character that was split
	    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

	    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	    var charCode = charStr.charCodeAt(charStr.length - 1);
	    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	      this.charLength += this.surrogateSize;
	      charStr = '';
	      continue;
	    }
	    this.charReceived = this.charLength = 0;

	    // if there are no more bytes in this buffer, just emit our char
	    if (buffer.length === 0) {
	      return charStr;
	    }
	    break;
	  }

	  // determine and set charLength / charReceived
	  this.detectIncompleteChar(buffer);

	  var end = buffer.length;
	  if (this.charLength) {
	    // buffer the incomplete character bytes we got
	    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
	    end -= this.charReceived;
	  }

	  charStr += buffer.toString(this.encoding, 0, end);

	  var end = charStr.length - 1;
	  var charCode = charStr.charCodeAt(end);
	  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	    var size = this.surrogateSize;
	    this.charLength += size;
	    this.charReceived += size;
	    this.charBuffer.copy(this.charBuffer, size, 0, size);
	    buffer.copy(this.charBuffer, 0, 0, size);
	    return charStr.substring(0, end);
	  }

	  // or just emit the charStr
	  return charStr;
	};

	// detectIncompleteChar determines if there is an incomplete UTF-8 character at
	// the end of the given buffer. If so, it sets this.charLength to the byte
	// length that character, and sets this.charReceived to the number of bytes
	// that are available for this character.
	StringDecoder.prototype.detectIncompleteChar = function(buffer) {
	  // determine how many bytes we have to check at the end of this buffer
	  var i = (buffer.length >= 3) ? 3 : buffer.length;

	  // Figure out if one of the last i bytes of our buffer announces an
	  // incomplete char.
	  for (; i > 0; i--) {
	    var c = buffer[buffer.length - i];

	    // See http://en.wikipedia.org/wiki/UTF-8#Description

	    // 110XXXXX
	    if (i == 1 && c >> 5 == 0x06) {
	      this.charLength = 2;
	      break;
	    }

	    // 1110XXXX
	    if (i <= 2 && c >> 4 == 0x0E) {
	      this.charLength = 3;
	      break;
	    }

	    // 11110XXX
	    if (i <= 3 && c >> 3 == 0x1E) {
	      this.charLength = 4;
	      break;
	    }
	  }
	  this.charReceived = i;
	};

	StringDecoder.prototype.end = function(buffer) {
	  var res = '';
	  if (buffer && buffer.length)
	    res = this.write(buffer);

	  if (this.charReceived) {
	    var cr = this.charReceived;
	    var buf = this.charBuffer;
	    var enc = this.encoding;
	    res += buf.slice(0, cr).toString(enc);
	  }

	  return res;
	};

	function passThroughWrite(buffer) {
	  return buffer.toString(this.encoding);
	}

	function utf16DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 2;
	  this.charLength = this.charReceived ? 2 : 0;
	}

	function base64DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 3;
	  this.charLength = this.charReceived ? 3 : 0;
	}


/***/ }),
/* 57 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/**
	 * Module exports.
	 */

	module.exports = deprecate;

	/**
	 * Mark that a method should not be used.
	 * Returns a modified function which warns once by default.
	 *
	 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
	 *
	 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
	 * will throw an Error when invoked.
	 *
	 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
	 * will invoke `console.trace()` instead of `console.error()`.
	 *
	 * @param {Function} fn - the function to deprecate
	 * @param {String} msg - the string to print to the console when `fn` is invoked
	 * @returns {Function} a new "deprecated" version of `fn`
	 * @api public
	 */

	function deprecate (fn, msg) {
	  if (config('noDeprecation')) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (config('throwDeprecation')) {
	        throw new Error(msg);
	      } else if (config('traceDeprecation')) {
	        console.trace(msg);
	      } else {
	        console.warn(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	}

	/**
	 * Checks `localStorage` for boolean values for the given `name`.
	 *
	 * @param {String} name
	 * @returns {Boolean}
	 * @api private
	 */

	function config (name) {
	  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
	  try {
	    if (!global.localStorage) return false;
	  } catch (_) {
	    return false;
	  }
	  var val = global.localStorage[name];
	  if (null == val) return false;
	  return String(val).toLowerCase() === 'true';
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 58 */
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
/* 59 */
/***/ (function(module, exports) {

	'use strict';

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/** @class */
	var Client = function () {
	  /**
	   * Constructs a new AWS Cognito Identity Provider client object
	   * @param {string} region AWS region.
	   * @param {string} endpoint endpoint
	   */
	  function Client(region, endpoint) {
	    _classCallCheck(this, Client);

	    this.endpoint = endpoint || 'https://cognito-idp.' + region + '.amazonaws.com/';
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
	      'X-Amz-User-Agent': 'aws-amplify/1.0'
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
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _Client = __webpack_require__(59);

	var _Client2 = _interopRequireDefault(_Client);

	var _CognitoUser = __webpack_require__(32);

	var _CognitoUser2 = _interopRequireDefault(_CognitoUser);

	var _StorageHelper = __webpack_require__(36);

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
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _jsCookie = __webpack_require__(43);

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
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

	var apply = Function.prototype.apply;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// setimmediate attaches itself to the global object
	__webpack_require__(51);
	exports.setImmediate = setImmediate;
	exports.clearImmediate = clearImmediate;


/***/ }),
/* 63 */
/***/ (function(module, exports) {

	/* (ignored) */

/***/ })
/******/ ])
});
;