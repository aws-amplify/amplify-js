// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import { OnCompleteInput } from '../types';
import { resolveBotConfig } from '../utils';
import { lexProvider } from '../AWSLexV2Provider';
import {
	InteractionsValidationErrorCode,
	assertValidationError,
} from '../../errors';

export function onComplete(ctx: AmplifyContext, input: OnCompleteInput): void;

export function onComplete(input: OnCompleteInput): void;
export function onComplete(...args: any[]): void {
	const [ctx, input] = resolveCtxArgs<[OnCompleteInput]>(args);
	const { botName, callback } = input;
	const botConfig = resolveBotConfig(ctx, botName);
	assertValidationError(
		!!botConfig,
		InteractionsValidationErrorCode.NoBotConfig,
		`Bot ${botName} does not exist.`,
	);
	lexProvider.onComplete(ctx, botConfig, callback);
}
