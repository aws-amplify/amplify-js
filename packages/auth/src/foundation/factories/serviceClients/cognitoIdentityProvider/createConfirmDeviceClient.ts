// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	createUserPoolDeserializer,
	createUserPoolSerializer,
} from './shared/serde';
import {
	ConfirmDeviceCommandInput,
	ConfirmDeviceCommandOutput,
	ServiceClientFactoryInput,
} from './types';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createConfirmDeviceClient = (config: ServiceClientFactoryInput) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		createUserPoolSerializer<ConfirmDeviceCommandInput>('ConfirmDevice'),
		createUserPoolDeserializer<ConfirmDeviceCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
