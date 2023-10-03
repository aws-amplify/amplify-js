// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	APIG_HOSTNAME_PATTERN,
	DEFAULT_IAM_SIGNING_REGION,
	DEFAULT_REST_IAM_SIGNING_SERVICE,
} from './constants';

/**
 * Infer the signing service and region from the given URL, and for REST API only, from the Amplify configuration.
 * It supports raw API Gateway endpoint and AppSync endpoint.
 *
 * @internal
 */
export const parseSigningInfo = (
	url: URL,
	restApiOptions?: {
		amplify: AmplifyClassV6;
		apiName: string;
	}
) => {
	const {
		service: signingService = DEFAULT_REST_IAM_SIGNING_SERVICE,
		region: signingRegion = DEFAULT_IAM_SIGNING_REGION,
	} =
		restApiOptions?.amplify.getConfig()?.API?.REST?.[restApiOptions?.apiName] ??
		{};
	const { hostname } = url;
	const [, service, region] = APIG_HOSTNAME_PATTERN.exec(hostname) ?? [];
	if (service === DEFAULT_REST_IAM_SIGNING_SERVICE) {
		// The configured endpoint is an API Gateway endpoint
		// @see: https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-call-api.html
		return {
			service,
			region: region ?? signingRegion,
		};
	} else if (service === 'appsync-api') {
		// AppSync endpoint is internally supported because GraphQL operation will send request using POST handler.
		// example: https://xxxx.appsync-api.us-east-1.amazonaws.com/graphql
		return {
			service: 'appsync',
			region: region ?? signingRegion,
		};
	} else {
		return {
			service: signingService,
			region: signingRegion,
		};
	}
};
