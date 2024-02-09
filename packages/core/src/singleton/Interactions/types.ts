// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AtLeastOne } from '../types';

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

export type InteractionsConfig = AtLeastOne<
	InteractionsLexV1Config & InteractionsLexV2Config
>;
