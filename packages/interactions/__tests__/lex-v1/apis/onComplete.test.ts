// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';
import { lexProvider } from '../../../src/lex-v1/AWSLexProvider';
import { onComplete } from '../../../src/lex-v1/apis';
import { generateRandomLexV1Config } from '../../testUtils/randomConfigGeneration';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';
import { resolveBotConfig } from '../../../src/lex-v1/utils';
import { InteractionsError } from '../../../src/errors/InteractionsError';

jest.mock('../../../src/lex-v1/AWSLexProvider');
jest.mock('../../../src/lex-v1/utils');

describe('Interactions LexV1 API: onComplete', () => {
	const v1BotConfig = generateRandomLexV1Config();
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
		mockResolveBotConfig.mockReturnValue(v1BotConfig);
	});

	afterEach(() => {
		mockLexProvider.mockReset();
		mockResolveBotConfig.mockReset();
	});

	it('invokes provider onComplete API', () => {
		const mockCallback = jest.fn();
		onComplete({ botName: v1BotConfig.name, callback: mockCallback });
		expect(mockResolveBotConfig).toHaveBeenCalledWith(
			mockCtx,
			v1BotConfig.name,
		);
		expect(mockLexProvider).toHaveBeenCalledTimes(1);
		expect(mockLexProvider).toHaveBeenCalledWith(v1BotConfig, mockCallback);
	});

	it('invokes provider onComplete API with explicit context', () => {
		const explicitCtx = createMockAmplifyContext();
		const mockCallback = jest.fn();
		onComplete(explicitCtx, {
			botName: v1BotConfig.name,
			callback: mockCallback,
		});
		expect(mockResolveBotConfig).toHaveBeenCalledWith(
			explicitCtx,
			v1BotConfig.name,
		);
		expect(mockLexProvider).toHaveBeenCalledTimes(1);
		expect(mockLexProvider).toHaveBeenCalledWith(v1BotConfig, mockCallback);
	});

	it('rejects when bot config does not exist', async () => {
		mockResolveBotConfig.mockReturnValue(undefined);
		expect(() =>
			onComplete({ botName: v1BotConfig.name, callback: jest.fn }),
		).toThrow(InteractionsError);
	});
});
