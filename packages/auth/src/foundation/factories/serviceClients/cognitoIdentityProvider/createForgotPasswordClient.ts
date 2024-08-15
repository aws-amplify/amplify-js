import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { ServiceClientAPIConfig } from './types/ServiceClient';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	buildUserPoolDeserializer,
	buildUserPoolSerializer,
} from './shared/serialization';
import {
	ForgotPasswordCommandInput,
	ForgotPasswordCommandOutput,
} from './types/Sdk';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createForgotPasswordClient = (config: ServiceClientAPIConfig) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		buildUserPoolSerializer<ForgotPasswordCommandInput>('ForgotPassword'),
		buildUserPoolDeserializer<ForgotPasswordCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
