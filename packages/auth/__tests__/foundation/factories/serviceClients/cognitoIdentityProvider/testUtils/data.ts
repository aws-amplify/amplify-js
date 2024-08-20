import { ServiceClientAPIConfig } from '../../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types/ServiceClient';

export const mockServiceClientAPIConfig: ServiceClientAPIConfig = {
	endpointResolver: jest.fn() as jest.MockedFunction<
		ServiceClientAPIConfig['endpointResolver']
	>,
};
