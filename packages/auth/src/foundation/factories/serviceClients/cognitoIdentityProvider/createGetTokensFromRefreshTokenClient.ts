// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import {
	GetTokensFromRefreshTokenCommandInput,
	GetTokensFromRefreshTokenCommandOutput,
	ServiceClientFactoryInput,
} from './types';
import {
	createUserPoolDeserializer,
	createUserPoolSerializer,
} from './shared/serde';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createGetTokensFromRefreshTokenClient = (
	config: ServiceClientFactoryInput,
) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		createUserPoolSerializer<GetTokensFromRefreshTokenCommandInput>(
			'GetTokensFromRefreshToken',
		),
		createUserPoolDeserializer<GetTokensFromRefreshTokenCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
