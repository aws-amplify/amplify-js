// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HubCapsule, ResourcesConfig } from '@aws-amplify/core';

export function isConfigureEventWithResourceConfig(
	payload: HubCapsule<'core', { event: string; data?: unknown }>['payload'],
): payload is {
	event: 'configure';
	data: ResourcesConfig;
} {
	return payload.event === 'configure';
}
