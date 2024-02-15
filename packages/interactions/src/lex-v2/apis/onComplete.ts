// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { OnCompleteInput } from '../types';
import { resolveBotConfig } from '../utils';
import { lexProvider } from '../AWSLexV2Provider';
import {
	assertValidationError,
	InteractionsValidationErrorCode,
} from '../../errors';

export const onComplete = (input: OnCompleteInput): void => {
	const { botName, callback } = input;
	const botConfig = resolveBotConfig(botName);
	assertValidationError(
		!!botConfig,
		InteractionsValidationErrorCode.NoBotConfig,
		`Bot ${botName} does not exist.`,
	);
	lexProvider.onComplete(botConfig, callback);
};
