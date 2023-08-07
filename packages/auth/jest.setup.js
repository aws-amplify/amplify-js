// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
if (
	typeof globalThis.TextEncoder === 'undefined' ||
	typeof globalThis.TextDecoder === 'undefined'
) {
	const utils = require('util');
	globalThis.TextEncoder = utils.TextEncoder;
	globalThis.TextDecoder = utils.TextDecoder;
}

const crypto = require('crypto');

Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length)
  }
});
