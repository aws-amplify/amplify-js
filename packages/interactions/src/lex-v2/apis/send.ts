// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InteractionsMessage, InteractionsResponse } from '../../types';
import { lexProvider } from '../AWSLexV2Provider';
import { resolveBotConfig } from '../utils';
import {
	assertValidationError,
	InteractionsValidationErrorCode,
} from '../../errors';

export const send = async (
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
