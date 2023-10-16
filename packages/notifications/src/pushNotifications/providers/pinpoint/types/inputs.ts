// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { IdentifyUserOptions } from '.';
import { PushNotificationIdentifyUserInput } from '../../../types';

/**
 * Input type for Pinpoint identifyUser API.
 */
export type IdentifyUserInput =
	PushNotificationIdentifyUserInput<IdentifyUserOptions>;
