// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	amplifyUuid,
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';
import { lexProvider } from '../../../src/lex-v1/AWSLexProvider';
import { send } from '../../../src/lex-v1/apis';
import { generateRandomLexV1Config } from '../../testUtils/randomConfigGeneration';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';
import { resolveBotConfig } from '../../../src/lex-v1/utils';
import { InteractionsError } from '../../../src/errors/InteractionsError';

jest.mock('../../../src/lex-v1/AWSLexProvider');
jest.mock('../../../src/lex-v1/utils');

describe('Interactions LexV1 API: send', () => {
	const v1BotConfig = generateRandomLexV1Config();
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
		mockResolveBotConfig.mockReturnValue(v1BotConfig);
	});

	afterEach(() => {
		mockLexProvider.mockReset();
		mockResolveBotConfig.mockReset();
	});

	it('invokes provider sendMessage API', async () => {
		const message = amplifyUuid();
		await send({ botName: v1BotConfig.name, message });
		expect(mockResolveBotConfig).toHaveBeenCalledWith(
			mockCtx,
			v1BotConfig.name,
		);
		expect(mockLexProvider).toHaveBeenCalledTimes(1);
		expect(mockLexProvider).toHaveBeenCalledWith(mockCtx, v1BotConfig, message);
	});

	it('invokes provider sendMessage API with explicit context', async () => {
		const explicitCtx = createMockAmplifyContext();
		const message = amplifyUuid();
		await send(explicitCtx, { botName: v1BotConfig.name, message });
		expect(mockResolveBotConfig).toHaveBeenCalledWith(
			explicitCtx,
			v1BotConfig.name,
		);
		expect(mockLexProvider).toHaveBeenCalledTimes(1);
		expect(mockLexProvider).toHaveBeenCalledWith(
			explicitCtx,
			v1BotConfig,
			message,
		);
	});

	it('rejects when bot config does not exist', async () => {
		mockResolveBotConfig.mockReturnValue(undefined);
		await expect(
			send({ botName: v1BotConfig.name, message: amplifyUuid() }),
		).rejects.toBeInstanceOf(InteractionsError);
	});

	it('throws on mis-ordered args (context not first)', async () => {
		const explicitCtx = createMockAmplifyContext();
		const sendUntyped = send as unknown as (
			...args: unknown[]
		) => Promise<unknown>;
		await expect(
			sendUntyped({ botName: v1BotConfig.name, message: 'hi' }, explicitCtx),
		).rejects.toThrow('AmplifyContext must be passed as the first argument');
		expect(mockLexProvider).not.toHaveBeenCalled();
	});
});
