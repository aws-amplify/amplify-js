// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AsyncStorageStatic } from '@react-native-async-storage/async-storage';

export const loadAsyncStorage = (): AsyncStorageStatic => {
	try {
		// metro bundler requires static string for loading module.
		// See: https://facebook.github.io/metro/docs/configuration/#dynamicdepsinpackages
		const module = require('@react-native-async-storage/async-storage')
			?.default as AsyncStorageStatic;
		if (module) {
			return module;
		}

		throw new Error(
			'Ensure `@react-native-async-storage/async-storage` is installed and linked.',
		);
	} catch (e) {
		// The error parsing logic cannot be extracted with metro as the `require`
		// would be confused when there is a `import` in the same file importing
		// another module and that causes an error
		const message = (e as Error).message.replace(
			/undefined/g,
			'@react-native-async-storage/async-storage',
		);
		throw new Error(message);
	}
};
