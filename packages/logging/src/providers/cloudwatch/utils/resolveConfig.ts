// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	LoggingValidationErrorCode,
	assertValidationError,
} from '../../../errors';
import { CloudWatchConfiguration } from '../types/configuration';

// TODO: Remove when configuration is available
const configuration: CloudWatchConfiguration = {
	logGroupName: '<log-group-name>',
	region: '<region>',
	defaultRemoteConfiguration: {
		endpoint: '<api-endpoint>',
	},
};

/**
 * @internal
 */
export const resolveConfig = () => {
	// TODO: Resolve from configuration when available
	const { region } = configuration;
	assertValidationError(!!region, LoggingValidationErrorCode.NoRegion);

	return { region };
};
