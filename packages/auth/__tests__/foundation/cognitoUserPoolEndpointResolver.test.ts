import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

import { cognitoUserPoolEndpointResolver } from '../../src/foundation/cognitoUserPoolEndpointResolver';
import { COGNITO_IDP_SERVICE_NAME } from '../../src/foundation/constants';

describe('cognitoUserPoolEndpointResolver', () => {
	it('should return the Cognito User Pool endpoint', () => {
		const region = 'us-west-2';
		const { url } = cognitoUserPoolEndpointResolver({ region });

		expect(url instanceof AmplifyUrl).toBe(true);
		expect(url.toString()).toEqual(
			`https://${COGNITO_IDP_SERVICE_NAME}.us-west-2.amazonaws.com/`,
		);
	});
});
