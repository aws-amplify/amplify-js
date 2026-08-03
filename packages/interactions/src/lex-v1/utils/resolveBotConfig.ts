// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

import { AWSLexProviderOption } from '../types';

export const resolveBotConfig = (
	ctx: AmplifyContext,
	botName: string,
): AWSLexProviderOption | undefined => {
	const { [botName]: botConfig = undefined } =
		ctx.resourcesConfig.Interactions?.LexV1 ?? {};
	if (botConfig !== undefined) {
		return { ...botConfig, name: botName };
	}
};
