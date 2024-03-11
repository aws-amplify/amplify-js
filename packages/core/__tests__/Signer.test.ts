// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SignRequestOptions } from '../src/clients/middleware/signing/signer/signatureV4/types';
import { Signer } from '../src/Signer';
import { DateUtils } from '../src/Signer/DateUtils';
import * as getSignatureModule from '../src/clients/middleware/signing/signer/signatureV4/utils/getSignature';

import {
	credentials,
	credentialsWithToken,
	getDefaultRequest,
	signingDate,
	signingOptions,
	signingRegion,
	signingService,
	url,
} from './clients/middleware/signing/signer/signatureV4/testUtils/data';
import { signingTestTable } from './clients/middleware/signing/signer/signatureV4/testUtils/signingTestTable';

const getDateSpy = jest.spyOn(DateUtils, 'getDateWithClockOffset');
const getSignatureSpy = jest.spyOn(getSignatureModule, 'getSignature');

describe('Signer.sign', () => {
	beforeAll(() => {
		getDateSpy.mockReturnValue(signingDate);
	});

	test.each(
		signingTestTable.map(
			({ name, request, queryParams, options, expectedAuthorization }) => {
				const updatedRequest = {
					...getDefaultRequest(),
					...request,
				};
				queryParams?.forEach(([key, value]) => {
					updatedRequest.url?.searchParams.append(key, value);
				});
				const updatedOptions: SignRequestOptions = {
					...signingOptions,
					...options,
				};

				return [name, updatedRequest, updatedOptions, expectedAuthorization];
			},
		),
	)(
		'signs request with %s',
		(
			_,
			{ url, ...request },
			{ credentials, signingRegion, signingService },
			expected,
		) => {
			const { accessKeyId, secretAccessKey, sessionToken } = credentials;
			const accessInfo = {
				access_key: accessKeyId,
				secret_key: secretAccessKey,
				session_token: sessionToken,
			};
			const serviceInfo = {
				region: signingRegion,
				service: signingService,
			};
			const signedRequest = Signer.sign(
				{ ...request, url: url.toString() },
				accessInfo as any,
				serviceInfo as any,
			);
			expect(signedRequest.headers?.Authorization).toBe(expected);
		},
	);

	describe('Error handling', () => {
		const { accessKeyId, secretAccessKey, sessionToken } = credentials;
		const accessInfo = {
			access_key: accessKeyId,
			secret_key: secretAccessKey,
			session_token: sessionToken,
		};
		const serviceInfo = {
			region: signingRegion,
			service: signingService,
		};

		test('should throw an Error if body attribute is passed to sign method', () => {
			const request = {
				...getDefaultRequest(),
				body: 'foo',
				url,
			};

			expect(() => {
				Signer.sign(request, accessInfo as any, serviceInfo as any);
			}).toThrow();
		});

		test('should not throw an Error if data attribute is passed to sign method', () => {
			const request = {
				...getDefaultRequest(),
				data: 'foo',
				url,
			};

			expect(() => {
				Signer.sign(request, accessInfo as any, serviceInfo as any);
			}).not.toThrow();
		});
	});

	test('should populate signing region and service from url', () => {
		const request = {
			...getDefaultRequest(),
			url: new URL('https://foo.us-east-1.amazonaws.com'),
		};
		const accessInfo = {
			access_key: credentials.accessKeyId,
			secret_key: credentials.secretAccessKey,
			session_token: credentials.sessionToken,
		};
		const {
			headers: { Authorization },
		} = Signer.sign(request as any, accessInfo as any, undefined as any);
		expect(Authorization).toEqual(
			expect.stringContaining(
				'Credential=access-key-id/20200918/us-east-1/foo/aws4_request',
			),
		);
	});
});

describe('Signer.signUrl', () => {
	beforeAll(() => {
		getDateSpy.mockReturnValue(signingDate);
	});

	test.each(
		signingTestTable.map(
			({ name, request, queryParams, options, expectedUrl }) => {
				const updatedRequest = {
					...getDefaultRequest(),
					...request,
				};
				queryParams?.forEach(([key, value]) => {
					updatedRequest.url?.searchParams.append(key, value);
				});
				const updatedOptions: SignRequestOptions = {
					...signingOptions,
					...options,
				};

				return [name, updatedRequest, updatedOptions, expectedUrl];
			},
		),
	)(
		'signs url with %s',
		(
			_,
			{ url, ...request },
			{ credentials, signingRegion, signingService },
			expected,
		) => {
			const { accessKeyId, secretAccessKey, sessionToken } = credentials;
			const accessInfo = {
				access_key: accessKeyId,
				secret_key: secretAccessKey,
				session_token: sessionToken,
			};
			const serviceInfo = {
				region: signingRegion,
				service: signingService,
			};
			const signedUrl = Signer.signUrl(
				{ ...request, url: url.toString() },
				accessInfo,
				serviceInfo as any,
			);
			expect(signedUrl).toBe(expected);
		},
	);

	test('should populate signing region and service from url', () => {
		const request = {
			...getDefaultRequest(),
			url: new URL('https://foo.us-east-1.amazonaws.com'),
		};
		const accessInfo = {
			access_key: credentials.accessKeyId,
			secret_key: credentials.secretAccessKey,
			session_token: credentials.sessionToken,
		};
		const signedUrl = Signer.signUrl(request, accessInfo);
		expect(signedUrl).toEqual(
			expect.stringContaining(
				'X-Amz-Credential=access-key-id%2F20200918%2Fus-east-1%2Ffoo%2Faws4_request',
			),
		);
	});

	test('should not use session token in signature for IoT gateway service', () => {
		const request = {
			...getDefaultRequest(),
			url: new URL('https://abc-ats.iot.us-foo-1.amazonaws.com'),
		};
		const accessInfo = {
			access_key: credentialsWithToken.accessKeyId,
			secret_key: credentialsWithToken.secretAccessKey,
			session_token: credentialsWithToken.sessionToken,
		};
		const serviceInfo = {
			region: 'us-foo-1',
			service: 'iotdevicegateway',
		};
		const signedUrl = Signer.signUrl(request, accessInfo, serviceInfo);
		expect(signedUrl).toEqual(expect.stringContaining('X-Amz-Security-Token'));
		expect(getSignatureSpy).toBeCalledWith(
			expect.anything(),
			expect.objectContaining({ sessionToken: undefined }),
		);
	});
});
