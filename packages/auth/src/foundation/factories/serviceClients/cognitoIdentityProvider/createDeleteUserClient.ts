import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { ServiceClientAPIConfig } from './types/ServiceClient';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	buildEmptyResponseDeserializer,
	buildUserPoolSerializer,
} from './shared/serialization';
import { DeleteUserCommandInput, DeleteUserCommandOutput } from './types/Sdk';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createDeleteUserClient = (config: ServiceClientAPIConfig) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		buildUserPoolSerializer<DeleteUserCommandInput>('DeleteUser'),
		buildEmptyResponseDeserializer<DeleteUserCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
