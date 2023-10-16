// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	generateRandomLexV1Config,
	generateRandomLexV2Config,
} from '../../testUtils/randomConfigGeneration.test';
import { resolveBotConfig } from '../../../src/lex-v2/utils';

describe('Interactions LexV2 Util: resolveBotConfig', () => {
	const getConfigSpy = jest.spyOn(Amplify, 'getConfig');

	afterEach(() => {
		getConfigSpy.mockReset();
	});

	it('find correct bot config if exist', () => {
		const v1BotConfigs = [...Array(5)].map(generateRandomLexV1Config);
		const v2BotConfigs = [...Array(5)].map(generateRandomLexV2Config);
		getConfigSpy.mockReturnValue({
			Interactions: {
				LexV1: Object.fromEntries(v1BotConfigs.map(bot => [bot.name, bot])),
				LexV2: Object.fromEntries(v2BotConfigs.map(bot => [bot.name, bot])),
			},
		});

		const result = resolveBotConfig(v2BotConfigs[3].name);
		expect(result).not.toBeUndefined();
		expect(result).toStrictEqual(v2BotConfigs[3]);
	});

	it('ignore v2 bot config', () => {
		const v1BotConfigs = [...Array(5)].map(generateRandomLexV1Config);
		const v2BotConfigs = [...Array(5)].map(generateRandomLexV2Config);
		getConfigSpy.mockReturnValue({
			Interactions: {
				LexV1: Object.fromEntries(v1BotConfigs.map(bot => [bot.name, bot])),
				LexV2: Object.fromEntries(v2BotConfigs.map(bot => [bot.name, bot])),
			},
		});

		const result = resolveBotConfig(v1BotConfigs[3].name);
		expect(result).toBeUndefined();
	});

	it('return undefined for non-exist bot', () => {
		const v1BotConfigs = [...Array(5)].map(generateRandomLexV1Config);
		const v2BotConfigs = [...Array(5)].map(generateRandomLexV2Config);
		getConfigSpy.mockReturnValue({
			Interactions: {
				LexV1: Object.fromEntries(v1BotConfigs.map(bot => [bot.name, bot])),
				LexV2: Object.fromEntries(v2BotConfigs.map(bot => [bot.name, bot])),
			},
		});

		const result = resolveBotConfig('test');
		expect(result).toBeUndefined();
	});

	it('return first match bot', () => {
		const v1BotConfigs = [...Array(5)].map(generateRandomLexV1Config);
		const v2BotConfigs = [...Array(5)].map(generateRandomLexV2Config);
		getConfigSpy.mockReturnValue({
			Interactions: {
				LexV1: Object.fromEntries(v1BotConfigs.map(bot => [bot.name, bot])),
				LexV2: {
					[v2BotConfigs[3].name]: { ...v2BotConfigs[3], aliasId: 'test' },
					...Object.fromEntries(v2BotConfigs.map(bot => [bot.name, bot])),
				},
			},
		});

		const result = resolveBotConfig(v2BotConfigs[3].name);
		expect(result).not.toBeUndefined();
		expect(result).toStrictEqual({
			...v2BotConfigs[3],
			aliasId: v2BotConfigs[3].aliasId,
		});
	});
});
