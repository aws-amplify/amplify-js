import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { cognitoUserPoolTransferHandler } from './shared/handler';
import {
	buildEmptyResponseDeserializer,
	buildUserPoolSerializer,
} from './shared/serialization';
import { ServiceClientAPIConfig } from './types/ServiceClient';
import {
	ForgetDeviceCommandInput,
	ForgetDeviceCommandOutput,
} from './types/Sdk';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createForgetDeviceClient = (config: ServiceClientAPIConfig) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		buildUserPoolSerializer<ForgetDeviceCommandInput>('ForgetDevice'),
		buildEmptyResponseDeserializer<ForgetDeviceCommandOutput>(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
