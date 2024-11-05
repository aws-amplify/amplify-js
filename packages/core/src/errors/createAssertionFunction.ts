// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap, AssertionFunction } from '../types';

import { AmplifyError } from './AmplifyError';

export const createAssertionFunction =
	(
		errorMap: AmplifyErrorMap,
		AssertionError = AmplifyError,
	): AssertionFunction =>
	(assertion, name, additionalContext) => {
		const { message, recoverySuggestion } = errorMap[name];
		if (!assertion) {
			throw new AssertionError({
				name,
				message: additionalContext
					? `${message} ${additionalContext}`
					: message,
				recoverySuggestion,
			});
		}
	};
