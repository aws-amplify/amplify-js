// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';

import {
	generateRandomLexV1Config,
	generateRandomLexV2Config,
} from '../../testUtils/randomConfigGeneration';
import { resolveBotConfig } from '../../../src/lex-v2/utils';

describe('Interactions LexV2 Util: resolveBotConfig', () => {
	const v1BotConfigs = [...Array(5)].map(generateRandomLexV1Config);
	const v2BotConfigs = [...Array(5)].map(generateRandomLexV2Config);
	const mockCtx = createMockAmplifyContext({
		Interactions: {
			LexV1: Object.fromEntries(v1BotConfigs.map(bot => [bot.name, bot])),
			LexV2: Object.fromEntries(v2BotConfigs.map(bot => [bot.name, bot])),
		},
	});

	it('find correct bot config if exist', () => {
		const result = resolveBotConfig(mockCtx, v2BotConfigs[3].name);
		expect(result).not.toBeUndefined();
		expect(result).toStrictEqual(v2BotConfigs[3]);
	});

	it('ignore v1 bot config', () => {
		const result = resolveBotConfig(mockCtx, v1BotConfigs[3].name);
		expect(result).toBeUndefined();
	});

	it('return undefined for non-exist bot', () => {
		const result = resolveBotConfig(mockCtx, 'test');
		expect(result).toBeUndefined();
	});
});
