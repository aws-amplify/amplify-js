import { AmplifyUrl } from '@aws-amplify/core/internals/utils';
import { cognitoIdentityPoolEndpointResolver } from '@aws-amplify/core';

import { createCognitoIdentityPoolEndpointResolver } from '../../../../src/providers/cognito/factories/createCognitoIdentityPoolEndpointResolver';

jest.mock('@aws-amplify/core');

const mockCognitoIdentityPoolEndpointResolver = jest.mocked(
	cognitoIdentityPoolEndpointResolver,
);

describe('createCognitoIdentityPoolEndpointResolver()', () => {
	afterEach(() => {
		mockCognitoIdentityPoolEndpointResolver.mockClear();
	});

	describe('creating a resolver with overrideEndpoint as `undefined`', () => {
		const resolver = createCognitoIdentityPoolEndpointResolver({
			endpointOverride: undefined,
		});

		it('invokes cognitoUserPoolEndpointResolver with the expected region', () => {
			const expectedReturningUrl = {
				url: new AmplifyUrl(
					'https://cognito-identity.us-west-2.amazonaws.com/',
				),
			};
			mockCognitoIdentityPoolEndpointResolver.mockReturnValueOnce(
				expectedReturningUrl,
			);

			const expectedRegion = 'us-west-2';
			const { url } = resolver({ region: expectedRegion });

			expect(mockCognitoIdentityPoolEndpointResolver).toHaveBeenCalledWith({
				region: expectedRegion,
			});
			expect(url).toStrictEqual(expectedReturningUrl.url);
		});
	});

	describe('creating a resolver with overrideEndpoint', () => {
		const endpointOverride = 'https://cognito-identity.example.com';
		const resolver = createCognitoIdentityPoolEndpointResolver({
			endpointOverride,
		});

		it('returns the endpoint override', () => {
			const expectedRegion = 'us-west-2';
			const { url } = resolver({ region: expectedRegion });
			expect(mockCognitoIdentityPoolEndpointResolver).not.toHaveBeenCalled();
			expect(url).toStrictEqual(
				new AmplifyUrl('https://cognito-identity.example.com'),
			);
		});
	});
});
