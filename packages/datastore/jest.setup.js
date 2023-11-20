const crypto = require('crypto');

Object.defineProperty(globalThis, 'crypto', {
	value: {
		getRandomValues: arr => crypto.randomBytes(arr.length)
	}
});
