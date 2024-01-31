// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '../singleton/Amplify';
import { LogParams } from './types';
import { logToConsole } from './console';

// Todo(ashwinkumar6): this is meant to internal logs, add wrapper for external logs
export const dispatchLogsToProviders = (params: LogParams) => {
	const { additionalProviders = [] } = Amplify.libraryOptions.Logging ?? {};
	logToConsole(params);
	additionalProviders.forEach(logger => logger.log(params));
};
