// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { parseSigningInfo } from '../../src/utils';

describe('parseSigningInfo', () => {
	it.each([
		[
			'https://abc.execute-api.us-west-2.amazonaws.com/prod',
			'execute-api',
			'us-west-2',
		],
		[
			'https://abc.execute-api.cn-north-1.amazonaws.com.cn/prod',
			'execute-api',
			'cn-north-1',
		],
		[
			'https://abc.appsync-api.eu-west-1.amazonaws.com/graphql',
			'appsync',
			'eu-west-1',
		],
	])('infers signing info from %s', (url, service, region) => {
		expect(parseSigningInfo(new URL(url))).toEqual({ service, region });
	});

	it('does not match hosts that only start with an API Gateway hostname', () => {
		expect(
			parseSigningInfo(
				new URL(
					'https://abc.execute-api.us-west-2.amazonaws.com.other.example/x',
				),
			),
		).toEqual({ service: 'execute-api', region: 'us-east-1' });
	});
});
