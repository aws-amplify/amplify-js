// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { OnCompleteInput, SendInput } from './inputs';
import { SendOutput } from './outputs';

export interface AWSLexProviderOption {
	name: string;
	alias: string;
	region: string;
}

export interface IInteractions {
	send(input: SendInput): Promise<SendOutput>;
	onComplete(input: OnCompleteInput): void;
}
