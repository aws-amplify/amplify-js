// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SendInput, SendOutput } from '~/src/lex-v1/types';
import { resolveBotConfig } from '~/src/lex-v1/utils';
import { lexProvider } from '~/src/lex-v1/AWSLexProvider';
import {
	InteractionsValidationErrorCode,
	assertValidationError,
} from '~/src/errors';

export const send = async (input: SendInput): Promise<SendOutput> => {
	const { botName, message } = input;
	const botConfig = resolveBotConfig(botName);
	assertValidationError(
		!!botConfig,
		InteractionsValidationErrorCode.NoBotConfig,
		`Bot ${botName} does not exist.`,
	);

	return lexProvider.sendMessage(botConfig, message);
};
