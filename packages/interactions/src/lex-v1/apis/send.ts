// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SendInput, SendOutput } from '../types';
import { resolveBotConfig } from '../utils';
import { lexProvider } from '../AWSLexProvider';
import {
	assertValidationError,
	InteractionsValidationErrorCode,
} from '../../errors';

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
