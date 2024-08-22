import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

import { cognitoUserPoolEndpointResolver } from '../../../../src/foundation/cognitoUserPoolEndpointResolver';
import { createCognitoUserPoolEndpointResolver } from '../../../../src/providers/cognito/factories/createCognitoUserPoolEndpointResolver';

jest.mock('../../../../src/foundation/cognitoUserPoolEndpointResolver');

const mockCognitoUserPoolEndpointResolver = jest.mocked(
	cognitoUserPoolEndpointResolver,
);

describe('createCognitoUserPoolEndpointResolver()', () => {
	afterEach(() => {
		mockCognitoUserPoolEndpointResolver.mockClear();
	});

	describe('creating a resolver with overrideEndpoint as `undefined`', () => {
		const resolver = createCognitoUserPoolEndpointResolver({
			endpointOverride: undefined,
		});

		it('invokes cognitoUserPoolEndpointResolver with the expected region', () => {
			const expectedReturningUrl = {
				url: new AmplifyUrl('https://cognito-idp.us-west-2.amazonaws.com/'),
			};
			mockCognitoUserPoolEndpointResolver.mockReturnValueOnce(
				expectedReturningUrl,
			);

			const expectedRegion = 'us-west-2';
			const { url } = resolver({ region: expectedRegion });

			expect(mockCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
				region: expectedRegion,
			});
			expect(url).toStrictEqual(expectedReturningUrl.url);
		});
	});

	describe('creating a resolver with overrideEndpoint', () => {
		const endpointOverride = 'https://cognito-idp.example.com';
		const resolver = createCognitoUserPoolEndpointResolver({
			endpointOverride,
		});

		it('returns the endpoint override', () => {
			const expectedRegion = 'us-west-2';
			const { url } = resolver({ region: expectedRegion });
			expect(mockCognitoUserPoolEndpointResolver).not.toHaveBeenCalled();
			expect(url).toStrictEqual(
				new AmplifyUrl('https://cognito-idp.example.com'),
			);
		});
	});
});
