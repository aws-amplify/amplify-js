// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AMPLIFY_CONTEXT_BRAND, isAmplifyContext } from '@aws-amplify/core';

describe('isAmplifyContext', () => {
	it('returns true for branded context', () => {
		const ctx = { [AMPLIFY_CONTEXT_BRAND]: true };
		expect(isAmplifyContext(ctx)).toBe(true);
	});

	it('returns false for null', () => {
		expect(isAmplifyContext(null)).toBe(false);
	});

	it('returns false for undefined', () => {
		expect(isAmplifyContext(undefined)).toBe(false);
	});

	it('returns false for non-object', () => {
		expect(isAmplifyContext('string')).toBe(false);
		expect(isAmplifyContext(123)).toBe(false);
	});

	it('returns false for object without brand', () => {
		expect(isAmplifyContext({})).toBe(false);
	});
});
