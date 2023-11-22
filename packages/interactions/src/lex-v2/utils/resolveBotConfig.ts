// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSLexV2ProviderOption } from '~/src/lex-v2/types';
import { Amplify } from '@aws-amplify/core';

export const resolveBotConfig = (
	botName: string,
): AWSLexV2ProviderOption | undefined => {
	const { [botName]: botConfig = undefined } =
		Amplify.getConfig().Interactions?.LexV2 ?? {};
	if (botConfig !== undefined) {
		return { ...botConfig, name: botName };
	}
};
