// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { PredictionsConfig } from '@aws-amplify/core';
import { ConsoleLogger as Logger } from '@aws-amplify/core/internals/utils';

const logger = new Logger('Amplify');

export abstract class AbstractPredictionsProvider {
	protected _config: PredictionsConfig;

	configure(config: PredictionsConfig) {
		logger.debug('configure AbstractPredictionsProvider', { config });
		this._config = config;
		return config;
	}

	abstract getProviderName(): string;

	abstract getCategory(): string;
}
