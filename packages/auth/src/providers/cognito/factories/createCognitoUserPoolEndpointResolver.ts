import { EndpointResolverOptions } from '@aws-amplify/core/internals/aws-client-utils';
import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

import { cognitoUserPoolEndpointResolver } from '../../../foundation/core/cognitoUserPoolEndpointResolver';

export const createCognitoUserPoolEndpointResolver =
	({ endpointOverride }: { endpointOverride: string | undefined }) =>
	(input: EndpointResolverOptions): { url: URL } => {
		if (endpointOverride) {
			return { url: new AmplifyUrl(endpointOverride) };
		}

		return cognitoUserPoolEndpointResolver(input);
	};
