// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { normalizeNativePermissionStatus } from '../../src/utils';

describe('normalizeNativePermissionStatus', () => {
	it('normalizes android statuses', () => {
		expect(normalizeNativePermissionStatus('ShouldRequest')).toBe(
			'shouldRequest',
		);
		expect(normalizeNativePermissionStatus('ShouldExplainThenRequest')).toBe(
			'shouldExplainThenRequest',
		);
		expect(normalizeNativePermissionStatus('Granted')).toBe('granted');
		expect(normalizeNativePermissionStatus('Denied')).toBe('denied');
	});

	it('normalizes ios statuses', () => {
		expect(normalizeNativePermissionStatus('NotDetermined')).toBe(
			'shouldExplainThenRequest',
		);
		expect(normalizeNativePermissionStatus('Authorized')).toBe('granted');
		expect(normalizeNativePermissionStatus('Denied')).toBe('denied');
	});
});
