import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { ServiceClientAPIConfig } from './types/ServiceClient';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	buildUserPoolDeserializer,
	buildUserPoolSerializer,
} from './shared/serialization';
import {
	AssociateSoftwareTokenCommandInput,
	AssociateSoftwareTokenCommandOutput,
} from './types/Sdk';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createAssociateSoftwareTokenClient = (
	config: ServiceClientAPIConfig,
) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		buildUserPoolSerializer<AssociateSoftwareTokenCommandInput>(
			'AssociateSoftwareToken',
		),
		buildUserPoolDeserializer<AssociateSoftwareTokenCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
