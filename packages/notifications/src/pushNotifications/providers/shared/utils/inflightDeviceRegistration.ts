// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PushNotificationError } from '../../../errors';
import {
	InflightDeviceRegistration,
	InflightDeviceRegistrationResolver,
} from '../types';

const inflightDeviceRegistrationResolver: InflightDeviceRegistrationResolver =
	{};

let inflightDeviceRegistration: InflightDeviceRegistration = new Promise<void>(
	(resolve, reject) => {
		inflightDeviceRegistrationResolver.resolve = resolve;
		inflightDeviceRegistrationResolver.reject = reject;
	},
);

export const getInflightDeviceRegistration = () => inflightDeviceRegistration;

export const resolveInflightDeviceRegistration = () => {
	inflightDeviceRegistrationResolver.resolve?.();
	// release promise from memory
	inflightDeviceRegistration = undefined;
};

export const rejectInflightDeviceRegistration = (underlyingError: unknown) => {
	inflightDeviceRegistrationResolver.reject?.(
		new PushNotificationError({
			name: 'DeviceRegistrationFailed',
			message: 'Failed to register device for push notifications.',
			underlyingError,
		}),
	);
	// release promise from memory
	inflightDeviceRegistration = undefined;
};
