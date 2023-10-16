// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InteractionsMessage, InteractionsResponse } from '../../types';
import { resolveBotConfig } from '../utils';
import { lexProvider } from '../AWSLexProvider';
import {
	assertValidationError,
	InteractionsValidationErrorCode,
} from '../../errors';

export const sendMessage = async (
	botName: string,
	message: string | InteractionsMessage
): Promise<InteractionsResponse> => {
	const botConfig = resolveBotConfig(botName);
	assertValidationError(
		!!botConfig,
		InteractionsValidationErrorCode.NoBotConfig,
		`Bot ${botName} does not exist.`
	);
	return lexProvider.sendMessage(botConfig, message);
};
