// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { AWSLexProviderOption } from '../types';

export const resolveBotConfig = (
	botName: string,
): AWSLexProviderOption | undefined => {
	const { [botName]: botConfig = undefined } =
		Amplify.getConfig().Interactions?.LexV1 ?? {};
	if (botConfig !== undefined) {
		return { ...botConfig, name: botName };
	}
};
