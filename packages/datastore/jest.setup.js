// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// jest-environment-jsdom 29 no longer exposes Node's `setImmediate`/`clearImmediate`
// on the global. fake-indexeddb 3.0.0 schedules its transaction state machine via
// `setImmediate` (through the `setimmediate` polyfill it depends on). Without Node's
// native implementation present, the polyfill installs a `postMessage`/`setTimeout`
// based fallback whose ordering relative to promise microtasks differs, causing
// IndexedDB transactions to auto-commit before awaited continuations issue their next
// request (`InvalidStateError`). Restoring Node's real timers makes the polyfill a
// no-op, matching the pre-upgrade environment. Behavior-preserving test-env shim only.
const timers = require('timers');

if (typeof global.setImmediate === 'undefined') {
	global.setImmediate = timers.setImmediate;
}

if (typeof global.clearImmediate === 'undefined') {
	global.clearImmediate = timers.clearImmediate;
}
