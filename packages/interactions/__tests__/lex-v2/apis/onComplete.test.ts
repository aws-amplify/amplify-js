// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuid } from 'uuid';
import { createLexV2Provider } from '../../../src/lex-v2/AWSLexV2Provider';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';
import { onComplete } from '../../../src/lex-v2/apis';
import { generateRandomLexV2Config } from '../../testUtils/randomConfigGeneration';
import { resolveBotConfig } from '../../../src/lex-v2/utils';
import { InteractionsError } from '../../../src/errors/InteractionsError';

jest.mock('../../../src/lex-v2/AWSLexV2Provider');
jest.mock('../../../src/lex-v2/utils');

const mockCtx = createMockAmplifyContext();
const mockProvider = { sendMessage: jest.fn(), onComplete: jest.fn() };
(createLexV2Provider as jest.Mock).mockReturnValue(mockProvider);

describe('Interactions LexV2 API: onComplete', () => {
	const v2BotConfig = generateRandomLexV2Config();

	const mockLexProvider = mockProvider.onComplete as jest.Mock;
	const mockResolveBotConfig = resolveBotConfig as jest.Mock;

	beforeEach(() => {
		mockResolveBotConfig.mockReturnValue(v2BotConfig);
	});

	afterEach(() => {
		mockLexProvider.mockReset();
		mockResolveBotConfig.mockReset();
	});

	it('invokes provider onComplete API', () => {
		const message = uuid();
		const mockCallback = jest.fn();
		onComplete(mockCtx, { botName: v2BotConfig.name, callback: mockCallback });
		expect(mockLexProvider).toHaveBeenCalledTimes(1);
		expect(mockLexProvider).toHaveBeenCalledWith(v2BotConfig, mockCallback);
	});

	it('rejects when bot config does not exist', async () => {
		mockResolveBotConfig.mockReturnValue(undefined);
		expect(() =>
			onComplete(mockCtx, { botName: v2BotConfig.name, callback: jest.fn }),
		).toThrow(InteractionsError);
	});
});
