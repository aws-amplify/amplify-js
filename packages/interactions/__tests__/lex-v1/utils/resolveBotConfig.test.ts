// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';
import {
	generateRandomLexV1Config,
	generateRandomLexV2Config,
} from '../../testUtils/randomConfigGeneration';
import { resolveBotConfig } from '../../../src/lex-v1/utils';

const mockCtx = createMockAmplifyContext();

describe('Interactions LexV1 Util: resolveBotConfig', () => {

	afterEach(() => {
	});

	it('find correct bot config if exist', () => {
		const v1BotConfigs = [...Array(5)].map(generateRandomLexV1Config);
		const v2BotConfigs = [...Array(5)].map(generateRandomLexV2Config);
		(mockCtx as any).resourcesConfig = {
			Interactions: {
				LexV1: Object.fromEntries(v1BotConfigs.map(bot => [bot.name, bot])),
				LexV2: Object.fromEntries(v2BotConfigs.map(bot => [bot.name, bot])),
			},
		};

		const result = resolveBotConfig(mockCtx, v1BotConfigs[3].name);
		expect(result).not.toBeUndefined();
		expect(result).toStrictEqual(v1BotConfigs[3]);
	});

	it('ignore v2 bot config', () => {
		const v1BotConfigs = [...Array(5)].map(generateRandomLexV1Config);
		const v2BotConfigs = [...Array(5)].map(generateRandomLexV2Config);
		(mockCtx as any).resourcesConfig = {
			Interactions: {
				LexV1: Object.fromEntries(v1BotConfigs.map(bot => [bot.name, bot])),
				LexV2: Object.fromEntries(v2BotConfigs.map(bot => [bot.name, bot])),
			},
		};

		const result = resolveBotConfig(mockCtx, v2BotConfigs[3].name);
		expect(result).toBeUndefined();
	});

	it('return undefined for non-exist bot', () => {
		const v1BotConfigs = [...Array(5)].map(generateRandomLexV1Config);
		const v2BotConfigs = [...Array(5)].map(generateRandomLexV2Config);
		(mockCtx as any).resourcesConfig = {
			Interactions: {
				LexV1: Object.fromEntries(v1BotConfigs.map(bot => [bot.name, bot])),
				LexV2: Object.fromEntries(v2BotConfigs.map(bot => [bot.name, bot])),
			},
		};

		const result = resolveBotConfig(mockCtx, 'test');
		expect(result).toBeUndefined();
	});
});
