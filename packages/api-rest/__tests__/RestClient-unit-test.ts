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
				} else if (signed_params && signed_params.data instanceof FormData) {
					res({
						data: signed_params.data.get('key') + withCredentialsSuffix,
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
import axios, { CancelTokenStatic } from 'axios';

axios.CancelToken = <CancelTokenStatic>{
	source: () => ({ token: null, cancel: null }),
};
axios.isCancel = (value: any): boolean => {
	return false;
};

let isCancelSpy = null;
let cancelTokenSpy = null;
let cancelMock = null;
let tokenMock = null;

describe('RestClient test', () => {
	beforeEach(() => {
		cancelMock = jest.fn();
		tokenMock = jest.fn();
		isCancelSpy = jest.spyOn(axios, 'isCancel').mockReturnValue(true);
		cancelTokenSpy = jest
			.spyOn(axios.CancelToken, 'source')
			.mockImplementation(() => {
				return { token: tokenMock, cancel: cancelMock };
			});
	});

	describe('ajax', () => {
		test('fetch with signed request', async () => {
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

			expect(await restClient.ajax('url', 'method', {})).toEqual('data');
		});

		test('fetch with signed failing request', async () => {
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

			expect.assertions(1);

			try {
				await restClient.ajax('url', 'method', { headers: { reject: 'true' } });
			} catch (error) {
				expect(error).toEqual({ data: 'error' });
			}
		});

		test('fetch with signed request', async () => {
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

			expect(await restClient.ajax('url', 'method', {})).toEqual('data');
		});

		test('ajax with no credentials', async () => {
			const apiOptions = {
				headers: {},
				endpoints: {},
			};

			const restClient = new RestClient(apiOptions);

			try {
				await restClient.ajax('url', 'method', {});
			} catch (e) {
				expect(e).toBe('credentials not set for API rest client ');
			}
		});

		test('ajax with extraParams', async () => {
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

			expect(await restClient.ajax('url', 'method', { body: 'body' })).toEqual(
				'data'
			);
		});

		test('ajax with formData', async () => {
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

			const formData = new FormData();
			formData.append('key', 'contents');

			expect(
				await restClient.ajax('url', 'method', { body: formData })
			).toEqual('contents');
		});

		test('ajax with custom responseType', async () => {
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
					body: 'body',
					responseType: 'blob',
				})
			).toEqual('blob');
		});

		test('ajax with Authorization header', async () => {
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
					headers: { Authorization: 'authorization' },
				})
			).toEqual('data');
		});

		test('ajax with withCredentials set to true', async () => {
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
				await restClient.ajax('url', 'method', { withCredentials: true })
			).toEqual('data-withCredentials');
		});
	});

	describe('get test', () => {
		test('happy case', async () => {
			const spyon = jest.spyOn(RestClient.prototype, 'ajax');

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

			expect.assertions(5);
			await restClient.get('url', {});

			expect(spyon.mock.calls[0][0]).toBe('url');
			expect(spyon.mock.calls[0][1]).toBe('GET');

			await restClient.get('url', { withCredentials: true });

			expect(spyon.mock.calls[1][0]).toBe('url');
			expect(spyon.mock.calls[1][1]).toBe('GET');
			expect(spyon.mock.calls[1][2]).toEqual({ withCredentials: true });

			spyon.mockClear();
		});
	});

	describe('put test', () => {
		test('happy case', async () => {
			const spyon = jest.spyOn(RestClient.prototype, 'ajax');

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

			expect.assertions(3);
			await restClient.put('url', 'data');

			expect(spyon.mock.calls[0][0]).toBe('url');
			expect(spyon.mock.calls[0][1]).toBe('PUT');
			expect(spyon.mock.calls[0][2]).toBe('data');
			spyon.mockClear();
		});
	});

	describe('patch test', () => {
		test('happy case', async () => {
			const spyon = jest.spyOn(RestClient.prototype, 'ajax');

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

			expect.assertions(3);
			await restClient.patch('url', 'data');

			expect(spyon.mock.calls[0][0]).toBe('url');
			expect(spyon.mock.calls[0][1]).toBe('PATCH');
			expect(spyon.mock.calls[0][2]).toBe('data');
			spyon.mockClear();
		});
	});

	describe('post test', () => {
		test('happy case', async () => {
			const spyon = jest.spyOn(RestClient.prototype, 'ajax');

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

			expect.assertions(3);
			await restClient.post('url', 'data');

			expect(spyon.mock.calls[0][0]).toBe('url');
			expect(spyon.mock.calls[0][1]).toBe('POST');
			expect(spyon.mock.calls[0][2]).toBe('data');
			spyon.mockClear();
		});
	});

	describe('del test', () => {
		test('happy case', async () => {
			const spyon = jest.spyOn(RestClient.prototype, 'ajax');

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

			expect.assertions(2);
			await restClient.del('url', {});

			expect(spyon.mock.calls[0][0]).toBe('url');
			expect(spyon.mock.calls[0][1]).toBe('DELETE');
			spyon.mockClear();
		});
	});

	describe('head test', () => {
		test('happy case', async () => {
			const spyon = jest.spyOn(RestClient.prototype, 'ajax');

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

			expect.assertions(2);
			await restClient.head('url', {});

			expect(spyon.mock.calls[0][0]).toBe('url');
			expect(spyon.mock.calls[0][1]).toBe('HEAD');
			spyon.mockClear();
		});
	});

	describe('endpoint test', () => {
		test('happy case', () => {
			const apiOptions = {
				headers: {},
				endpoints: [
					{
						name: 'myApi',
						endpoint: 'endpoint of myApi',
					},
					{
						name: 'otherApi',
						endpoint: 'endpoint of otherApi',
					},
				],
				credentials: {
					accessKeyId: 'accessKeyId',
					secretAccessKey: 'secretAccessKey',
					sessionToken: 'sessionToken',
				},
				region: 'myregion',
			};

			const restClient = new RestClient(apiOptions);

			expect(restClient.endpoint('myApi')).toBe('endpoint of myApi');
		});

		test('custom endpoint', () => {
			const apiOptions = {
				headers: {},
				endpoints: [
					{
						name: 'myApi',
						endpoint: 'endpoint of myApi',
					},
					{
						name: 'otherApi',
						endpoint: 'endpoint of otherApi',
						region: 'myregion',
						service: 'myservice',
					},
				],
				credentials: {
					accessKeyId: 'accessKeyId',
					secretAccessKey: 'secretAccessKey',
					sessionToken: 'sessionToken',
				},
			};

			const restClient = new RestClient(apiOptions);

			expect(restClient.endpoint('otherApi')).toBe('endpoint of otherApi');
		});
	});

	describe('Cancel Token', () => {
		const apiOptions = {
			headers: {},
			endpoints: [
				{
					name: 'myApi',
					endpoint: 'endpoint of myApi',
				},
				{
					name: 'otherApi',
					endpoint: 'endpoint of otherApi',
				},
			],
			credentials: {
				accessKeyId: 'accessKeyId',
				secretAccessKey: 'secretAccessKey',
				sessionToken: 'sessionToken',
			},
			region: 'myregion',
		};

		test('request non existent', () => {
			const restClient = new RestClient(apiOptions);
			// if the request doesn't exist we can still say it is canceled successfully
			expect(
				restClient.cancel(new Promise<any>((req, res) => {}))
			).toBeTruthy();
		});

		test('happy case', () => {
			const restClient = new RestClient(apiOptions);

			const cancellableToken = restClient.getCancellableToken();
			const request = restClient.ajax('url', 'method', { cancellableToken });
			restClient.updateRequestToBeCancellable(request, cancellableToken);

			// cancel the request
			const cancelSuccess = restClient.cancel(request, 'message');

			expect(cancelSuccess).toBeTruthy();
			expect(cancelTokenSpy).toBeCalledTimes(1);
			expect(cancelMock).toBeCalledWith('message');
		});

		test('iscancel called', () => {
			const restClient = new RestClient(apiOptions);
			restClient.isCancel({});
			expect(isCancelSpy).toHaveBeenCalledTimes(1);
		});
	});
});
