// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PushNotificationIdentifyUserInput } from '../../../types';

import { IdentifyUserOptions } from './options';

export {
	OnNotificationOpenedInput,
	OnNotificationReceivedInBackgroundInput,
	OnNotificationReceivedInForegroundInput,
	OnTokenReceivedInput,
	RequestPermissionsInput,
	SetBadgeCountInput,
} from '../../shared/types';

export type IdentifyUserInput =
	PushNotificationIdentifyUserInput<IdentifyUserOptions>;
