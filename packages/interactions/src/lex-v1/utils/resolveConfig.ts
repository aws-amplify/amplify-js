// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSLexProviderOption } from '../types';
import { Amplify } from '@aws-amplify/core';

function isLexV1Config(object: any): object is AWSLexProviderOption {
	return 'alias' in object;
}
export const resolveConfig = (
	botName: string
): AWSLexProviderOption | undefined => {
	const lexBots = Amplify.getConfig().Interactions?.Lex ?? [];
	return lexBots.filter(isLexV1Config).find(bot => bot.name === botName);
};
