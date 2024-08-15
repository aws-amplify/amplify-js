import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { ServiceClientAPIConfig } from './types/ServiceClient';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	SetUserMFAPreferenceCommandInput,
	SetUserMFAPreferenceCommandOutput,
} from './types/Sdk';
import {
	buildUserPoolDeserializer,
	buildUserPoolSerializer,
} from './shared/serialization';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createSetUserMFAPreferenceClient = (
	config: ServiceClientAPIConfig,
) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		buildUserPoolSerializer<SetUserMFAPreferenceCommandInput>(
			'SetUserMFAPreference',
		),
		buildUserPoolDeserializer<SetUserMFAPreferenceCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
