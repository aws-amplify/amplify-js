// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { updateEndpoint } from '@aws-amplify/core/internals/providers/pinpoint';

import { PushNotificationError } from '../../../errors';

export type ChannelType = Parameters<typeof updateEndpoint>[0]['channelType'];

export type InflightDeviceRegistration = Promise<void> | undefined;

export interface InflightDeviceRegistrationResolver {
	resolve?(): void;
	reject?(error: PushNotificationError): void;
}
