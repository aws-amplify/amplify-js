// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

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
	send(ctx: AmplifyContext, input: SendInput): Promise<SendOutput>;
	onComplete(ctx: AmplifyContext, input: OnCompleteInput): void;
}
