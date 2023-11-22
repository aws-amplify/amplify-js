// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSLexProviderOption } from '~/src/lex-v1/types';
import { Amplify } from '@aws-amplify/core';

export const resolveBotConfig = (
	botName: string,
): AWSLexProviderOption | undefined => {
	const { [botName]: botConfig = undefined } =
		Amplify.getConfig().Interactions?.LexV1 ?? {};
	if (botConfig !== undefined) {
		return { ...botConfig, name: botName };
	}
};
