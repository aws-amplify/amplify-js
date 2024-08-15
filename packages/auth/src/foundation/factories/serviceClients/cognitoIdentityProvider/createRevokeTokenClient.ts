import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	buildUserPoolDeserializer,
	buildUserPoolSerializer,
} from './shared/serialization';
import { ServiceClientAPIConfig } from './types/ServiceClient';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

interface RevokeTokenInput {
	Token: string;
	ClientId: string;
}

type RevokeTokenOutput = Record<string, unknown>;

export const createRevokeTokenClient = (config: ServiceClientAPIConfig) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		buildUserPoolSerializer<RevokeTokenInput>('RevokeToken'),
		buildUserPoolDeserializer<RevokeTokenOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
