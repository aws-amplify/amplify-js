// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import {
	DeleteUserCommandInput,
	DeleteUserCommandOutput,
	ServiceClientFactoryInput,
} from './types';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	createEmptyResponseDeserializer,
	createUserPoolSerializer,
} from './shared/serialization';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createDeleteUserClient = (config: ServiceClientFactoryInput) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		createUserPoolSerializer<DeleteUserCommandInput>('DeleteUser'),
		createEmptyResponseDeserializer<DeleteUserCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
