// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Platform } from 'react-native';
import { clientInfo as iOSClientInfo } from './ios';
import { clientInfo as androidClientInfo } from './android';

const { OS } = Platform;

export class ClientDevice {
	static clientInfo() {
		if (OS === 'ios') {
			return iOSClientInfo();
		} else {
			return androidClientInfo();
		}
	}
}
