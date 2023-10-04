// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

/**
 * @internal
 */
export const resolveLibraryOptions = () => {
	const headers = Amplify.libraryOptions?.API?.GraphQL?.headers;
	return { headers };
};
