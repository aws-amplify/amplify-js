// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	InteractionsMessage,
	InteractionsOnCompleteCallback,
} from './Interactions';

export interface InteractionsSendInput {
	botName: string;
	message: string | InteractionsMessage;
}

export interface InteractionsOnCompleteInput {
	botName: string;
	callback: InteractionsOnCompleteCallback;
}
