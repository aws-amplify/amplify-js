// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type NetInfo from '@react-native-community/netinfo';

type NetInfoModule = typeof NetInfo;

export const loadNetInfo = (): NetInfoModule => {
	try {
		const module = require('@react-native-community/netinfo')
			?.default as NetInfoModule;
		if (module) {
			return module;
		}

		throw new Error(
			'Ensure `@react-native-community/netinfo` is installed and linked.'
		);
	} catch (e) {
		const message = (e as Error).message.replace(
			/undefined/g,
			'@react-native-community/netinfo'
		);
		throw new Error(message);
	}
};
