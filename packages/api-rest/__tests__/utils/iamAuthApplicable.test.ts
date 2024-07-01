// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpRequest } from '@aws-amplify/core/internals/aws-client-utils';

import {
	iamAuthApplicableForGraphQL,
	iamAuthApplicableForPublic,
} from '../../src/utils/iamAuthApplicable';

describe('iamAuthApplicable', () => {
	const url = new URL('https://url');
	const baseRequest: HttpRequest = {
		headers: {},
		url,
		method: 'put',
	};

	describe('iamAuthApplicableForGraphQL', () => {
		it('should return true if there is no authorization header, no x-api-key header, and signingServiceInfo is provided', () => {
			const signingServiceInfo = {};
			expect(iamAuthApplicableForGraphQL(baseRequest, signingServiceInfo)).toBe(
				true,
			);
		});

		it('should return false if there is an authorization header', () => {
			const request = {
				...baseRequest,
				headers: { authorization: 'SampleToken' },
			};
			const signingServiceInfo = {};
			expect(iamAuthApplicableForGraphQL(request, signingServiceInfo)).toBe(
				false,
			);
		});

		it('should return false if there is an x-api-key header', () => {
			const request = { ...baseRequest, headers: { 'x-api-key': 'key' } };
			const signingServiceInfo = {};
			expect(iamAuthApplicableForGraphQL(request, signingServiceInfo)).toBe(
				false,
			);
		});

		it('should return false if signingServiceInfo is not provided', () => {
			expect(iamAuthApplicableForGraphQL(baseRequest)).toBe(false);
		});
	});

	describe('iamAuthApplicableForPublic', () => {
		it('should return true if there is no authorization header and signingServiceInfo is provided', () => {
			const signingServiceInfo = {};
			expect(iamAuthApplicableForPublic(baseRequest, signingServiceInfo)).toBe(
				true,
			);
		});

		it('should return false if there is an authorization header', () => {
			const request = {
				...baseRequest,
				headers: { authorization: 'SampleToken' },
			};
			const signingServiceInfo = {};
			expect(iamAuthApplicableForPublic(request, signingServiceInfo)).toBe(
				false,
			);
		});

		it('should return false if signingServiceInfo is not provided', () => {
			expect(iamAuthApplicableForPublic(baseRequest)).toBe(false);
		});
	});
});
