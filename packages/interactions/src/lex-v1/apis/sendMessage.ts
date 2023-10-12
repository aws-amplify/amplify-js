// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InteractionsMessage, InteractionsResponse } from '../../types';
import { resolveConfig } from '../utils';
import { lexProvider } from '../AWSLexProvider';

export const sendMessage = (
	botname: string,
	message: string | InteractionsMessage
): Promise<InteractionsResponse> => {
	const botConfig = resolveConfig(botname);
	if (!botConfig) {
		return Promise.reject(`Bot ${botname} does not exist.`);
	}
	return lexProvider.sendMessage(botConfig, message);
};
