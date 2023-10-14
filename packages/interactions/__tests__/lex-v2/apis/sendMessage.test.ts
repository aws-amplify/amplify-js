// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuid } from 'uuid';
import { lexProvider } from '../../../src/lex-v2/AWSLexV2Provider';
import { sendMessage } from '../../../src/lex-v2';
import { generateRandomLexV2Config } from '../../testUtils/randomConfigGeneration.test';
import { resolveBotConfig } from '../../../src/lex-v2/utils';
import { InteractionsError } from '../../../src/errors/InteractionsError';

jest.mock('../../../src/lex-v2/AWSLexV2Provider');
jest.mock('../../../src/lex-v2/utils');

describe('Interactions LexV2 API: sendMessage', () => {
	const v2BotConfig = generateRandomLexV2Config();

	const mockLexProvider = lexProvider.sendMessage as jest.Mock;
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
		await sendMessage(v2BotConfig.name, message);
		expect(mockLexProvider).toBeCalledTimes(1);
		expect(mockLexProvider).toBeCalledWith(v2BotConfig, message);
	});

	it('rejects when bot config does not exist', async () => {
		mockResolveBotConfig.mockReturnValue(undefined);
		await expect(sendMessage(v2BotConfig.name, uuid())).rejects.toBeInstanceOf(
			InteractionsError
		);
	});
});
