// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { v4 as uuid } from 'uuid';
import { AWSLexProviderOption } from '../../src/lex-v1/types';
import { AWSLexV2ProviderOption } from '../../src/lex-v2/types';

export const generateRandomLexV1Config = (): AWSLexProviderOption => ({
	name: uuid(),
	alias: uuid(),
	region: uuid(),
});

export const generateRandomLexV2Config = (): AWSLexV2ProviderOption => ({
	name: uuid(),
	aliasId: uuid(),
	botId: uuid(),
	region: uuid(),
	localeId: uuid(),
});
