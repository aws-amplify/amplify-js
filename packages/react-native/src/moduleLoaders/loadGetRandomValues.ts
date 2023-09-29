// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const loadGetRandomValues = () => {
	try {
		require('react-native-get-random-values');
	} catch (e) {
		const message = (e as Error).message.replace(
			/undefined/g,
			'@react-native-community/netinfo'
		);
		throw new Error(message);
	}
};
