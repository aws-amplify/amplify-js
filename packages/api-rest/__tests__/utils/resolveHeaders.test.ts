// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveHeaders } from '../../src/utils/resolveHeaders';

describe('resolveHeaders', () => {
	describe('content-type handling without body', () => {
		it('should not set content-type when no body is provided', () => {
			const headers = { 'x-custom': 'value' };
			const result = resolveHeaders(headers);

			expect(result).toEqual({ 'x-custom': 'value' });
			expect(result['content-type']).toBeUndefined();
		});
	});

	describe('content-type handling with body', () => {
		it('should set default content-type when no content-type header exists', () => {
			const headers = { 'x-custom': 'value' };
			const body = { data: 'test' };

			const result = resolveHeaders(headers, body);

			expect(result).toEqual({
				'x-custom': 'value',
				'content-type': 'application/json; charset=UTF-8',
			});
		});

		it('should preserve existing application/json with charset', () => {
			const headers = { 'Content-Type': 'application/json; charset=utf-8' };
			const body = { data: 'test' };

			const result = resolveHeaders(headers, body);

			expect(result['content-type']).toBe('application/json; charset=utf-8');
		});

		it('should preserve +json content-type', () => {
			const headers = { 'Content-Type': 'application/json-patch+json' };
			const body = { data: 'test' };

			const result = resolveHeaders(headers, body);

			expect(result['content-type']).toBe('application/json-patch+json');
		});

		it('should override non-json content-type with default content-type', () => {
			const headers = { 'Content-Type': 'text/plain' };
			const body = { data: 'test' };

			const result = resolveHeaders(headers, body);

			expect(result['content-type']).toBe('application/json; charset=UTF-8');
		});

		it('should remove content-type when body is FormData', () => {
			const headers = { 'Content-Type': 'application/json' };
			const formData = new FormData();
			formData.append('field', 'value');

			const result = resolveHeaders(headers, formData);

			expect(result['content-type']).toBeUndefined();
		});
	});
});
