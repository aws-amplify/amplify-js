// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { RetryOptions } from './middleware';
// TODO: remove this dependency in v6
import { jitteredBackoff as jitteredBackoffUtil } from '../../../Util/Retry';

const MAX_DELAY_MS = 5 * 60 * 1000;

export const jitteredBackoff: RetryOptions['computeDelay'] = attempt => {
	const delayFunction = jitteredBackoffUtil();
	const delay = delayFunction(attempt);
	return delay === false ? MAX_DELAY_MS : delay;
};
