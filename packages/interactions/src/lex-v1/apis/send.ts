// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import { SendInput, SendOutput } from '../types';
import { resolveBotConfig } from '../utils';
import { lexProvider } from '../AWSLexProvider';
import {
	InteractionsValidationErrorCode,
	assertValidationError,
} from '../../errors';

export function send(
	ctx: AmplifyContext,
	input: SendInput,
): Promise<SendOutput>;

export function send(input: SendInput): Promise<SendOutput>;
export async function send(...args: any[]): Promise<SendOutput> {
	const [ctx, input] = resolveCtxArgs<[SendInput]>(args);
	const { botName, message } = input;
	const botConfig = resolveBotConfig(ctx, botName);
	assertValidationError(
		!!botConfig,
		InteractionsValidationErrorCode.NoBotConfig,
		`Bot ${botName} does not exist.`,
	);

	return lexProvider.sendMessage(ctx, botConfig, message);
}
