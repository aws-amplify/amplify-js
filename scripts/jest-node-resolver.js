// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Custom Jest resolver for Jest 24 compatibility with `node:` protocol imports.
 *
 * Problem: @aws-sdk v3.982+ and @smithy packages use `node:` prefixed imports
 * (e.g., `require("node:stream")`). Jest 24 cannot resolve these.
 *
 * Additionally, Jest 24's ScriptTransformer calls `fs.statSync()` on resolved
 * paths to build cache keys. For Node built-in modules, `require.resolve("stream")`
 * returns just `"stream"` (not a file path), causing ENOENT when stat'd.
 *
 * Solution: For `node:X` imports, resolve to a shim file that re-exports the
 * built-in module. For known built-ins without a shim, resolve to __filename
 * (this file) as a stable path that exists on disk, satisfying the stat check.
 */
const path = require('path');
const fs = require('fs');

const SHIMS_DIR = path.join(__dirname, 'jest-shims');

module.exports = (request, options) => {
	if (request.startsWith('node:')) {
		const moduleName = request.slice(5); // e.g., "stream", "os", "fs/promises"

		// Check if we have a dedicated shim file
		const shimName = 'node-' + moduleName.replace(/\//g, '-') + '.js';
		const shimPath = path.join(SHIMS_DIR, shimName);
		if (fs.existsSync(shimPath)) {
			return shimPath;
		}

		// For any other node: built-in, create a shim on the fly
		// by writing it to the shims directory
		const shimContent =
			'// Auto-generated shim for node:' +
			moduleName +
			'\nmodule.exports = require("' +
			moduleName +
			'");\n';
		try {
			fs.writeFileSync(shimPath, shimContent);
		} catch (e) {
			// If we can't write, fall back to default resolution
			return options.defaultResolver(moduleName, options);
		}
		return shimPath;
	}
	return options.defaultResolver(request, options);
};
