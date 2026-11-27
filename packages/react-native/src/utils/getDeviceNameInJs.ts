// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Platform } from 'react-native';

import { RTNCore } from '../types';

/**
 * JavaScript equivalent of the native `getDeviceName`, used when the native
 * module is not linked. Mirrors the native behavior as closely as the
 * JavaScript APIs allow: the device model on Android (`Build.MODEL`), and the
 * generic device name iOS reports to apps without the user-assigned device
 * name entitlement.
 *
 * @internal
 */
export const getDeviceNameInJs: RTNCore['getDeviceName'] = async () => {
	if (Platform.OS === 'ios') {
		return (Platform as { isPad?: boolean }).isPad ? 'iPad' : 'iPhone';
	}

	const model = (Platform.constants as Record<string, unknown> | undefined)
		?.Model;

	return typeof model === 'string' && model ? model : Platform.OS;
};
