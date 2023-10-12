// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSLexV2ProviderOption } from '../types';
import { Amplify } from '@aws-amplify/core';

function isLexV2Config(object: any): object is AWSLexV2ProviderOption {
	return 'botId' in object;
}
export const resolveConfig = (
	botName: string
): AWSLexV2ProviderOption | undefined => {
	const bots = Amplify.getConfig().Interactions?.Lex ?? [];
	return bots.filter(isLexV2Config).find(bot => bot.name === botName);
};
