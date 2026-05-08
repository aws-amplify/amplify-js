// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuid } from 'uuid';
import { AMPLIFY_CONTEXT_BRAND, AmplifyContext } from '@aws-amplify/core';
import { createLexProvider } from '../../../src/lex-v1/AWSLexProvider';
import { onComplete } from '../../../src/lex-v1/apis';
import { generateRandomLexV1Config } from '../../testUtils/randomConfigGeneration';
import { resolveBotConfig } from '../../../src/lex-v1/utils';
import { InteractionsError } from '../../../src/errors/InteractionsError';

jest.mock('../../../src/lex-v1/AWSLexProvider');
jest.mock('../../../src/lex-v1/utils');

describe('Interactions LexV1 API: onComplete', () => {
	const v1BotConfig = generateRandomLexV1Config();

	const mockOnComplete = jest.fn();
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
		mockCreateLexProvider.mockReturnValue({ onComplete: mockOnComplete });
	});

	afterEach(() => {
		mockOnComplete.mockReset();
		mockCreateLexProvider.mockReset();
		mockResolveBotConfig.mockReset();
	});

	it('invokes provider onComplete API', () => {
		const message = uuid();
		const mockCallback = jest.fn();
		onComplete(mockCtx, { botName: v1BotConfig.name, callback: mockCallback });
		expect(mockOnComplete).toHaveBeenCalledTimes(1);
		expect(mockOnComplete).toHaveBeenCalledWith(v1BotConfig, mockCallback);
	});

	it('rejects when bot config does not exist', async () => {
		mockResolveBotConfig.mockReturnValue(undefined);
		expect(() =>
			onComplete(mockCtx, { botName: v1BotConfig.name, callback: jest.fn }),
		).toThrow(InteractionsError);
	});
});
