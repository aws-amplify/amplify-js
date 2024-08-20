// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	buildUserPoolDeserializer,
	buildUserPoolSerializer,
} from './shared/serialization';
import {
	ConfirmDeviceCommandInput,
	ConfirmDeviceCommandOutput,
} from './types/Sdk';
import { ServiceClientAPIConfig } from './types/ServiceClient';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createConfirmDeviceClient = (config: ServiceClientAPIConfig) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		buildUserPoolSerializer<ConfirmDeviceCommandInput>('ConfirmDevice'),
		buildUserPoolDeserializer<ConfirmDeviceCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
