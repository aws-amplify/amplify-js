// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

/**
 * @internal
 */
export const resolveLibraryOptions = (amplify: AmplifyContext) => {
	const retryStrategy = amplify.libraryOptions?.API?.REST?.retryStrategy;
	const defaultAuthMode = amplify.libraryOptions?.API?.REST?.defaultAuthMode;

	return { retryStrategy, defaultAuthMode };
};
