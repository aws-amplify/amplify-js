// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { getRetryDecider } from '@aws-amplify/core/internals/aws-client-utils';
import { RetryDecider, RetryStrategy } from '@aws-amplify/core/internals/utils';

import { parseRestApiServiceError } from '../../utils';

/**
 * For a given retry strategy, returns the corresponding retry decider
 * @internal
 */
export const getRetryDeciderForStrategy = (
	retryStrategy?: RetryStrategy,
): RetryDecider => {
	switch (retryStrategy?.strategy) {
		case 'no-retry': {
			return () => Promise.resolve({ retryable: false });
		}
		case 'custom': {
			return retryStrategy.retryDecider;
		}
		default: {
			return getRetryDecider(parseRestApiServiceError);
		}
	}
};
