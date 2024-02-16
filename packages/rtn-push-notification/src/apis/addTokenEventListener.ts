// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EmitterSubscription } from 'react-native';
import { nativeEventEmitter } from '../nativeModule';
import { TokenPayload } from '../types';

export const addTokenEventListener = (
	event: string,
	listener: (token: string) => void,
): EmitterSubscription =>
	nativeEventEmitter.addListener(event, ({ token }: TokenPayload) => {
		listener(token);
	});
