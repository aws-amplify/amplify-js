// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

interface LexV1BotConfig {
	alias: string;
	region: string;
}

interface LexV2BotConfig {
	botId: string;
	aliasId: string;
	localeId: string;
	region: string;
}

type InteractionsLexV1Config = {
	LexV1: Record<string, LexV1BotConfig>;
};

type InteractionsLexV2Config = {
	LexV2: Record<string, LexV2BotConfig>;
};

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
	U[keyof U];

export type InteractionsConfig = AtLeastOne<
	InteractionsLexV1Config & InteractionsLexV2Config
>;
