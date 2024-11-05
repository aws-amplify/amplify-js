// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	createEmptyResponseDeserializer,
	createUserPoolSerializer,
} from './shared/serde';
import {
	ForgetDeviceCommandInput,
	ForgetDeviceCommandOutput,
	ServiceClientFactoryInput,
} from './types';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createForgetDeviceClient = (config: ServiceClientFactoryInput) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		createUserPoolSerializer<ForgetDeviceCommandInput>('ForgetDevice'),
		createEmptyResponseDeserializer<ForgetDeviceCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
