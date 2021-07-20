import cryptoSecureRandomInt from './cryptoSecureRandomInt';

/**
 * 
 * TODO: update, clean, license
 * 
 * This is a single source of truth of our current depedency on crypto-js
 * It should be considered as a module as a whole, which can be extended, refactored, or replaced
 * 
 * Its major functionalities
 * 1.A data structure called WordArray
 * 2.expose HmacSHA256, SHA256, Base64 functionalities, which interacts with WordArray
 * 
 * The exposed functions and the data structure are coupled!
 * 
 * WordArray is an ecapusulation of TypedArray, it is the fundamental data structure used by the functions,
 * TypedArray, is for high performance bitwise calculation on javascript. [link]
 * 
 * crypto-js was first created by
 * then forked in github by 
 * 
 * However, either of them meet our need, besides, maintain issue, relatively stable algorthim
 * 
 * Belows are the consideration
 * 
 * crypto-js | not actively maintained and was written in IIFE + prototype based style
 * cryto-es  | still relies on Math.random
 * 
 * Besides, we don't need all the functionalities from those crypto package, but just a subset of it.
 * Currently, we need its xxx, xxx, xxx
 * 
 * aws-crypto | does not have a Hmac implementation
 * also, aws-crypto sha256 cannot ...., because crytoJs is xxx[coupling issue]
 * 
 * Notice, the native browser crypto api has Hmac implementation, but it is async based
 * as pointed out here [stackoverflow link]
 * 
 * This means using native api would require a fully rewrite of our sync based Auth functions.
 * 
 * At this moment, the best sync Hmac algorithm, is still based on Jeff's original implementation
 *
 * The rewrite is based on ES6 class syntax, but strictly following the original prototype based implementaion
 * 
 * All the related classes are put in this single file for
 * 
 */

//-------crypto-js/core-------------
/**
 * Base class for inheritance.
 */
class Base {
    /**
     * Extends this object and runs the init method.
     * Arguments to create() will be passed to init().
     *
     * @return {Object} The new object.
     *
     * @static
     *
     * @example
     *
     *     var instance = MyType.create();
     */
    static create(...args) {
      return new this(...args);
    }
  
    /**
     * Copies properties into this object.
     *
     * @param {Object} properties The properties to mix in.
     *
     * @example
     *
     *     MyType.mixIn({
     *         field: 'value'
     *     });
     */
    mixIn(properties) {
      return Object.assign(this, properties);
    }
  
    /**
     * Creates a copy of this object.
     *
     * @return {Object} The clone.
     *
     * @example
     *
     *     var clone = instance.clone();
     */
    clone() {
      const clone = new this.constructor();
      Object.assign(clone, this);
      return clone;
    }
}
  
/**
 * An array of 32-bit words.
 *
 * @property {Array} words The array of 32-bit words.
 * @property {number} sigBytes The number of significant bytes in this word array.
 */
export class WordArray extends Base {
	/**
	 * Initializes a newly created word array.
	 *
	 * @param {Array} words (Optional) An array of 32-bit words.
	 * @param {number} sigBytes (Optional) The number of significant bytes in the words.
	 *
	 * @example
	 *
	 *     var wordArray = CryptoJS.WordArray.create();
	 *     var wordArray = CryptoJS.WordArray.create([0x00010203, 0x04050607]);
	 *     var wordArray = CryptoJS.WordArray.create([0x00010203, 0x04050607], 6);
	 */
	constructor(words = [], sigBytes = words.length * 4) {
		super();
		// directly shim in 'crypto-js/lib-typedarrays'

		let typedArray = words;
		// Convert buffers to uint8
		if (typedArray instanceof ArrayBuffer) {
			typedArray = new Uint8Array(typedArray);
		}

		// Convert other array views to uint8
		if (
			typedArray instanceof Int8Array
			|| typedArray instanceof Uint8ClampedArray
			|| typedArray instanceof Int16Array
			|| typedArray instanceof Uint16Array
			|| typedArray instanceof Int32Array
			|| typedArray instanceof Uint32Array
			|| typedArray instanceof Float32Array
			|| typedArray instanceof Float64Array
		) {
			typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
		}

		// Handle Uint8Array
		if (typedArray instanceof Uint8Array) {
			// Shortcut
			const typedArrayByteLength = typedArray.byteLength;

			// Extract bytes
			const _words = [];
			for (let i = 0; i < typedArrayByteLength; i += 1) {
				_words[i >>> 2] |= typedArray[i] << (24 - (i % 4) * 8);
			}

			// Initialize this word array
			this.words = _words;
			this.sigBytes = typedArrayByteLength;
		} else {
			// Else call normal init
			this.words = words;
			this.sigBytes = sigBytes;
		}
	}

	/**
	 * A static method to create a word array filled with random bytes.
	 *
	 * @param {number} nBytes The number of random bytes to generate.
	 *
	 * @return {WordArray} The random word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     var wordArray = CryptoJSHelper.WordArray.random(16);
	 */
	static random(nBytes) {
		const words = [];

		// this is different from the original implementation, as amplify needs to support both js and react-native
		// which relies on different methods to get native random int
		for (var i = 0; i < nBytes; i += 4) {
			words.push(cryptoSecureRandomInt());
		}

		return new WordArray(words, nBytes);
	}

	/**
	 * Converts this word array to a string.
	 *
	 * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
	 *
	 * @return {string} The stringified word array.
	 *
	 * @example
	 *
	 *     var string = wordArray + '';
	 *     var string = wordArray.toString();
	 *     var string = wordArray.toString(CryptoJS.enc.Utf8);
	 */
	toString(encoder = Hex) {
		return encoder.stringify(this);
	}

	/**
	 * Concatenates a word array to this word array.
	 *
	 * @param {WordArray} wordArray The word array to append.
	 *
	 * @return {WordArray} This word array.
	 *
	 * @example
	 *
	 *     wordArray1.concat(wordArray2);
	 */
	concat(wordArray) {
		// Shortcuts
		const thisWords = this.words;
		const thatWords = wordArray.words;
		const thisSigBytes = this.sigBytes;
		const thatSigBytes = wordArray.sigBytes;

		// Clamp excess bits
		this.clamp();

		// Concat
		if (thisSigBytes % 4) {
			// Copy one byte at a time
			for (let i = 0; i < thatSigBytes; i += 1) {
				const thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
				thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
			}
		} else {
			// Copy one word at a time
			for (let i = 0; i < thatSigBytes; i += 4) {
				thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
			}
		}
		this.sigBytes += thatSigBytes;

		// Chainable
		return this;
	}

	/**
	 * Removes insignificant bits.
	 *
	 * @example
	 *
	 *     wordArray.clamp();
	 */
	clamp() {
		// Shortcuts
		const { words, sigBytes } = this;

		// Clamp
		words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
		words.length = Math.ceil(sigBytes / 4);
	}

	/**
	 * Creates a copy of this word array.
	 *
	 * @return {WordArray} The clone.
	 *
	 * @example
	 *
	 *     var clone = wordArray.clone();
	 */
	clone() {
		const clone = super.clone.call(this);
		clone.words = this.words.slice(0);

		return clone;
	}
}
  
/**
 * Hex encoding strategy.(checked)
 */
const Hex = {
	/**
	 * Converts a word array to a hex string.
	 *
	 * @param {WordArray} wordArray The word array.
	 *
	 * @return {string} The hex string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
	 */
	stringify(wordArray) {
		// Shortcuts
		const { words, sigBytes } = wordArray;

		// Convert
		const hexChars = [];
		for (let i = 0; i < sigBytes; i += 1) {
		const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
		hexChars.push((bite >>> 4).toString(16));
		hexChars.push((bite & 0x0f).toString(16));
		}

		return hexChars.join('');
	},

	/**
	 * Converts a hex string to a word array.
	 *
	 * @param {string} hexStr The hex string.
	 *
	 * @return {WordArray} The word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
	 */
	parse(hexStr) {
		// Shortcut
		const hexStrLength = hexStr.length;

		// Convert
		const words = [];
		for (let i = 0; i < hexStrLength; i += 2) {
		words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
		}

		return new WordArray(words, hexStrLength / 2);
	},
};
  
/**
 * Latin1 encoding strategy.(checked)
 */
const Latin1 = {
	/**
	 * Converts a word array to a Latin1 string.
	 *
	 * @param {WordArray} wordArray The word array.
	 *
	 * @return {string} The Latin1 string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
	 */
	stringify(wordArray) {
		// Shortcuts
		const { words, sigBytes } = wordArray;

		// Convert
		const latin1Chars = [];
		for (let i = 0; i < sigBytes; i += 1) {
		const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
		latin1Chars.push(String.fromCharCode(bite));
		}

		return latin1Chars.join('');
	},

	/**
	 * Converts a Latin1 string to a word array.
	 *
	 * @param {string} latin1Str The Latin1 string.
	 *
	 * @return {WordArray} The word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
	 */
	parse(latin1Str) {
		// Shortcut
		const latin1StrLength = latin1Str.length;

		// Convert
		const words = [];
		for (let i = 0; i < latin1StrLength; i += 1) {
		words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
		}

		return new WordArray(words, latin1StrLength);
	},
};

/**
 * UTF-8 encoding strategy.(checked, same as original)
 */
const Utf8 = {
	/**
	 * Converts a word array to a UTF-8 string.
	 *
	 * @param {WordArray} wordArray The word array.
	 *
	 * @return {string} The UTF-8 string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
	 */
	stringify(wordArray) {
		try {
		return decodeURIComponent(escape(Latin1.stringify(wordArray)));
		} catch (e) {
		throw new Error('Malformed UTF-8 data');
		}
	},

	/**
	 * Converts a UTF-8 string to a word array.
	 *
	 * @param {string} utf8Str The UTF-8 string.
	 *
	 * @return {WordArray} The word array.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
	 */
	parse(utf8Str) {
		return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
	},
};
  
/**
 * Abstract buffered block algorithm template. (checked, similar to crypto-es)
 *
 * The property blockSize must be implemented in a concrete subtype.
 *
 * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
 */
class BufferedBlockAlgorithm extends Base {
	constructor() {
		super();
		this._minBufferSize = 0;
	}

	/**
	 * Resets this block algorithm's data buffer to its initial state.
	 *
	 * @example
	 *
	 *     bufferedBlockAlgorithm.reset();
	 */
	reset() {
		// Initial values
		this._data = new WordArray();
		this._nDataBytes = 0;
	}

	/**
	 * Adds new data to this block algorithm's buffer.
	 *
	 * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
	 *
	 * @example
	 *
	 *     bufferedBlockAlgorithm._append('data');
	 *     bufferedBlockAlgorithm._append(wordArray);
	 */
	_append(data) {
		let m_data = data;

		// Convert string to WordArray, else assume WordArray already
		if (typeof m_data === 'string') {
		m_data = Utf8.parse(m_data);
		}

		// Append
		this._data.concat(m_data);
		this._nDataBytes += m_data.sigBytes;
	}

	/**
	 * Processes available data blocks.
	 *
	 * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
	 *
	 * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
	 *
	 * @return {WordArray} The processed data.
	 *
	 * @example
	 *
	 *     var processedData = bufferedBlockAlgorithm._process();
	 *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
	 */
	_process(doFlush) {
		let processedWords;

		// Shortcuts
		const { _data: data, blockSize } = this;
		const dataWords = data.words;
		const dataSigBytes = data.sigBytes;
		const blockSizeBytes = blockSize * 4;

		// Count blocks ready
		let nBlocksReady = dataSigBytes / blockSizeBytes;
		if (doFlush) {
			// Round up to include partial blocks
			nBlocksReady = Math.ceil(nBlocksReady);
		} else {
			// Round down to include only full blocks,
			// less the number of blocks that must remain in the buffer
			nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
		}

		// Count words ready
		const nWordsReady = nBlocksReady * blockSize;

		// Count bytes ready
		const nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

		// Process blocks
		if (nWordsReady) {
			for (let offset = 0; offset < nWordsReady; offset += blockSize) {
				// Perform concrete-algorithm logic
				this._doProcessBlock(dataWords, offset);
			}

			// Remove processed words
			processedWords = dataWords.splice(0, nWordsReady);
			data.sigBytes -= nBytesReady;
		}

		// Return processed words
		return new WordArray(processedWords, nBytesReady);
	}

	/**
	 * Creates a copy of this object.
	 *
	 * @return {Object} The clone.
	 *
	 * @example
	 *
	 *     var clone = bufferedBlockAlgorithm.clone();
	 */
	clone() {
		const clone = super.clone.call(this);
		clone._data = this._data.clone();

		return clone;
	}
}
  
/**
 * Abstract hasher template.
 *
 * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
 */
class Hasher extends BufferedBlockAlgorithm {
	constructor(cfg) {
		super();

		this.blockSize = 512 / 32;

        // Apply config defaults
		this.cfg = Object.assign(new Base(), cfg);

		// Set initial values
		this.reset();
	}

	/**
	 * Creates a shortcut function to a hasher's object interface.
	 *
	 * @param {Hasher} hasher The hasher to create a helper for.
	 *
	 * @return {Function} The shortcut function.
	 *
	 * @static
	 *
	 * @example
	 *
	 */
	static _createHelper(hasher) {
		return (message, cfg) => new hasher(cfg).finalize(message);
	}

	/**
	 * Creates a shortcut function to the HMAC's object interface.
	 *
	 * @param {Hasher} hasher The hasher to use in this HMAC helper.
	 *
	 * @return {Function} The shortcut function.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
	 */
	static _createHmacHelper(hasher) {
		return (message, key) => new algo.HMAC(hasher, key).finalize(message);
	}

	/**
	 * Resets this hasher to its initial state.
	 *
	 * @example
	 *
	 *     hasher.reset();
	 */
	reset() {
		// Reset data buffer
		super.reset.call(this);

		// Perform concrete-hasher logic
		this._doReset();
	}

	/**
	 * Updates this hasher with a message.
	 *
	 * @param {WordArray|string} messageUpdate The message to append.
	 *
	 * @return {Hasher} This hasher.
	 *
	 * @example
	 *
	 *     hasher.update('message');
	 *     hasher.update(wordArray);
	 */
	update(messageUpdate) {
		// Append
		this._append(messageUpdate);

		// Update the hash
		this._process();

		// Chainable
		return this;
	}

	/**
	 * Finalizes the hash computation.
	 * Note that the finalize operation is effectively a destructive, read-once operation.
	 *
	 * @param {WordArray|string} messageUpdate (Optional) A final message update.
	 *
	 * @return {WordArray} The hash.
	 *
	 * @example
	 *
	 *     var hash = hasher.finalize();
	 *     var hash = hasher.finalize('message');
	 *     var hash = hasher.finalize(wordArray);
	 */
	finalize(messageUpdate) {
		// Final message update
		if (messageUpdate) {
		this._append(messageUpdate);
		}

		// Perform concrete-hasher logic
		const hash = this._doFinalize();

		return hash;
	}
}

/**
 * Algorithm namespace.
 * 
 * since we put all classes in one file, here we use IIFE to create namespace to avoid conflicts
 */
const algo = {};

//-------"crypto-js/hmac-sha256" and "crypto-js/sha256"------
/**
 * HMAC algorithm.
 */
(function (algo) {
	class HMAC extends Base {
		/**
		 * Initializes a newly created HMAC.
		 *
		 * @param {Hasher} SubHasher The hash algorithm to use.
		 * @param {WordArray|string} key The secret key.
		 *
		 * @example
		 *
		 *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
		 */
		constructor(SubHasher, key) {
			super();

			const hasher = new SubHasher();
			this._hasher = hasher;

			// Convert string to WordArray, else assume WordArray already
			let _key = key;
			if (typeof _key === 'string') {
			_key = Utf8.parse(_key);
			}

			// Shortcuts
			const hasherBlockSize = hasher.blockSize;
			const hasherBlockSizeBytes = hasherBlockSize * 4;

			// Allow arbitrary length keys
			if (_key.sigBytes > hasherBlockSizeBytes) {
			_key = hasher.finalize(key);
			}

			// Clamp excess bits
			_key.clamp();

			// Clone key for inner and outer pads
			const oKey = _key.clone();
			this._oKey = oKey;
			const iKey = _key.clone();
			this._iKey = iKey;

			// Shortcuts
			const oKeyWords = oKey.words;
			const iKeyWords = iKey.words;

			// XOR keys with pad constants
			for (let i = 0; i < hasherBlockSize; i += 1) {
			oKeyWords[i] ^= 0x5c5c5c5c;
			iKeyWords[i] ^= 0x36363636;
			}
			oKey.sigBytes = hasherBlockSizeBytes;
			iKey.sigBytes = hasherBlockSizeBytes;

			// Set initial values
			this.reset();
		}

		/**
		 * Resets this HMAC to its initial state.
		 *
		 * @example
		 *
		 *     hmacHasher.reset();
		 */
		reset() {
			// Shortcut
			const hasher = this._hasher;

			// Reset
			hasher.reset();
			hasher.update(this._iKey);
		}

		/**
		 * Updates this HMAC with a message.
		 *
		 * @param {WordArray|string} messageUpdate The message to append.
		 *
		 * @return {HMAC} This HMAC instance.
		 *
		 * @example
		 *
		 *     hmacHasher.update('message');
		 *     hmacHasher.update(wordArray);
		 */
		update(messageUpdate) {
			this._hasher.update(messageUpdate);

			// Chainable
			return this;
		}

		/**
		 * Finalizes the HMAC computation.
		 * Note that the finalize operation is effectively a destructive, read-once operation.
		 *
		 * @param {WordArray|string} messageUpdate (Optional) A final message update.
		 *
		 * @return {WordArray} The HMAC.
		 *
		 * @example
		 *
		 *     var hmac = hmacHasher.finalize();
		 *     var hmac = hmacHasher.finalize('message');
		 *     var hmac = hmacHasher.finalize(wordArray);
		 */
		finalize(messageUpdate) {
			// Shortcut
			const hasher = this._hasher;

			// Compute HMAC
			const innerHash = hasher.finalize(messageUpdate);
			hasher.reset();
			const hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

			return hmac;
		}
	}
	
	algo.HMAC = HMAC;
}(algo));


/**
 * SHA-256 hash algorithm.
 */
(function (algo) {

	// Initialization and round constants tables
	const H = [];
	const K = [];

	// Compute constants
	(function() {
		const isPrime = (n) => {
			const sqrtN = Math.sqrt(n);
			for (let factor = 2; factor <= sqrtN; factor += 1) {
			if (!(n % factor)) {
				return false;
			}
			}
		
			return true;
		};
	
		const getFractionalBits = n => ((n - (n | 0)) * 0x100000000) | 0;
		
		let n = 2;
		let nPrime = 0;
		while (nPrime < 64) {
			if (isPrime(n)) {
			if (nPrime < 8) {
				H[nPrime] = getFractionalBits(n ** (1 / 2));
			}
			K[nPrime] = getFractionalBits(n ** (1 / 3));
		
			nPrime += 1;
			}
		
			n += 1;
		}
	}());


	// Reusable object
	const W = [];

	/**
	 * SHA-256 hash algorithm.
	 */
	algo.SHA256 = class SHA256 extends Hasher {
		_doReset() {
			this._hash = new WordArray(H.slice(0));
		}

		_doProcessBlock(M, offset) {
			// Shortcut
			const _H = this._hash.words;

			// Working variables
			let a = _H[0];
			let b = _H[1];
			let c = _H[2];
			let d = _H[3];
			let e = _H[4];
			let f = _H[5];
			let g = _H[6];
			let h = _H[7];

			// Computation
			for (let i = 0; i < 64; i += 1) {
			if (i < 16) {
				W[i] = M[offset + i] | 0;
			} else {
				const gamma0x = W[i - 15];
				const gamma0 = ((gamma0x << 25) | (gamma0x >>> 7))
				^ ((gamma0x << 14) | (gamma0x >>> 18))
				^ (gamma0x >>> 3);

				const gamma1x = W[i - 2];
				const gamma1 = ((gamma1x << 15) | (gamma1x >>> 17))
				^ ((gamma1x << 13) | (gamma1x >>> 19))
				^ (gamma1x >>> 10);

				W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
			}

			const ch = (e & f) ^ (~e & g);
			const maj = (a & b) ^ (a & c) ^ (b & c);

			const sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
			const sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7) | (e >>> 25));

			const t1 = h + sigma1 + ch + K[i] + W[i];
			const t2 = sigma0 + maj;

			h = g;
			g = f;
			f = e;
			e = (d + t1) | 0;
			d = c;
			c = b;
			b = a;
			a = (t1 + t2) | 0;
			}

			// Intermediate hash value
			_H[0] = (_H[0] + a) | 0;
			_H[1] = (_H[1] + b) | 0;
			_H[2] = (_H[2] + c) | 0;
			_H[3] = (_H[3] + d) | 0;
			_H[4] = (_H[4] + e) | 0;
			_H[5] = (_H[5] + f) | 0;
			_H[6] = (_H[6] + g) | 0;
			_H[7] = (_H[7] + h) | 0;
		}

		_doFinalize() {
			// Shortcuts
			const data = this._data;
			const dataWords = data.words;

			const nBitsTotal = this._nDataBytes * 8;
			const nBitsLeft = data.sigBytes * 8;

			// Add padding
			dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32));
			dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
			dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
			data.sigBytes = dataWords.length * 4;

			// Hash final blocks
			this._process();

			// Return final computed hash
			return this._hash;
		}

		clone() {
			const clone = super.clone.call(this);
			clone._hash = this._hash.clone();

			return clone;
		}
	}
}(algo))

/**
 * Shortcut function to the hasher's object interface.
 *
 * @param {WordArray|string} message The message to hash.
 *
 * @return {WordArray} The hash.
 *
 * @static
 *
 * @example
 *
 *     var hash = CryptoJS.SHA256('message');
 *     var hash = CryptoJS.SHA256(wordArray);
 */
export const SHA256 = Hasher._createHelper(algo.SHA256);
/**
 * Shortcut function to the HMAC's object interface.
 *
 * @param {WordArray|string} message The message to hash.
 * @param {WordArray|string} key The secret key.
 *
 * @return {WordArray} The HMAC.
 *
 * @static
 *
 * @example
 *
 *     var hmac = CryptoJS.HmacSHA256(message, key);
 */
export const HmacSHA256 = Hasher._createHmacHelper(algo.SHA256);


//-------crypto-js/enc-base64------
/**
 * Base64 encoding strategy.
 */
export const Base64 = {
  /**
   * Converts a word array to a Base64 string.
   *
   * @param {WordArray} wordArray The word array.
   *
   * @return {string} The Base64 string.
   *
   * @static
   *
   * @example
   *
   *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
   */
  stringify(wordArray) {
    // Shortcuts
    const { words, sigBytes } = wordArray;
    const map = this._map;

    // Clamp excess bits
    wordArray.clamp();

    // Convert
    const base64Chars = [];
    for (let i = 0; i < sigBytes; i += 3) {
      const byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      const byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
      const byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

      const triplet = (byte1 << 16) | (byte2 << 8) | byte3;

      for (let j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j += 1) {
        base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
      }
    }

    // Add padding
    const paddingChar = map.charAt(64);
    if (paddingChar) {
      while (base64Chars.length % 4) {
        base64Chars.push(paddingChar);
      }
    }

    return base64Chars.join('');
  },

  /**
   * Converts a Base64 string to a word array.
   *
   * @param {string} base64Str The Base64 string.
   *
   * @return {WordArray} The word array.
   *
   * @static
   *
   * @example
   *
   *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
   */
  parse(base64Str) {
    // Shortcuts
    let base64StrLength = base64Str.length;
    const map = this._map;
    let reverseMap = this._reverseMap;

	// see https://github.com/brix/crypto-js/pull/71
    if (!reverseMap) {
      this._reverseMap = [];
      reverseMap = this._reverseMap;
      for (let j = 0; j < map.length; j += 1) {
        reverseMap[map.charCodeAt(j)] = j;
      }
    }

    // Ignore padding
    const paddingChar = map.charAt(64);
    if (paddingChar) {
      const paddingIndex = base64Str.indexOf(paddingChar);
      if (paddingIndex !== -1) {
        base64StrLength = paddingIndex;
      }
    }

    // Convert
	const words = [];
	let nBytes = 0;
	for (let i = 0; i < base64StrLength; i += 1) {
		if (i % 4) {
			const bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
			const bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
			const bitsCombined = bits1 | bits2;
			words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes % 4) * 8);
			nBytes += 1;
		}
	}
	return WordArray.create(words, nBytes);  
  },

  _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
};

// default export keep the same api interface as the original CryptoJS
// but we only expose the component required by amplify, to keep a clean dependency relationship
const CryptoJSHelper = {
	lib: {
		WordArray,
	},
	enc: {
		Base64,
	},
	HmacSHA256,
	SHA256,
}

export default CryptoJSHelper;