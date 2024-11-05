// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { onComplete, send } from './apis';
import { IInteractions } from './types/AWSLexV2ProviderOption';

export const Interactions: IInteractions = {
	send,
	onComplete,
};
export { SendInput, OnCompleteInput, SendOutput } from './types';
