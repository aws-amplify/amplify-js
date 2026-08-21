// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';
import { lexProvider } from '../../../src/lex-v2/AWSLexV2Provider';
import { onComplete } from '../../../src/lex-v2/apis';
import { generateRandomLexV2Config } from '../../testUtils/randomConfigGeneration';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';
import { resolveBotConfig } from '../../../src/lex-v2/utils';
import { InteractionsError } from '../../../src/errors/InteractionsError';

jest.mock('../../../src/lex-v2/AWSLexV2Provider');
jest.mock('../../../src/lex-v2/utils');

describe('Interactions LexV2 API: onComplete', () => {
	const v2BotConfig = generateRandomLexV2Config();
	const mockCtx = createMockAmplifyContext();

	const mockLexProvider = lexProvider.onComplete as jest.Mock;
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

	it('invokes provider onComplete API', () => {
		const mockCallback = jest.fn();
		onComplete({ botName: v2BotConfig.name, callback: mockCallback });
		expect(mockResolveBotConfig).toHaveBeenCalledWith(
			mockCtx,
			v2BotConfig.name,
		);
		expect(mockLexProvider).toHaveBeenCalledTimes(1);
		expect(mockLexProvider).toHaveBeenCalledWith(v2BotConfig, mockCallback);
	});

	it('invokes provider onComplete API with explicit context', () => {
		const explicitCtx = createMockAmplifyContext();
		const mockCallback = jest.fn();
		onComplete(explicitCtx, {
			botName: v2BotConfig.name,
			callback: mockCallback,
		});
		expect(mockResolveBotConfig).toHaveBeenCalledWith(
			explicitCtx,
			v2BotConfig.name,
		);
		expect(mockLexProvider).toHaveBeenCalledTimes(1);
		expect(mockLexProvider).toHaveBeenCalledWith(v2BotConfig, mockCallback);
	});

	it('rejects when bot config does not exist', async () => {
		mockResolveBotConfig.mockReturnValue(undefined);
		expect(() =>
			onComplete({ botName: v2BotConfig.name, callback: jest.fn }),
		).toThrow(InteractionsError);
	});

	it('throws on mis-ordered args (context not first)', () => {
		const explicitCtx = createMockAmplifyContext();
		const onCompleteUntyped = onComplete as unknown as (
			...args: unknown[]
		) => void;
		expect(() =>
			onCompleteUntyped(
				{ botName: v2BotConfig.name, callback: jest.fn() },
				explicitCtx,
			),
		).toThrow('AmplifyContext must be passed as the first argument');
		expect(mockLexProvider).not.toHaveBeenCalled();
	});
});
