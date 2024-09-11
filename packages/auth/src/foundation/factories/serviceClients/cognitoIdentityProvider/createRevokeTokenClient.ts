// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	createUserPoolDeserializer,
	createUserPoolSerializer,
} from './shared/serde';
import { ServiceClientFactoryInput } from './types';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

interface RevokeTokenInput {
	Token: string;
	ClientId: string;
}

type RevokeTokenOutput = Record<string, unknown>;

export const createRevokeTokenClient = (config: ServiceClientFactoryInput) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		createUserPoolSerializer<RevokeTokenInput>('RevokeToken'),
		createUserPoolDeserializer<RevokeTokenOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
