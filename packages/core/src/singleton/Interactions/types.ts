// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

interface LexV1BotConfig {
	name: string;
	alias: string;
	region: string;
}

interface LexV2BotConfig {
	name: string;
	botId: string;
	aliasId: string;
	localeId: string;
	region: string;
}

export type InteractionsConfig = {
	Lex: (LexV1BotConfig | LexV2BotConfig)[];
};
