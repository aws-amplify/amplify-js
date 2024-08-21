// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import {
	ForgotPasswordCommandInput,
	ForgotPasswordCommandOutput,
	ServiceClientFactoryInput,
} from './types';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	createUserPoolDeserializer,
	createUserPoolSerializer,
} from './shared/serialization';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createForgotPasswordClient = (config: ServiceClientFactoryInput) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		createUserPoolSerializer<ForgotPasswordCommandInput>('ForgotPassword'),
		createUserPoolDeserializer<ForgotPasswordCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
