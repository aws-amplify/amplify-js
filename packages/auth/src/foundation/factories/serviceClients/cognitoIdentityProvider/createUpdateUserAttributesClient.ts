import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { ServiceClientAPIConfig } from './types/ServiceClient';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	buildUserPoolDeserializer,
	buildUserPoolSerializer,
} from './shared/serialization';
import {
	UpdateUserAttributesCommandInput,
	UpdateUserAttributesCommandOutput,
} from './types/Sdk';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createUpdateUserAttributesClient = (
	config: ServiceClientAPIConfig,
) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		buildUserPoolSerializer<UpdateUserAttributesCommandInput>(
			'UpdateUserAttributes',
		),
		buildUserPoolDeserializer<UpdateUserAttributesCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
