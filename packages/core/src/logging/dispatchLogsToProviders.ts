// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '../singleton/Amplify';
import { LogParams } from './types';

export const dispatchLogsToProviders = (params: LogParams) => {
	const { console: consoleProvider, additionalProviders = [] } =
		Amplify.libraryOptions.Logging ?? {};

	// send log to console provider
	if (consoleProvider) consoleProvider.log(params);

	// send log to Additional Providers
	Object.values(additionalProviders).forEach(logger => logger.log(params));
};
