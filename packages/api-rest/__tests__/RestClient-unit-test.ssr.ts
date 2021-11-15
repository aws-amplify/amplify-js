/**
 * @jest-environment node
 */

import { Signer } from '@aws-amplify/core';

jest
	.spyOn(Signer, 'sign')
	.mockImplementation(
		(request: any, access_info: any, service_info?: any) => request
	);

jest.mock('axios', () => {
	return {
		default: (signed_params) => {
			return new Promise((res, rej) => {
				const withCredentialsSuffix =
					signed_params && signed_params.withCredentials
						? '-withCredentials'
						: '';
				if (
					signed_params &&
					signed_params.headers &&
					signed_params.headers.reject
				) {
					rej({
						data: 'error' + withCredentialsSuffix,
					});
				} else if (signed_params && signed_params.responseType === 'blob') {
					res({
						data: 'blob' + withCredentialsSuffix,
					});
				} else {
					res({
						data: 'data' + withCredentialsSuffix,
					});
				}
			});
		},
	};
});

import { RestClient } from '../src/RestClient';

describe('RestClient test', () => {
	test('should not perform FormData check in Node', async () => {
		const apiOptions = {
			headers: {},
			endpoints: {},
			credentials: {
				accessKeyId: 'accessKeyId',
				secretAccessKey: 'secretAccessKey',
				sessionToken: 'sessionToken',
			},
		};

		const restClient = new RestClient(apiOptions);

		expect(
			await restClient.ajax('url', 'method', {
				body: 'data',
			})
		).toEqual('data');
	});
});
