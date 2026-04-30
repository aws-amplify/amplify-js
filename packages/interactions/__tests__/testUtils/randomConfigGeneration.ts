// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { amplifyUuid } from '@aws-amplify/core/internals/utils';
import { AWSLexProviderOption } from '../../src/lex-v1/types';
import { AWSLexV2ProviderOption } from '../../src/lex-v2/types';

export const generateRandomLexV1Config = (): AWSLexProviderOption => ({
	name: amplifyUuid(),
	alias: amplifyUuid(),
	region: amplifyUuid(),
});

export const generateRandomLexV2Config = (): AWSLexV2ProviderOption => ({
	name: amplifyUuid(),
	aliasId: amplifyUuid(),
	botId: amplifyUuid(),
	region: amplifyUuid(),
	localeId: amplifyUuid(),
});
