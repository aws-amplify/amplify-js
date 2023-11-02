// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import path from 'node:path';
import * as glob from 'glob';

/**
 * Return a map that contains relative file path <-> absolute file path.
 * @param {string} matcher The glob matcher
 * @param {{ ignore?: string[] }?} options The glob options
 * @returns {object} A key value object.
 */
export const getInputForGlob = (matcher, { ignore } = {}) =>
	Object.fromEntries(
		glob
			.sync(matcher, {
				ignore: ['src/**/global.d.ts', ...(ignore ?? [])],
			})
			.map(file => [
				// This remove `src/` as well as the file extension from each
				// file, so e.g. src/nested/foo.js becomes nested/foo
				path.relative(
					'src',
					file.slice(0, file.length - path.extname(file).length)
				),
				// This expands the relative paths to absolute paths, so e.g.
				// src/nested/foo becomes /<root>/packages/<package-name>src/nested/foo.js
				path.resolve(path.resolve('.'), file),
			])
	);
