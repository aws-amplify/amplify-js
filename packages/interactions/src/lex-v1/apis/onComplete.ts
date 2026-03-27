
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

import { OnCompleteInput } from '../types';
import { resolveBotConfig } from '../utils';
import { createLexProvider } from '../AWSLexProvider';
import {
	InteractionsValidationErrorCode,
	assertValidationError,
} from '../../errors';

export const onComplete = (ctx: AmplifyContext, input: OnCompleteInput): void => {
	const { botName, callback } = input;
	const botConfig = resolveBotConfig(ctx, botName);
	assertValidationError(
		!!botConfig,
		InteractionsValidationErrorCode.NoBotConfig,
		`Bot ${botName} does not exist.`,
	);
	createLexProvider(ctx).onComplete(botConfig, callback);
};
