// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuid } from 'uuid';
import { Amplify } from '@aws-amplify/core';
import { createLexV2Provider } from '../../../src/lex-v2/AWSLexV2Provider';
import { send } from '../../../src/lex-v2/apis';
import { generateRandomLexV2Config } from '../../testUtils/randomConfigGeneration';
import { resolveBotConfig } from '../../../src/lex-v2/utils';
import { InteractionsError } from '../../../src/errors/InteractionsError';

jest.mock('../../../src/lex-v2/AWSLexV2Provider');
jest.mock('../../../src/lex-v2/utils');

describe('Interactions LexV2 API: send', () => {
	const v2BotConfig = generateRandomLexV2Config();

	const mockSendMessage = jest.fn();
	const mockCreateLexV2Provider = createLexV2Provider as jest.Mock;
	const mockResolveBotConfig = resolveBotConfig as jest.Mock;

	beforeAll(() => {
		Amplify.configure({});
	});

	beforeEach(() => {
		mockResolveBotConfig.mockReturnValue(v2BotConfig);
		mockCreateLexV2Provider.mockReturnValue({
			sendMessage: mockSendMessage,
		});
	});

	afterEach(() => {
		mockSendMessage.mockReset();
		mockCreateLexV2Provider.mockReset();
		mockResolveBotConfig.mockReset();
	});

	it('invokes provider sendMessage API', async () => {
		const message = uuid();
		await send({ botName: v2BotConfig.name, message });
		expect(mockSendMessage).toHaveBeenCalledTimes(1);
		expect(mockSendMessage).toHaveBeenCalledWith(v2BotConfig, message);
	});

	it('rejects when bot config does not exist', async () => {
		mockResolveBotConfig.mockReturnValue(undefined);
		await expect(
			send({ botName: v2BotConfig.name, message: uuid() }),
		).rejects.toBeInstanceOf(InteractionsError);
	});
});
