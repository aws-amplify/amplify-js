// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import {
	InitiateAuthCommandInput,
	InitiateAuthCommandOutput,
	ServiceClientFactoryInput,
} from './types';
import {
	createUserPoolDeserializer,
	createUserPoolSerializer,
} from './shared/serde';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createInitiateAuthClient = (config: ServiceClientFactoryInput) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		createUserPoolSerializer<InitiateAuthCommandInput>('InitiateAuth'),
		createUserPoolDeserializer<InitiateAuthCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
