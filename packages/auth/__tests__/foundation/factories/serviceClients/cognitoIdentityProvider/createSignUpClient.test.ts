import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from '../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/constants';
import { createSignUpClient } from '../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createSignUpClientDeserializer } from '../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/createSignUpClient';
import { AuthError } from '../../../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../../../src/errors/types/validation';
import { validationErrorMap } from '../../../../../src/common/AuthErrorStrings';

import {
	mockServiceClientAPIConfig,
	mockSignUpClientEmptySignUpPasswordResponse,
} from './testUtils/data';

jest.mock('@aws-amplify/core/internals/aws-client-utils/composers', () => ({
	...jest.requireActual(
		'@aws-amplify/core/internals/aws-client-utils/composers',
	),
	composeServiceApi: jest.fn(),
}));

describe('createSignUpClient', () => {
	const mockComposeServiceApi = jest.mocked(composeServiceApi);

	it('factory should invoke composeServiceApi with expected parameters', () => {
		createSignUpClient(mockServiceClientAPIConfig);

		expect(mockComposeServiceApi).toHaveBeenCalledWith(
			expect.any(Function),
			expect.any(Function),
			expect.any(Function),
			expect.objectContaining({
				...DEFAULT_SERVICE_CLIENT_API_CONFIG,
				...mockServiceClientAPIConfig,
			}),
		);
	});

	it('createSignUpDeserializer should throw expected error when', () => {
		const deserializer = createSignUpClientDeserializer();

		expect(
			deserializer(mockSignUpClientEmptySignUpPasswordResponse),
		).rejects.toThrow(
			new AuthError({
				name: AuthValidationErrorCode.EmptySignUpPassword,
				message:
					validationErrorMap[AuthValidationErrorCode.EmptySignUpPassword]
						.message,
			}),
		);
	});
});
