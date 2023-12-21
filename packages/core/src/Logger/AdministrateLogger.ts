// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '../singleton/Amplify';
import { LogParams } from './types';

export const administrateLogger = (params: LogParams) => {
	const loggers = Amplify.libraryOptions.Logger;
	if (loggers)
		Object.values(loggers.providers).forEach(logger => logger.log(params));
};
