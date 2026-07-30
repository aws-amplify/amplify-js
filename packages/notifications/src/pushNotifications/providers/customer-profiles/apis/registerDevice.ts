// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';

import { RegisterDevice } from '../types';

/**
 * Registers a push device with Amazon Connect Customer Profiles.
 *
 * @throws platform: {@link PlatformNotSupportedError} - Thrown if called against
 *  an unsupported platform. Currently, only React Native is supported by this
 *  API.
 */
export const registerDevice: RegisterDevice = () => {
	throw new PlatformNotSupportedError();
};
