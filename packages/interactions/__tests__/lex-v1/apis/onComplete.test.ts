// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuid } from 'uuid';
import { createLexProvider } from '../../../src/lex-v1/AWSLexProvider';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';
import { onComplete } from '../../../src/lex-v1/apis';
import { generateRandomLexV1Config } from '../../testUtils/randomConfigGeneration';
import { resolveBotConfig } from '../../../src/lex-v1/utils';
import { InteractionsError } from '../../../src/errors/InteractionsError';

jest.mock('../../../src/lex-v1/AWSLexProvider');
jest.mock('../../../src/lex-v1/utils');

const mockCtx = createMockAmplifyContext();
const mockProvider = { sendMessage: jest.fn(), onComplete: jest.fn() };
(createLexProvider as jest.Mock).mockReturnValue(mockProvider);

describe('Interactions LexV1 API: onComplete', () => {
	const v1BotConfig = generateRandomLexV1Config();

	const mockLexProvider = mockProvider.onComplete as jest.Mock;
	const mockResolveBotConfig = resolveBotConfig as jest.Mock;

	beforeEach(() => {
		mockResolveBotConfig.mockReturnValue(v1BotConfig);
	});

	afterEach(() => {
		mockLexProvider.mockReset();
		mockResolveBotConfig.mockReset();
	});

	it('invokes provider onComplete API', () => {
		const message = uuid();
		const mockCallback = jest.fn();
		onComplete(mockCtx, { botName: v1BotConfig.name, callback: mockCallback });
		expect(mockLexProvider).toHaveBeenCalledTimes(1);
		expect(mockLexProvider).toHaveBeenCalledWith(v1BotConfig, mockCallback);
	});

	it('rejects when bot config does not exist', async () => {
		mockResolveBotConfig.mockReturnValue(undefined);
		expect(() =>
			onComplete(mockCtx, { botName: v1BotConfig.name, callback: jest.fn }),
		).toThrow(InteractionsError);
	});
});
