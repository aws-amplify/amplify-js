// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpRequest } from '@aws-amplify/core/internals/aws-client-utils';

import {
	isIamAuthApplicableForGraphQL,
	isIamAuthApplicableForRest,
} from '../../src/utils/isIamAuthApplicable';

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
			expect(
				isIamAuthApplicableForGraphQL(baseRequest, signingServiceInfo),
			).toBe(true);
		});

		it('should return false if there is an authorization header', () => {
			const request = {
				...baseRequest,
				headers: { authorization: 'SampleToken' },
			};
			const signingServiceInfo = {};
			expect(isIamAuthApplicableForGraphQL(request, signingServiceInfo)).toBe(
				false,
			);
		});

		it('should return false if there is an x-api-key header', () => {
			const request = { ...baseRequest, headers: { 'x-api-key': 'key' } };
			const signingServiceInfo = {};
			expect(isIamAuthApplicableForGraphQL(request, signingServiceInfo)).toBe(
				false,
			);
		});

		it('should return false if signingServiceInfo is not provided', () => {
			expect(isIamAuthApplicableForGraphQL(baseRequest)).toBe(false);
		});
	});

	describe('iamAuthApplicableForPublic', () => {
		it('should return true if there is no authorization header and signingServiceInfo is provided', () => {
			const signingServiceInfo = {};
			expect(isIamAuthApplicableForRest(baseRequest, signingServiceInfo)).toBe(
				true,
			);
		});

		it('should return false if there is an authorization header', () => {
			const request = {
				...baseRequest,
				headers: { authorization: 'SampleToken' },
			};
			const signingServiceInfo = {};
			expect(isIamAuthApplicableForRest(request, signingServiceInfo)).toBe(
				false,
			);
		});

		it('should return false if signingServiceInfo is not provided', () => {
			expect(isIamAuthApplicableForRest(baseRequest)).toBe(false);
		});
	});
});
