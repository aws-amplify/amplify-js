// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { PredictionsConfig } from '@aws-amplify/core';
import { ConsoleLogger as Logger } from '@aws-amplify/core/internals/utils';

const logger = new Logger('Amplify');

export abstract class AbstractPredictionsProvider {
	abstract getProviderName(): string;

	abstract getCategory(): string;
}
