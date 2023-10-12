// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CompletionCallback } from '../../types';
import { resolveConfig } from '../utils';
import { lexProvider } from '../AWSLexV2Provider';

export const onComplete = (
	botname: string,
	callback: CompletionCallback
): void => {
	const botConfig = resolveConfig(botname);
	if (!botConfig) {
		throw new Error(`Bot ${botname} does not exist`);
	}
	lexProvider.onComplete(botConfig, callback);
};
