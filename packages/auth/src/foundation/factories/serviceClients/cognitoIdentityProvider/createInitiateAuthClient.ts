// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { ServiceClientAPIConfig } from './types/ServiceClient';
import {
	buildUserPoolDeserializer,
	buildUserPoolSerializer,
} from './shared/serialization';
import {
	InitiateAuthCommandInput,
	InitiateAuthCommandOutput,
} from './types/Sdk';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createInitiateAuthClient = (config: ServiceClientAPIConfig) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		buildUserPoolSerializer<InitiateAuthCommandInput>('InitiateAuth'),
		buildUserPoolDeserializer<InitiateAuthCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
