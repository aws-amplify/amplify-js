// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

/**
 * @internal
 */
export const resolveLibraryOptions = (amplify: AmplifyContext) => {
	const headers = amplify.libraryOptions?.API?.GraphQL?.headers;
	const withCredentials = amplify.libraryOptions?.API?.GraphQL?.withCredentials;

	return { headers, withCredentials };
};
