// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(eslint): remove this linter suppression.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: missing type definition
import { Dimensions, Platform } from 'react-native';
import { ConsoleLogger } from '~/src/Logger';

const logger = new ConsoleLogger('getClientInfo');

export const getClientInfo = () => {
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
