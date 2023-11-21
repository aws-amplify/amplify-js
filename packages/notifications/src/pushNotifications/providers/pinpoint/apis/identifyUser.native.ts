// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PushNotificationAction } from '@aws-amplify/core/internals/utils';
import { updateEndpoint } from '@aws-amplify/core/internals/providers/pinpoint';
import { assertIsInitialized } from '~/src/pushNotifications/errors/errorHelpers';
import {
	getPushNotificationUserAgentString,
	resolveCredentials,
} from '~/src/pushNotifications/utils';
import {
	getChannelType,
	resolveConfig,
} from '~/src/pushNotifications/providers/pinpoint/utils';
import { IdentifyUser } from '~/src/pushNotifications/providers/pinpoint/types';

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
			PushNotificationAction.IdentifyUser,
		),
	});
};
