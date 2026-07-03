// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Shared Jest setup for packages that exercise the modern @aws-sdk/@smithy client
// runtime under the jsdom test environment. jsdom does not expose
// TextEncoder/TextDecoder as globals, but the SDK (e.g. @smithy/core's cbor
// submodule) references them at module-load time. Polyfill from Node's `util`.
const { TextEncoder, TextDecoder } = require('util');

if (typeof global.TextEncoder === 'undefined') {
	global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
	global.TextDecoder = TextDecoder;
}
