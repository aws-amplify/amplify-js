// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';
import { InitializePushNotifications } from '../types';

export const initializePushNotifications: InitializePushNotifications = () => {
	throw new PlatformNotSupportedError();
};
