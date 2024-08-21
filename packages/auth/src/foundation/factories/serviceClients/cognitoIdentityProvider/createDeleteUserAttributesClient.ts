// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import {
	DeleteUserAttributesCommandInput,
	DeleteUserAttributesCommandOutput,
	ServiceClientFactoryInput,
} from './types';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	createUserPoolDeserializer,
	createUserPoolSerializer,
} from './shared/serialization';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createDeleteUserAttributesClient = (
	config: ServiceClientFactoryInput,
) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		createUserPoolSerializer<DeleteUserAttributesCommandInput>(
			'DeleteUserAttributes',
		),
		createUserPoolDeserializer<DeleteUserAttributesCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
