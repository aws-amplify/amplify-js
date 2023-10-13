// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type InteractionsTextMessage = {
	content: string;
	options: {
		messageType: 'text';
	};
};

export type InteractionsVoiceMessage = {
	content: object;
	options: {
		messageType: 'voice';
	};
};

export type InteractionsMessage =
	| InteractionsTextMessage
	| InteractionsVoiceMessage;
