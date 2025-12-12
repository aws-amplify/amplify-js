// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AmplifyRtnAsfModule } from '@aws-amplify/rtn-asf';

export const loadAmplifyRtnAsf = (): AmplifyRtnAsfModule | undefined => {
	try {
		// metro bundler requires static string for loading module.
		// See: https://facebook.github.io/metro/docs/configuration/#dynamicdepsinpackages
		const module = require('@aws-amplify/rtn-asf')?.module;

		return module as AmplifyRtnAsfModule | undefined;
	} catch {
		return undefined;
	}
};
