// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @type {import('@react-native-community/cli-types').UserDependencyConfig}
 */
module.exports = {
	dependency: {
		platforms: {
			android: {
				cmakeListsPath: 'generated/jni/CMakeLists.txt',
			},
		},
	},
};
