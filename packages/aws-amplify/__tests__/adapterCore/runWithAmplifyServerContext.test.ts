// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { runWithAmplifyServerContext } from '../../src/adapter-core';

describe('runWithAmplifyServerContext', () => {
	it('should throw indicating the function is deprecated', () => {
		expect(() => runWithAmplifyServerContext({})).toThrow(
			'runWithAmplifyServerContext is no longer supported. Use configure() to create an AmplifyContext instead.',
		);
	});
});
