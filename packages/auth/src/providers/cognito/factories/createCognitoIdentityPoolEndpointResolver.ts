// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { cognitoIdentityPoolEndpointResolver } from '@aws-amplify/core';
import { EndpointResolverOptions } from '@aws-amplify/core/internals/aws-client-utils';
import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

export const createCognitoIdentityPoolEndpointResolver =
	({ endpointOverride }: { endpointOverride: string | undefined }) =>
	(input: EndpointResolverOptions): { url: URL } => {
		if (endpointOverride) {
			return { url: new AmplifyUrl(endpointOverride) };
		}

		return cognitoIdentityPoolEndpointResolver(input);
	};
