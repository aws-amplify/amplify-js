// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { EndpointResolverOptions } from '@aws-amplify/core/internals/aws-client-utils';
import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

import { cognitoUserPoolEndpointResolver } from '../../../foundation/cognitoUserPoolEndpointResolver';

export const createCognitoUserPoolEndpointResolver =
	({ endpointOverride }: { endpointOverride: string | undefined }) =>
	(input: EndpointResolverOptions): { url: URL } => {
		if (endpointOverride) {
			return { url: new AmplifyUrl(endpointOverride) };
		}

		return cognitoUserPoolEndpointResolver(input);
	};
