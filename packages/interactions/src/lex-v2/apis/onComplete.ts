// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CompletionCallback } from '../../types';
import { resolveBotConfig } from '../utils';
import { lexProvider } from '../AWSLexV2Provider';
import {
	assertValidationError,
	InteractionsValidationErrorCode,
} from '../../errors';

export const onComplete = (
	botname: string,
	callback: CompletionCallback
): void => {
	const botConfig = resolveBotConfig(botname);
	assertValidationError(
		!!botConfig,
		InteractionsValidationErrorCode.NoBotConfig,
		`Bot ${botname} does not exist.`
	);
	lexProvider.onComplete(botConfig, callback);
};
