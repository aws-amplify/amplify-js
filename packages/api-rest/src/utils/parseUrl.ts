// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	APIG_HOSTNAME_PATTERN,
	DEFAULT_IAM_SIGNING_REGION,
	DEFAULT_REST_IAM_SIGNING_SERVICE,
} from './constants';

/**
 * Infer the signing service and region from the given URL. It supports raw API Gateway endpoint and AppSync endpoint.
 * Custom domain is not supported.
 *
 * @internal
 */
export const parseUrl = (url: URL) => {
	const { hostname } = url;
	const [, service, region] = APIG_HOSTNAME_PATTERN.exec(hostname) ?? [];
	if (service === DEFAULT_REST_IAM_SIGNING_SERVICE) {
		// The configured endpoint is an API Gateway endpoint
		// @see: https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-call-api.html
		return {
			service,
			region,
		};
	} else if (service === 'appsync-api') {
		// AppSync endpoint is internally supported because GraphQL operation will send request using POST handler.
		// example: https://xxxx.appsync-api.us-east-1.amazonaws.com/graphql
		return {
			service: 'appsync',
			region,
		};
	} else {
		return {
			service: DEFAULT_REST_IAM_SIGNING_SERVICE,
			region: DEFAULT_IAM_SIGNING_REGION,
		};
	}
};
