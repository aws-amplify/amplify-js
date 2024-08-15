import {
	EndpointResolverOptions,
	getDnsSuffix,
} from '@aws-amplify/core/internals/aws-client-utils';
import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

import { COGNITO_IDP_SERVICE_NAME } from './constants';

export const cognitoUserPoolEndpointResolver = ({
	region,
}: EndpointResolverOptions): { url: URL } => ({
	url: new AmplifyUrl(
		`https://${COGNITO_IDP_SERVICE_NAME}.${region}.${getDnsSuffix(region)}`,
	),
});
