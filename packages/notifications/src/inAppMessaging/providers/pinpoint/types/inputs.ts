// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { IdentifyUserOptions } from './options';
import {
	InAppMessageConflictHandler,
	OnMessageInteractionEventHandler,
} from './types';
import {
	InAppMessage,
	InAppMessageInteractionEvent,
	InAppMessagingEvent,
	InAppMessagingIdentifyUserInput,
} from '../../../types';

/**
 * Input type for Pinpoint identifyUser API.
 */
export type IdentifyUserInput =
	InAppMessagingIdentifyUserInput<IdentifyUserOptions>;

/**
 * Input type for Pinpoint dispatchEvent API.
 */
export type DispatchEventInput = InAppMessagingEvent;

/**
 * Input type for Pinpoint SetConflictHandler API.
 */
export type SetConflictHandlerInput = InAppMessageConflictHandler;

/**
 * Input type for OnMessageReceived API.
 */
export type OnMessageReceivedInput = OnMessageInteractionEventHandler;

/**
 * Input type for OnMessageDisplayed API.
 */
export type OnMessageDisplayedInput = OnMessageInteractionEventHandler;

/**
 * Input type for OnMessageDismissed API.
 */
export type OnMessageDismissedInput = OnMessageInteractionEventHandler;

/**
 * Input type for OnMessageActionTaken API.
 */
export type OnMessageActionTakenInput = OnMessageInteractionEventHandler;

/**
 * Input type for NotifyMessageInteraction API.
 */
export type NotifyMessageInteractionInput = {
	message: InAppMessage;
	type: InAppMessageInteractionEvent;
};
