// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveConfig } from '../../../../src/providers/cloudwatch/utils';

// TODO: Update when function is updated to use actual configuration
describe('CloudWatch Logging utils: resolveConfig()', () => {
	it('returns required config', () => {
		expect(resolveConfig()).toStrictEqual({ region: '<region>', });
	});
});
