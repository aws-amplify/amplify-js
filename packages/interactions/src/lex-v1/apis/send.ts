
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

import { SendInput, SendOutput } from '../types';
import { resolveBotConfig } from '../utils';
import { createLexProvider } from '../AWSLexProvider';
import {
	InteractionsValidationErrorCode,
	assertValidationError,
} from '../../errors';

export const send = async (ctx: AmplifyContext, input: SendInput): Promise<SendOutput> => {
	const { botName, message } = input;
	const botConfig = resolveBotConfig(ctx, botName);
	assertValidationError(
		!!botConfig,
		InteractionsValidationErrorCode.NoBotConfig,
		`Bot ${botName} does not exist.`,
	);

	return createLexProvider(ctx).sendMessage(botConfig, message);
};
