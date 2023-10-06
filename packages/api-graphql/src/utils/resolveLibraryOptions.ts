// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';

/**
 * @internal
 */
export const resolveLibraryOptions = (amplify: AmplifyClassV6) => {
	const { headers, withCredentials } = amplify.libraryOptions?.API?.GraphQL;
	return { headers, withCredentials };
};
