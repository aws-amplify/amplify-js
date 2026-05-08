// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import { SendInput, SendOutput } from '../types';
import { createLexV2Provider } from '../AWSLexV2Provider';
import { resolveBotConfig } from '../utils';
import {
	InteractionsValidationErrorCode,
	assertValidationError,
} from '../../errors';

export async function send(input: SendInput): Promise<SendOutput>;
export async function send(
	ctx: AmplifyContext,
	input: SendInput,
): Promise<SendOutput>;
export async function send(...args: any[]): Promise<SendOutput> {
	const [ctx, input] = resolveCtxArgs<SendInput>(args);
	const { botName, message } = input;
	const botConfig = resolveBotConfig(ctx, botName);
	assertValidationError(
		!!botConfig,
		InteractionsValidationErrorCode.NoBotConfig,
		`Bot ${botName} does not exist.`,
	);

	return createLexV2Provider(ctx).sendMessage(botConfig, message);
}
