// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuid } from 'uuid';
import { AMPLIFY_CONTEXT_BRAND, AmplifyContext } from '@aws-amplify/core';
import { createLexProvider } from '../../../src/lex-v1/AWSLexProvider';
import { send } from '../../../src/lex-v1/apis';
import { generateRandomLexV1Config } from '../../testUtils/randomConfigGeneration';
import { resolveBotConfig } from '../../../src/lex-v1/utils';
import { InteractionsError } from '../../../src/errors/InteractionsError';

jest.mock('../../../src/lex-v1/AWSLexProvider');
jest.mock('../../../src/lex-v1/utils');

describe('Interactions LexV1 API: send', () => {
	const v1BotConfig = generateRandomLexV1Config();

	const mockSendMessage = jest.fn();
	const mockCreateLexProvider = createLexProvider as jest.Mock;
	const mockResolveBotConfig = resolveBotConfig as jest.Mock;

	const mockCtx: AmplifyContext = {
		[AMPLIFY_CONTEXT_BRAND]: true,
		resourcesConfig: {},
		libraryOptions: {},
		fetchAuthSession: jest.fn(),
		clearCredentials: jest.fn(),
		getTokens: jest.fn(),
	} as unknown as AmplifyContext;

	beforeEach(() => {
		mockResolveBotConfig.mockReturnValue(v1BotConfig);
		mockCreateLexProvider.mockReturnValue({ sendMessage: mockSendMessage });
	});

	afterEach(() => {
		mockSendMessage.mockReset();
		mockCreateLexProvider.mockReset();
		mockResolveBotConfig.mockReset();
	});

	it('invokes provider sendMessage API', async () => {
		const message = uuid();
		await send(mockCtx, { botName: v1BotConfig.name, message });
		expect(mockSendMessage).toHaveBeenCalledTimes(1);
		expect(mockSendMessage).toHaveBeenCalledWith(v1BotConfig, message);
	});

	it('rejects when bot config does not exist', async () => {
		mockResolveBotConfig.mockReturnValue(undefined);
		await expect(
			send(mockCtx, { botName: v1BotConfig.name, message: uuid() }),
		).rejects.toBeInstanceOf(InteractionsError);
	});
});
