// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import {
	amplifyUuid,
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';
import { lexProvider } from '../../../src/lex-v2/AWSLexV2Provider';
import { send } from '../../../src/lex-v2/apis';
import { generateRandomLexV2Config } from '../../testUtils/randomConfigGeneration';
import { resolveBotConfig } from '../../../src/lex-v2/utils';
import { InteractionsError } from '../../../src/errors/InteractionsError';

jest.mock('../../../src/lex-v2/AWSLexV2Provider');
jest.mock('../../../src/lex-v2/utils');

describe('Interactions LexV2 API: send', () => {
	const v2BotConfig = generateRandomLexV2Config();
	const mockCtx = createMockAmplifyContext();

	const mockLexProvider = lexProvider.sendMessage as jest.Mock;
	const mockResolveBotConfig = resolveBotConfig as jest.Mock;

	beforeAll(() => {
		setGlobalContext(mockCtx);
	});

	afterAll(() => {
		clearGlobalContext();
	});

	beforeEach(() => {
		mockResolveBotConfig.mockReturnValue(v2BotConfig);
	});

	afterEach(() => {
		mockLexProvider.mockReset();
		mockResolveBotConfig.mockReset();
	});

	it('invokes provider sendMessage API', async () => {
		const message = amplifyUuid();
		await send({ botName: v2BotConfig.name, message });
		expect(mockResolveBotConfig).toHaveBeenCalledWith(
			mockCtx,
			v2BotConfig.name,
		);
		expect(mockLexProvider).toHaveBeenCalledTimes(1);
		expect(mockLexProvider).toHaveBeenCalledWith(mockCtx, v2BotConfig, message);
	});

	it('invokes provider sendMessage API with explicit context', async () => {
		const explicitCtx = createMockAmplifyContext();
		const message = amplifyUuid();
		await send(explicitCtx, { botName: v2BotConfig.name, message });
		expect(mockResolveBotConfig).toHaveBeenCalledWith(
			explicitCtx,
			v2BotConfig.name,
		);
		expect(mockLexProvider).toHaveBeenCalledTimes(1);
		expect(mockLexProvider).toHaveBeenCalledWith(
			explicitCtx,
			v2BotConfig,
			message,
		);
	});

	it('rejects when bot config does not exist', async () => {
		mockResolveBotConfig.mockReturnValue(undefined);
		await expect(
			send({ botName: v2BotConfig.name, message: amplifyUuid() }),
		).rejects.toBeInstanceOf(InteractionsError);
	});

	it('throws on mis-ordered args (context not first)', async () => {
		const explicitCtx = createMockAmplifyContext();
		const sendUntyped = send as unknown as (
			...args: unknown[]
		) => Promise<unknown>;
		await expect(
			sendUntyped({ botName: v2BotConfig.name, message: 'hi' }, explicitCtx),
		).rejects.toThrow('AmplifyContext must be passed as the first argument');
		expect(mockLexProvider).not.toHaveBeenCalled();
	});
});
