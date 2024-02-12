// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloneDeep } from "lodash";
import { InAppMessageCampaign, OverrideButtonConfiguration } from "@aws-amplify/core/internals/aws-clients/pinpoint";
import { InAppMessageButton, InAppMessageContent } from "../../src/inAppMessaging/types/message";
import { mapOSPlatform } from "../../src/inAppMessaging/providers/pinpoint/utils/helpers";

export const mergeInAppMessageWithOverrides:(
	pinpointInAppMessage:InAppMessageCampaign,
	platform:'android'|'ios'|'web',
	buttonOverrides?:{
		primaryButton:OverrideButtonConfiguration,
		secondaryButton:OverrideButtonConfiguration
	}
 ) =>InAppMessageCampaign = (pinpointInAppMessage, platform, buttonOverrides)=>{
	const message= cloneDeep(pinpointInAppMessage);
	const configPlatform = mapOSPlatform(platform);
	if (message?.InAppMessage?.Content) {
		message.InAppMessage.Content[0] = {
			...message.InAppMessage.Content[0],
			PrimaryBtn:{
				...message.InAppMessage.Content[0].PrimaryBtn,
				[configPlatform]:buttonOverrides?.primaryButton
			},
			SecondaryBtn:{
				...message.InAppMessage.Content[0].SecondaryBtn,
				[configPlatform]:buttonOverrides?.secondaryButton
			}
		} 
	}
	return message
}

export const mergeExpectedContentWithExpectedOverride:(
	inAppMessage:InAppMessageContent,
	expectedButtonConfig: {
		primaryButton:OverrideButtonConfiguration,
		secondaryButton:OverrideButtonConfiguration
	}
)=>InAppMessageContent = (inAppMessage, expectedButtonConfig)=>{
	let expectedContent = cloneDeep(inAppMessage);
	if (expectedContent) {
		expectedContent.primaryButton = {
			...expectedContent.primaryButton,
			action:expectedButtonConfig.primaryButton.ButtonAction,
			url:expectedButtonConfig.primaryButton.Link
		} as InAppMessageButton
		expectedContent.secondaryButton = {
			...expectedContent.secondaryButton,
			action:expectedButtonConfig.secondaryButton.ButtonAction,
			url:expectedButtonConfig.secondaryButton.Link
		} as InAppMessageButton
	}
	return expectedContent
}