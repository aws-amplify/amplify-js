// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { send, onComplete } from './apis';
import { IInteractions } from './types/AWSLexProviderOption';

/**
 * @deprecated recommend to migrate to AWS Lex V2 instead
 * */
export const Interactions: IInteractions = {
	send,
	onComplete,
};
export { SendInput, OnCompleteInput, SendOutput } from './types';
