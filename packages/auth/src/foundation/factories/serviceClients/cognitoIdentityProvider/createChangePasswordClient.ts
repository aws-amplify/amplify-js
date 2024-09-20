// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	createUserPoolDeserializer,
	createUserPoolSerializer,
} from './shared/serde';
import {
	ChangePasswordCommandInput,
	ChangePasswordCommandOutput,
	ServiceClientFactoryInput,
} from './types';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createChangePasswordClient = (config: ServiceClientFactoryInput) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		createUserPoolSerializer<ChangePasswordCommandInput>('ChangePassword'),
		createUserPoolDeserializer<ChangePasswordCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
