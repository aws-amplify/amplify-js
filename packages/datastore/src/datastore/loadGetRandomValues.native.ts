// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// `uuid` v4 relies on `crypto.getRandomValues`, which is not available in the
// React Native runtime. `react-native-get-random-values` polyfills it as a
// side effect and must be loaded before `uuid` is used to mint model ids in
// `DataStore.save()`. See:
// https://github.com/uuidjs/uuid#getrandomvalues-not-supported
export const loadGetRandomValues = () => {
	try {
		// metro bundler requires a static string for loading the module.
		// See: https://facebook.github.io/metro/docs/configuration/#dynamicdepsinpackages
		require('react-native-get-random-values');
	} catch (e) {
		// Surface an actionable message instructing consumers to install the
		// peer dependency. The error message is rewritten because metro reports
		// the missing module as `undefined`.
		const message = (e as Error).message.replace(
			/undefined/g,
			'react-native-get-random-values',
		);
		throw new Error(message);
	}
};
