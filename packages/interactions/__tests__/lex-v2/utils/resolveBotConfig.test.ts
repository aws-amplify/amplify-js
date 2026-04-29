// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AMPLIFY_CONTEXT_BRAND, AmplifyContext } from '@aws-amplify/core';
import {
	generateRandomLexV1Config,
	generateRandomLexV2Config,
} from '../../testUtils/randomConfigGeneration';
import { resolveBotConfig } from '../../../src/lex-v2/utils';

describe('Interactions LexV2 Util: resolveBotConfig', () => {
	const createMockCtx = (
		resourcesConfig: Record<string, unknown>,
	): AmplifyContext => {
		const ctx = {
			[AMPLIFY_CONTEXT_BRAND]: true,
			resourcesConfig,
			libraryOptions: {},
			fetchAuthSession: jest.fn(),
			clearCredentials: jest.fn(),
			getTokens: jest.fn(),
		};
		return ctx as unknown as AmplifyContext;
	};

	it('find correct bot config if exist', () => {
		const v1BotConfigs = [...Array(5)].map(generateRandomLexV1Config);
		const v2BotConfigs = [...Array(5)].map(generateRandomLexV2Config);
		const ctx = createMockCtx({
			Interactions: {
				LexV1: Object.fromEntries(v1BotConfigs.map(bot => [bot.name, bot])),
				LexV2: Object.fromEntries(v2BotConfigs.map(bot => [bot.name, bot])),
			},
		});

		const result = resolveBotConfig(ctx, v2BotConfigs[3].name);
		expect(result).not.toBeUndefined();
		expect(result).toStrictEqual(v2BotConfigs[3]);
	});

	it('ignore v2 bot config', () => {
		const v1BotConfigs = [...Array(5)].map(generateRandomLexV1Config);
		const v2BotConfigs = [...Array(5)].map(generateRandomLexV2Config);
		const ctx = createMockCtx({
			Interactions: {
				LexV1: Object.fromEntries(v1BotConfigs.map(bot => [bot.name, bot])),
				LexV2: Object.fromEntries(v2BotConfigs.map(bot => [bot.name, bot])),
			},
		});

		const result = resolveBotConfig(ctx, v1BotConfigs[3].name);
		expect(result).toBeUndefined();
	});

	it('return undefined for non-exist bot', () => {
		const v1BotConfigs = [...Array(5)].map(generateRandomLexV1Config);
		const v2BotConfigs = [...Array(5)].map(generateRandomLexV2Config);
		const ctx = createMockCtx({
			Interactions: {
				LexV1: Object.fromEntries(v1BotConfigs.map(bot => [bot.name, bot])),
				LexV2: Object.fromEntries(v2BotConfigs.map(bot => [bot.name, bot])),
			},
		});

		const result = resolveBotConfig(ctx, 'test');
		expect(result).toBeUndefined();
	});
});
