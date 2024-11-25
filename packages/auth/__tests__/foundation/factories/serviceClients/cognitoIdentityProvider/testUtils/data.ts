import { HttpResponse } from '@aws-amplify/core/internals/aws-client-utils';

import { ServiceClientFactoryInput } from '../../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';

export const mockServiceClientAPIConfig: ServiceClientFactoryInput = {
	endpointResolver: jest.fn() as jest.MockedFunction<
		ServiceClientFactoryInput['endpointResolver']
	>,
};

export const mockSignUpClientEmptySignUpPasswordResponse: HttpResponse = {
	statusCode: 400,
	body: {
		json: () =>
			Promise.resolve({
				message:
					"1 validation error detected: Value at 'password'failed to satisfy constraint: Member must not be null",
			}),
		blob: () => Promise.resolve(new Blob()),
		text: () => Promise.resolve(''),
	},
	headers: {
		'x-amzn-errortype': 'InvalidParameterException',
	},
};
