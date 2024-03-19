// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface InteractionsTextMessage {
	content: string;
	options: {
		messageType: 'text';
	};
}

export interface InteractionsVoiceMessage {
	content: object;
	options: {
		messageType: 'voice';
	};
}

export type InteractionsMessage =
	| InteractionsTextMessage
	| InteractionsVoiceMessage;

export type InteractionsOnCompleteCallback = (
	error?: Error,
	completion?: InteractionsResponse,
) => void;

export type InteractionsResponse = Record<string, any>;
