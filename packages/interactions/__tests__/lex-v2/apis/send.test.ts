// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuid } from 'uuid';
import { createLexV2Provider } from '../../../src/lex-v2/AWSLexV2Provider';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';
import { send } from '../../../src/lex-v2/apis';
import { generateRandomLexV2Config } from '../../testUtils/randomConfigGeneration';
import { resolveBotConfig } from '../../../src/lex-v2/utils';
import { InteractionsError } from '../../../src/errors/InteractionsError';

jest.mock('../../../src/lex-v2/AWSLexV2Provider');
jest.mock('../../../src/lex-v2/utils');

const mockCtx = createMockAmplifyContext();
const mockProvider = { sendMessage: jest.fn(), onComplete: jest.fn() };
(createLexV2Provider as jest.Mock).mockReturnValue(mockProvider);

describe('Interactions LexV2 API: send', () => {
	const v2BotConfig = generateRandomLexV2Config();

	const mockLexProvider = mockProvider.sendMessage as jest.Mock;
	const mockResolveBotConfig = resolveBotConfig as jest.Mock;

	beforeEach(() => {
		mockResolveBotConfig.mockReturnValue(v2BotConfig);
	});

	afterEach(() => {
		mockLexProvider.mockReset();
		mockResolveBotConfig.mockReset();
	});

	it('invokes provider sendMessage API', async () => {
		const message = uuid();
		await send(mockCtx, { botName: v2BotConfig.name, message });
		expect(mockLexProvider).toHaveBeenCalledTimes(1);
		expect(mockLexProvider).toHaveBeenCalledWith(v2BotConfig, message);
	});

	it('rejects when bot config does not exist', async () => {
		mockResolveBotConfig.mockReturnValue(undefined);
		await expect(
			send(mockCtx, { botName: v2BotConfig.name, message: uuid() }),
		).rejects.toBeInstanceOf(InteractionsError);
	});
});
