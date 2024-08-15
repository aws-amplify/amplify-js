import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { ServiceClientAPIConfig } from './types/ServiceClient';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	buildUserPoolDeserializer,
	buildUserPoolSerializer,
} from './shared/serialization';
import {
	ConfirmForgotPasswordCommandInput,
	ConfirmForgotPasswordCommandOutput,
} from './types/Sdk';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createConfirmForgotPasswordClient = (
	config: ServiceClientAPIConfig,
) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		buildUserPoolSerializer<ConfirmForgotPasswordCommandInput>(
			'ConfirmForgotPassword',
		),
		buildUserPoolDeserializer<ConfirmForgotPasswordCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
