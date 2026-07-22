// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';

import { RemoveDevice } from '../types';

/**
 * De-registers the current push device from Amazon Connect Customer Profiles.
 *
 * @throws platform: {@link PlatformNotSupportedError} - Thrown if called against
 *  an unsupported platform. Currently, only React Native is supported by this
 *  API.
 */
export const removeDevice: RemoveDevice = () => {
	throw new PlatformNotSupportedError();
};
