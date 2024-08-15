import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { ServiceClientAPIConfig } from './types/ServiceClient';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	buildUserPoolDeserializer,
	buildUserPoolSerializer,
} from './shared/serialization';
import { SignUpCommandInput, SignUpCommandOutput } from './types/Sdk';

export const createSignUpClient = (config: ServiceClientAPIConfig) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		buildUserPoolSerializer<SignUpCommandInput>('SignUp'),
		buildUserPoolDeserializer<SignUpCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
