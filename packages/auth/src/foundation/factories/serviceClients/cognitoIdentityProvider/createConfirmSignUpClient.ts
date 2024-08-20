// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	buildUserPoolDeserializer,
	buildUserPoolSerializer,
} from './shared/serialization';
import {
	ConfirmSignUpCommandInput,
	ConfirmSignUpCommandOutput,
} from './types/Sdk';
import { ServiceClientAPIConfig } from './types/ServiceClient';

export const createConfirmSignUpClient = (config: ServiceClientAPIConfig) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		buildUserPoolSerializer<ConfirmSignUpCommandInput>('ConfirmSignUp'),
		buildUserPoolDeserializer<ConfirmSignUpCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
