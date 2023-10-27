// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PushNotificationAction } from '@aws-amplify/core/internals/utils';
import { updateEndpoint } from '@aws-amplify/core/internals/providers/pinpoint';
import { assertIsInitialized } from '../../../errors/errorHelpers';
import {
	getPushNotificationUserAgentString,
	resolveCredentials,
} from '../../../utils';
import { getChannelType, resolveConfig } from '../utils';
import { IdentifyUser } from '../types';

export const identifyUser: IdentifyUser = async ({
	userId,
	userProfile,
	options,
}) => {
	assertIsInitialized();
	const { credentials, identityId } = await resolveCredentials();
	const { appId, region } = resolveConfig();
	const { address, optOut, userAttributes } = options ?? {};
	updateEndpoint({
		address,
		channelType: getChannelType(),
		optOut,
		appId,
		category: 'PushNotification',
		credentials,
		identityId,
		region,
		userAttributes,
		userId,
		userProfile,
		userAgentValue: getPushNotificationUserAgentString(
			PushNotificationAction.IdentifyUser
		),
	});
};
