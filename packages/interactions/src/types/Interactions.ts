// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CompletionCallback, InteractionsResponse } from './Response';

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

export interface IInteractions {
	send(
		botName: string,
		message: string | InteractionsMessage
	): Promise<InteractionsResponse>;
	onComplete(botName: string, callback: CompletionCallback): void;
}
