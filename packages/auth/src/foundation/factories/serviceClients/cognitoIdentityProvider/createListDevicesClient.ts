// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import {
	ListDevicesCommandInput,
	ListDevicesCommandOutput,
	ServiceClientFactoryInput,
} from './types';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	createUserPoolDeserializer,
	createUserPoolSerializer,
} from './shared/serde';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createListDevicesClient = (config: ServiceClientFactoryInput) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		createUserPoolSerializer<ListDevicesCommandInput>('ListDevices'),
		createUserPoolDeserializer<ListDevicesCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
