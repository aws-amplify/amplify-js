// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Platform, Dimensions } from 'react-native';
import { ConsoleLogger as Logger } from '../Logger';

const logger = new Logger('DeviceInfo');

export const clientInfo = () => {
	const dim = Dimensions.get('screen');
	logger.debug(Platform, dim);

	const OS = 'android';
	const { Version } = Platform;

	return {
		platform: OS,
		version: String(Version),
		appVersion: [OS, String(Version)].join('/'),
	};
};
