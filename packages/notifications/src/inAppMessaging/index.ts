// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	identifyUser,
	syncMessages,
	dispatchEvent,
	setConflictHandler,
	initializeInAppMessaging,
	onMessageReceived,
	onMessageDisplayed,
	onMessageDismissed,
	onMessageActionTaken,
	notifyMessageInteraction,
	IdentifyUserInput,
	DispatchEventInput,
	SetConflictHandlerInput,
	OnMessageActionTakenInput,
	OnMessageDismissedInput,
	OnMessageDisplayedInput,
	OnMessageReceivedInput,
	NotifyMessageInteractionInput,
	OnMessageReceivedOutput,
	OnMessageActionTakenOutput,
	OnMessageDismissedOutput,
	OnMessageDisplayedOutput,
} from './providers/pinpoint';

export { InAppMessageInteractionEvent } from './types';
