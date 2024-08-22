import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

import { createUserPoolSerializer } from '../../../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/shared/serde/createUserPoolSerializer';

describe('createUserPoolSerializer created request serializer', () => {
	test.each(['SignUp', 'InitiateAuth', 'RevokeToken'] as const)(
		`it serializes requests from operation %s`,
		operation => {
			const testInput = { testBody: 'testBody' };
			const testEndpoint = {
				url: new AmplifyUrl('http://test.com'),
			};
			const serializer = createUserPoolSerializer(operation);
			const result = serializer(testInput, testEndpoint);

			expect(result).toEqual({
				method: 'POST',
				url: testEndpoint.url,
				headers: {
					'content-type': 'application/x-amz-json-1.1',
					'x-amz-target': `AWSCognitoIdentityProviderService.${operation}`,
				},
				body: JSON.stringify(testInput),
			});
		},
	);
});
