if (
	typeof globalThis.TextEncoder === 'undefined' ||
	typeof globalThis.TextDecoder === 'undefined'
) {
	const utils = require('util');
	globalThis.TextEncoder = utils.TextEncoder;
	globalThis.TextDecoder = utils.TextDecoder;
}
