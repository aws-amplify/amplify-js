import { ServiceClientFactoryInput } from '../../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';

export const mockServiceClientAPIConfig: ServiceClientFactoryInput = {
	endpointResolver: jest.fn() as jest.MockedFunction<
		ServiceClientFactoryInput['endpointResolver']
	>,
};
