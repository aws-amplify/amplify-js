// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EndpointResolverOptions, getDnsSuffix } from '../../../../clients';
import { AmplifyUrl } from '../../../../libraryUtils';

import { COGNITO_IDENTITY_SERVICE_NAME } from './constants';

export const cognitoIdentityPoolEndpointResolver = ({
	region,
}: EndpointResolverOptions) => ({
	url: new AmplifyUrl(
		`https://${COGNITO_IDENTITY_SERVICE_NAME}.${region}.${getDnsSuffix(region)}`,
	),
});
