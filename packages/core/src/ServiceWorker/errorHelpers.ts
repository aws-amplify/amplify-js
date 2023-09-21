// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createAssertionFunction } from '../errors';
import { AmplifyErrorMap, AssertionFunction } from '../types';

export enum ServiceWorkerErrorCode {
	UndefinedInstance = 'UndefinedInstance',
	UndefinedRegistration = 'UndefinedRegistration',
	Unavailable = 'Unavailable',
}

const serviceWorkerErrorMap: AmplifyErrorMap<ServiceWorkerErrorCode> = {
	[ServiceWorkerErrorCode.UndefinedInstance]: {
		message: 'Service Worker instance is undefined.',
	},
	[ServiceWorkerErrorCode.UndefinedRegistration]: {
		message: 'Service Worker registration is undefined.',
	},
	[ServiceWorkerErrorCode.Unavailable]: {
		message: 'Service Worker not available.',
	},
};

export const assert: AssertionFunction<ServiceWorkerErrorCode> =
	createAssertionFunction(serviceWorkerErrorMap);
