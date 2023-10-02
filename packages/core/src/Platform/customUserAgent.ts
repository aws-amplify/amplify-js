// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CategoryUserAgentStateMap,
	CustomUserAgentStateMap,
	SetCustomUserAgentInput,
} from './types';

// Maintains custom user-agent state set by external consumers.
const customUserAgentState: CustomUserAgentStateMap = {};

/**
 * Sets custom user agent state which will be appended to applicable requests. Returns a function that can be used to
 * clean up any custom state set with this API.
 *
 * @note
 * This API operates globally. Calling this API multiple times will result in the most recently set values for a
 * particular API being used.
 *
 * @note
 * This utility IS NOT compatible with SSR.
 *
 * @param input - SetCustomUserAgentInput that defines custom state to apply to the specified APIs.
 */
export const setCustomUserAgent = (
	input: SetCustomUserAgentInput
): (() => void) => {
	// Save custom user-agent state & increment reference counter
	customUserAgentState[input.category] = Object.assign(
		customUserAgentState[input.category] || {},
		input.apis.reduce<CategoryUserAgentStateMap>(
			(acc, api) => ({
				...acc,
				[api]: {
					refCount: acc[api].refCount ? acc[api].refCount + 1 : 1,
					additionalDetails: input.additionalDetails,
				},
			}),
			{}
		)
	);

	// Callback that cleans up state for APIs recorded by this call
	const cleanUpCallback = () => {
		input.apis.forEach(api => {
			const apiRefCount = customUserAgentState[input.category][api].refCount;

			if (apiRefCount > 1) {
				customUserAgentState[input.category][api].refCount = apiRefCount - 1;
			} else {
				delete customUserAgentState[input.category][api];

				// Clean up category if no more APIs set
				if (!Object.keys(customUserAgentState[input.category]).length) {
					delete customUserAgentState[input.category];
				}
			}
		});
	};

	return cleanUpCallback;
};
