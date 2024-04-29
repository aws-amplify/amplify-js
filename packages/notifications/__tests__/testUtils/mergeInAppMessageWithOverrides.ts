// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloneDeep } from 'lodash';
import {
	InAppMessageCampaign,
	OverrideButtonConfiguration,
} from '@aws-amplify/core/internals/aws-clients/pinpoint';
import {
	ButtonConfigPlatform,
	InAppMessageButton,
	InAppMessageContent,
} from '../../src/inAppMessaging/types/message';

export const mergeInAppMessageWithOverrides = (
	pinpointInAppMessage: InAppMessageCampaign,
	mappedPlatform: ButtonConfigPlatform,
	buttonOverrides?: {
		primaryButton: OverrideButtonConfiguration;
		secondaryButton: OverrideButtonConfiguration;
	},
): InAppMessageCampaign => {
	const message = cloneDeep(pinpointInAppMessage);
	if (message?.InAppMessage?.Content) {
		message.InAppMessage.Content[0] = {
			...message.InAppMessage.Content[0],
			PrimaryBtn: {
				...message.InAppMessage.Content[0].PrimaryBtn,
				[mappedPlatform]: buttonOverrides?.primaryButton,
			},
			SecondaryBtn: {
				...message.InAppMessage.Content[0].SecondaryBtn,
				[mappedPlatform]: buttonOverrides?.secondaryButton,
			},
		};
	}
	return message;
};

export const mergeExpectedContentWithExpectedOverride = (
	inAppMessage: InAppMessageContent,
	expectedButtonConfig: {
		primaryButton: OverrideButtonConfiguration;
		secondaryButton: OverrideButtonConfiguration;
	},
): InAppMessageContent => {
	let expectedContent = cloneDeep(inAppMessage);
	expectedContent.primaryButton = {
		...expectedContent.primaryButton,
		action: expectedButtonConfig.primaryButton.ButtonAction,
		url: expectedButtonConfig.primaryButton.Link,
	} as InAppMessageButton;
	expectedContent.secondaryButton = {
		...expectedContent.secondaryButton,
		action: expectedButtonConfig.secondaryButton.ButtonAction,
		url: expectedButtonConfig.secondaryButton.Link,
	} as InAppMessageButton;
	return expectedContent;
};