// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type InAppMessageInteractionEvent =
	| 'messageReceived'
	| 'messageDisplayed'
	| 'messageDismissed'
	| 'messageActionTaken';

export type InAppMessagingEvent = {
	name: string;
	attributes?: Record<string, string>;
	metrics?: Record<string, number>;
};
