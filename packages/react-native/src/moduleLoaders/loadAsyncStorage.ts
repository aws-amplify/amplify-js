// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AsyncStorageStatic } from '@react-native-async-storage/async-storage';

export const loadAsyncStorage = (): AsyncStorageStatic => {
	try {
		const module = require('@react-native-async-storage/async-storage')
			?.default as AsyncStorageStatic;
		if (module) {
			return module;
		}

		throw new Error(
			'Ensure `@react-native-async-storage/async-storage` is installed and linked.'
		);
	} catch (e) {
		const message = (e as Error).message.replace(
			/undefined/g,
			'@react-native-async-storage/async-storage'
		);
		throw new Error(message);
	}
};
