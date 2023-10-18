// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CompletionCallback } from '../../types';
import { resolveBotConfig } from '../utils';
import { lexProvider } from '../AWSLexProvider';
import {
	assertValidationError,
	InteractionsValidationErrorCode,
} from '../../errors';

export const onComplete = (
	botName: string,
	callback: CompletionCallback
): void => {
	const botConfig = resolveBotConfig(botName);
	assertValidationError(
		!!botConfig,
		InteractionsValidationErrorCode.NoBotConfig,
		`Bot ${botName} does not exist.`
	);
	lexProvider.onComplete(botConfig, callback);
};
