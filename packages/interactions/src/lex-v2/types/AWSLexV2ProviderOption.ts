// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { OnCompleteInput, SendInput } from './inputs';
import { SendOutput } from './outputs';

export interface AWSLexV2ProviderOption {
	name: string;
	botId: string;
	aliasId: string;
	localeId: string;
	region: string;
}

export interface IInteractions {
	send(input: SendInput): Promise<SendOutput>;
	onComplete(input: OnCompleteInput): void;
}
