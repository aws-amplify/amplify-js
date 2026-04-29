// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuid } from 'uuid';
import { Amplify } from '@aws-amplify/core';
import { createLexV2Provider } from '../../../src/lex-v2/AWSLexV2Provider';
import { onComplete } from '../../../src/lex-v2/apis';
import { generateRandomLexV2Config } from '../../testUtils/randomConfigGeneration';
import { resolveBotConfig } from '../../../src/lex-v2/utils';
import { InteractionsError } from '../../../src/errors/InteractionsError';

jest.mock('../../../src/lex-v2/AWSLexV2Provider');
jest.mock('../../../src/lex-v2/utils');

describe('Interactions LexV2 API: onComplete', () => {
	const v2BotConfig = generateRandomLexV2Config();

	const mockOnComplete = jest.fn();
	const mockCreateLexV2Provider = createLexV2Provider as jest.Mock;
	const mockResolveBotConfig = resolveBotConfig as jest.Mock;

	beforeAll(() => {
		Amplify.configure({});
	});

	beforeEach(() => {
		mockResolveBotConfig.mockReturnValue(v2BotConfig);
		mockCreateLexV2Provider.mockReturnValue({
			onComplete: mockOnComplete,
		});
	});

	afterEach(() => {
		mockOnComplete.mockReset();
		mockCreateLexV2Provider.mockReset();
		mockResolveBotConfig.mockReset();
	});

	it('invokes provider onComplete API', () => {
		const message = uuid();
		const mockCallback = jest.fn();
		onComplete({ botName: v2BotConfig.name, callback: mockCallback });
		expect(mockOnComplete).toHaveBeenCalledTimes(1);
		expect(mockOnComplete).toHaveBeenCalledWith(v2BotConfig, mockCallback);
	});

	it('rejects when bot config does not exist', async () => {
		mockResolveBotConfig.mockReturnValue(undefined);
		expect(() =>
			onComplete({ botName: v2BotConfig.name, callback: jest.fn }),
		).toThrow(InteractionsError);
	});
});
