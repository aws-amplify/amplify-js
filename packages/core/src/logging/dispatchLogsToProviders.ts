// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '../singleton/Amplify';
import { LogParams } from './types';
import { logToConsole } from './console';

export const dispatchLogsToProviders = (params: LogParams) => {
	const { additionalProviders = [] } = Amplify.libraryOptions.Logging ?? {};
	logToConsole(params);
	additionalProviders.forEach(logger => logger.log(params));
};
