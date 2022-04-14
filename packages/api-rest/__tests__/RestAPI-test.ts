import axios, { CancelTokenStatic } from 'axios';
import { RestAPIClass as API } from '../src/';
import { RestClient } from '../src/RestClient';
import { Signer, Credentials, DateUtils } from '@aws-amplify/core';

jest.mock('axios');

axios.CancelToken = <CancelTokenStatic>{
	source: () => ({ token: null, cancel: null }),
};

let cancelTokenSpy = null;
let cancelMock = null;
let tokenMock = null;

const config = {
	API: {
		endpoints: [
			{
				name: 'apiName',
				endpoint: 'endpoint',
				region: 'region',
				service: 'execute-api',
			},
		],
	},
};

afterEach(() => {
	jest.restoreAllMocks();
});

describe('Rest API test', () => {
	beforeEach(() => {
		cancelMock = jest.fn();
		tokenMock = jest.fn();
		cancelTokenSpy = jest
			.spyOn(axios.CancelToken, 'source')
			.mockImplementation(() => {
				return { token: tokenMock, cancel: cancelMock };
			});
	});

	const aws_cloud_logic_custom = [
		{
			id: 'lh3s27sl16',
			name: 'todosCRUD',
			description: '',
			endpoint:
				'https://lh3s27sl16.execute-api.us-east-1.amazonaws.com/Development',
			region: 'us-east-1',
			paths: ['/todos', '/todos/123'],
		},
		{
			name: 'apiName',
			description: '',
			endpoint: 'endpoint',
			region: 'us-east-1',
			paths: ['/todos', '/todos/123'],
		},
	];

	describe('configure test', () => {
		test('without aws_project_region', () => {
			const api = new API({});

			const options = {
				myoption: 'myoption',
			};

			expect(api.configure(options)).toEqual({
				endpoints: [],
				myoption: 'myoption',
			});
		});

		test('with aws_project_region', () => {
			const api = new API({});

			const options = {
				aws_project_region: 'region',
				aws_cloud_logic_custom,
			};

			expect(api.configure(options)).toEqual({
				aws_cloud_logic_custom,
				aws_project_region: 'region',
				endpoints: aws_cloud_logic_custom,
				header: {},
				region: 'region',
			});
		});

		test('with API options', () => {
			const api = new API({});

			const options = {
				API: {
					aws_project_region: 'api-region',
				},
				aws_project_region: 'region',
				aws_appsync_region: 'appsync-region',
				aws_cloud_logic_custom,
			};

			expect(api.configure(options)).toEqual({
				aws_cloud_logic_custom,
				aws_project_region: 'api-region',
				aws_appsync_region: 'appsync-region',
				endpoints: aws_cloud_logic_custom,
				header: {},
				region: 'api-region',
			});
		});
	});

	describe('get test', () => {
		test('happy case', async () => {
			const api = new API({});
			api.configure(config);

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});
			const spyon2 = jest
				.spyOn(RestClient.prototype, 'get')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			await api.get('apiName', 'path', { init: 'init' });

			expect(spyon2).toBeCalledWith(
				{
					custom_header: undefined,
					endpoint: 'endpointpath',
					region: 'region',
					service: 'execute-api',
				},
				{
					init: 'init',
					cancellableToken: { cancel: cancelMock, token: tokenMock },
				}
			);
		});

		test('custom_header', async () => {
			const custom_config = {
				API: {
					endpoints: [
						{
							name: 'apiName',
							endpoint: 'https://www.amazonaws.com',
							custom_header: () => {
								return { Authorization: 'mytoken' };
							},
						},
					],
				},
			};
			const api = new API({});
			api.configure(custom_config);
			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});

			const spyonRequest = jest
				.spyOn(RestClient.prototype as any, '_request')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res({});
					});
				});
			await api.get('apiName', 'path', {});

			expect(spyonRequest).toBeCalledWith(
				{
					data: null,
					headers: { Authorization: 'mytoken' },
					host: 'www.amazonaws.compath',
					method: 'GET',
					path: '/',
					responseType: 'json',
					signerServiceInfo: undefined,
					url: 'https://www.amazonaws.compath/',
					timeout: 0,
					cancelToken: tokenMock,
				},
				undefined
			);
		});

		test('non-default timeout', async () => {
			const resp = { data: [{ name: 'Bob' }] };

			const options = {
				aws_project_region: 'region',
				aws_cloud_logic_custom,
			};

			const api = new API({});
			api.configure(options);

			const creds = {
				secretAccessKey: 'secret',
				accessKeyId: 'access',
				sessionToken: 'token',
			};

			const creds2 = {
				secret_key: 'secret',
				access_key: 'access',
				session_token: 'token',
			};

			const spyon = jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return new Promise((res, rej) => {
					res(creds);
				});
			});

			const spyonSigner = jest
				.spyOn(Signer, 'sign')
				.mockImplementationOnce(() => {
					return { headers: {} };
				});

			const spyAxios = jest
				.spyOn(axios as any, 'default')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res(resp);
					});
				});

			const init = {
				timeout: 2500,
			};
			await api.get('apiName', '/items', init);
			const expectedParams = {
				data: null,
				headers: {},
				host: undefined,
				method: 'GET',
				path: '/',
				responseType: 'json',
				url: 'endpoint/items',
				timeout: 2500,
				cancelToken: tokenMock,
			};
			expect(spyonSigner).toBeCalledWith(expectedParams, creds2, {
				region: 'us-east-1',
				service: 'execute-api',
			});
		});

		test('query-string on init', async () => {
			const resp = { data: [{ name: 'Bob' }] };

			const options = {
				aws_project_region: 'region',
				aws_cloud_logic_custom,
			};

			const api = new API({});
			api.configure(options);

			const creds = {
				secretAccessKey: 'secret',
				accessKeyId: 'access',
				sessionToken: 'token',
			};

			const creds2 = {
				secret_key: 'secret',
				access_key: 'access',
				session_token: 'token',
			};

			const spyon = jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return new Promise((res, rej) => {
					res(creds);
				});
			});

			const spyonSigner = jest
				.spyOn(Signer, 'sign')
				.mockImplementationOnce(() => {
					return { headers: {} };
				});

			const spyAxios = jest
				.spyOn(axios as any, 'default')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res(resp);
					});
				});

			const init = {
				queryStringParameters: {
					'ke:y3': 'val:ue 3',
				},
			};
			await api.get('apiName', '/items', init);
			const expectedParams = {
				data: null,
				headers: {},
				host: undefined,
				method: 'GET',
				path: '/',
				responseType: 'json',
				url: 'endpoint/items?ke%3Ay3=val%3Aue%203',
				timeout: 0,
				cancelToken: tokenMock,
			};
			expect(spyonSigner).toBeCalledWith(expectedParams, creds2, {
				region: 'us-east-1',
				service: 'execute-api',
			});
		});

		test('query-string on init-custom-auth', async () => {
			const resp = { data: [{ name: 'Bob' }] };

			const options = {
				aws_project_region: 'region',
				aws_cloud_logic_custom,
			};

			const api = new API({});
			api.configure(options);

			const creds = {
				secretAccessKey: 'secret',
				accessKeyId: 'access',
				sessionToken: 'token',
			};

			const creds2 = {
				secret_key: 'secret',
				access_key: 'access',
				session_token: 'token',
			};

			const spyon = jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return new Promise((res, rej) => {
					res(creds);
				});
			});

			const spyonRequest = jest
				.spyOn(RestClient.prototype as any, '_request')
				.mockImplementationOnce(() => {
					return { headers: {} };
				});

			const spyAxios = jest
				.spyOn(axios as any, 'default')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res(resp);
					});
				});

			const init = {
				queryStringParameters: {
					'ke:y3': 'val:ue 3',
				},
				headers: {
					Authorization: 'apikey',
				},
			};
			await api.get('apiName', '/items', init);
			const expectedParams = {
				data: null,
				headers: { Authorization: 'apikey' },
				host: undefined,
				method: 'GET',
				path: '/',
				responseType: 'json',
				signerServiceInfo: undefined,
				url: 'endpoint/items?ke%3Ay3=val%3Aue%203',
				timeout: 0,
				cancelToken: tokenMock,
			};
			expect(spyonRequest).toBeCalledWith(expectedParams, undefined);
		});
		test('query-string on init and url', async () => {
			const resp = { data: [{ name: 'Bob' }] };

			const options = {
				aws_project_region: 'region',
				aws_cloud_logic_custom,
			};

			const api = new API({});
			api.configure(options);

			const creds = {
				secretAccessKey: 'secret',
				accessKeyId: 'access',
				sessionToken: 'token',
			};

			const creds2 = {
				secret_key: 'secret',
				access_key: 'access',
				session_token: 'token',
			};

			const spyon = jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return new Promise((res, rej) => {
					res(creds);
				});
			});

			const spyonSigner = jest
				.spyOn(Signer, 'sign')
				.mockImplementationOnce(() => {
					return { headers: {} };
				});

			const spyAxios = jest
				.spyOn(axios as any, 'default')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res(resp);
					});
				});

			const init = {
				queryStringParameters: {
					key2: 'value2_real',
				},
			};
			await api.get('apiName', '/items?key1=value1&key2=value', init);
			const expectedParams = {
				data: null,
				headers: {},
				host: undefined,
				method: 'GET',
				path: '/',
				responseType: 'json',
				url: 'endpoint/items?key1=value1&key2=value2_real',
				timeout: 0,
				cancelToken: tokenMock,
			};
			expect(spyonSigner).toBeCalledWith(expectedParams, creds2, {
				region: 'us-east-1',
				service: 'execute-api',
			});
		});

		test('endpoint length 0', async () => {
			const api = new API({});
			api.configure({});

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});
			const spyon2 = jest
				.spyOn(RestClient.prototype, 'get')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			expect.assertions(1);
			try {
				await api.get('apiNameDoesntExist', 'path', { init: 'init' });
			} catch (e) {
				expect(e).toBe('API apiNameDoesntExist does not exist');
			}
		});

		test('cred not ready', async () => {
			const api = new API({});
			api.configure(config);

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err no current credentials');
					});
				});

			const spyon4 = jest
				.spyOn(RestClient.prototype as any, '_request')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			expect.assertions(1);
			await api.get('apiName', 'path', { init: 'init' });
			expect(spyon4).toBeCalled();
		});

		test('clock skew', async () => {
			const api = new API({});
			api.configure({
				endpoints: [
					{
						name: 'url',
						endpoint: 'endpoint',
					},
				],
			});

			const normalError = new Error('Response Error');

			// Server is always "correct"
			const serverDate = new Date();
			const requestDate = new Date();

			// Local machine is behind by 1 hour
			// It's important to change the _server_ time in this test,
			// because the local time "looks correct" to the user & DateUtils
			// compares the server response to local time.
			serverDate.setHours(serverDate.getHours() + 1);

			const clockSkewError: any = new Error('BadRequestException');
			const init = {
				headers: {
					'x-amz-date': DateUtils.getHeaderStringFromDate(requestDate),
				},
			};

			clockSkewError.response = {
				headers: {
					'x-amzn-errortype': 'BadRequestException',
					date: serverDate.toString(),
				},
			};

			// Clock should not be skewed yet
			expect(DateUtils.getClockOffset()).toBe(0);
			// Ensure the errors are the correct type for gating
			expect(DateUtils.isClockSkewError(normalError)).toBe(false);
			expect(DateUtils.isClockSkewError(clockSkewError)).toBe(true);
			expect(DateUtils.isClockSkewed(serverDate)).toBe(true);

			jest
				.spyOn(RestClient.prototype as any, 'endpoint')
				.mockImplementation(() => 'endpoint');

			jest.spyOn(Credentials, 'get').mockResolvedValue('creds');

			jest
				.spyOn(RestClient.prototype as any, '_signed')
				.mockRejectedValueOnce(normalError);

			await expect(api.post('url', 'path', init)).rejects.toThrow(normalError);

			// Clock should not be skewed from normal errors
			expect(DateUtils.getClockOffset()).toBe(0);

			jest
				.spyOn(RestClient.prototype as any, '_signed')
				.mockRejectedValueOnce(clockSkewError);

			await expect(api.post('url', 'path', init)).resolves.toEqual([
				{ name: 'Bob' },
			]);

			// With a clock skew error, the clock will get offset with the difference
			expect(DateUtils.getClockOffset()).toBe(
				serverDate.getTime() - requestDate.getTime()
			);
		});

		test('cancel request', async () => {
			const api = new API({});
			api.configure(config);

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});
			const spyon2 = jest
				.spyOn(RestClient.prototype, 'get')
				.mockImplementationOnce(() => {
					return Promise.reject('error cancelled');
				});
			const spyon4 = jest
				.spyOn(RestClient.prototype, 'isCancel')
				.mockImplementationOnce(() => {
					return true;
				});

			const promiseResponse = api.get('apiName', 'path', { init: 'init' });
			api.cancel(promiseResponse, 'testmessage');

			expect.assertions(5);

			expect(spyon2).toBeCalledWith(
				{
					custom_header: undefined,
					endpoint: 'endpointpath',
					region: 'region',
					service: 'execute-api',
				},
				{
					init: 'init',
					cancellableToken: { cancel: cancelMock, token: tokenMock },
				}
			);
			expect(cancelTokenSpy).toBeCalledTimes(1);
			expect(cancelMock).toBeCalledWith('testmessage');
			try {
				await promiseResponse;
			} catch (err) {
				expect(err).toEqual('error cancelled');
				expect(api.isCancel(err)).toBeTruthy();
			}
		});
	});

	describe('post test', () => {
		test('happy case', async () => {
			const api = new API({
				region: 'region-2',
			});
			const options = {
				aws_project_region: 'region',
				aws_cloud_logic_custom,
			};

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});
			const spyon2 = jest
				.spyOn(RestClient.prototype, 'post')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			api.configure(options);
			await api.post('apiName', 'path', { init: 'init' });

			expect(spyon2).toBeCalledWith(
				{
					custom_header: undefined,
					endpoint: 'endpointpath',
					region: 'us-east-1',
					service: 'execute-api',
				},
				{
					init: 'init',
					cancellableToken: { cancel: cancelMock, token: tokenMock },
				}
			);
		});

		test('endpoint length 0', async () => {
			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});
			const spyon2 = jest
				.spyOn(RestClient.prototype, 'post')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			const api = new API({});
			api.configure(config);

			expect.assertions(1);
			try {
				await api.post('apiNameDoesNotExists', 'path', { init: 'init' });
			} catch (e) {
				expect(e).toBe('API apiNameDoesNotExists does not exist');
			}
		});

		test('cred not ready', async () => {
			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err');
					});
				});

			const api = new API({});
			api.configure(config);

			const spyon4 = jest
				.spyOn(RestClient.prototype as any, '_request')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			expect.assertions(1);
			await api.post('apiName', 'path', { init: 'init' });
			expect(spyon4).toBeCalled();
		});
	});

	describe('put test', () => {
		test('happy case', async () => {
			const api = new API({});
			api.configure(config);

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});
			const spyon2 = jest
				.spyOn(RestClient.prototype, 'put')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			await api.put('apiName', 'path', { init: 'init' });

			expect(spyon2).toBeCalledWith(
				{
					custom_header: undefined,
					endpoint: 'endpointpath',
					region: 'region',
					service: 'execute-api',
				},
				{
					init: 'init',
					cancellableToken: { cancel: cancelMock, token: tokenMock },
				}
			);
		});

		test('endpoint length 0', async () => {
			const api = new API({});
			api.configure({
				endpoints: [],
			});

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});
			const spyon2 = jest
				.spyOn(RestClient.prototype, 'put')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			expect.assertions(1);
			try {
				await api.put('apiName', 'path', { init: 'init' });
			} catch (e) {
				expect(e).toBe('API apiName does not exist');
			}
		});

		test('cred not ready', async () => {
			const api = new API({});
			api.configure(config);

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err');
					});
				});

			const spyon4 = jest
				.spyOn(RestClient.prototype as any, '_request')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			expect.assertions(1);
			await api.put('apiName', 'path', { init: 'init' });
			expect(spyon4).toBeCalled();
		});
	});

	describe('patch test', () => {
		test('happy case', async () => {
			const api = new API({});
			api.configure(config);

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});
			const spyon2 = jest
				.spyOn(RestClient.prototype, 'patch')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			await api.patch('apiName', 'path', { init: 'init' });

			expect(spyon2).toBeCalledWith(
				{
					custom_header: undefined,
					endpoint: 'endpointpath',
					region: 'region',
					service: 'execute-api',
				},
				{
					init: 'init',
					cancellableToken: { cancel: cancelMock, token: tokenMock },
				}
			);
		});

		test('endpoint length 0', async () => {
			const api = new API({});
			api.configure({
				endpoints: [],
			});

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});
			const spyon2 = jest
				.spyOn(RestClient.prototype, 'patch')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			expect.assertions(1);
			try {
				await api.patch('apiName', 'path', { init: 'init' });
			} catch (e) {
				expect(e).toBe('API apiName does not exist');
			}
		});

		test('cred not ready', async () => {
			const api = new API({});
			api.configure(config);

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err');
					});
				});

			const spyon4 = jest
				.spyOn(RestClient.prototype as any, '_request')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			expect.assertions(1);
			await api.patch('apiName', 'path', { init: 'init' });
			expect(spyon4).toBeCalled();
		});
	});

	describe('del test', () => {
		test('happy case', async () => {
			const api = new API({});
			api.configure(config);

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});
			const spyon2 = jest
				.spyOn(RestClient.prototype, 'del')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			await api.del('apiName', 'path', { init: 'init' });

			expect(spyon2).toBeCalledWith(
				{
					custom_header: undefined,
					endpoint: 'endpointpath',
					region: 'region',
					service: 'execute-api',
				},
				{
					init: 'init',
					cancellableToken: { cancel: cancelMock, token: tokenMock },
				}
			);
		});

		test('endpoint length 0', async () => {
			const api = new API({});
			api.configure({});

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});
			const spyon2 = jest
				.spyOn(RestClient.prototype, 'del')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			expect.assertions(1);
			try {
				await api.del('apiName', 'path', { init: 'init' });
			} catch (e) {
				expect(e).toBe('API apiName does not exist');
			}
		});

		test('cred not ready', async () => {
			const api = new API({});
			api.configure(config);

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err');
					});
				});

			const spyon4 = jest
				.spyOn(RestClient.prototype as any, '_request')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			expect.assertions(1);
			await api.del('apiName', 'path', { init: 'init' });
			expect(spyon4).toBeCalled();
		});
	});

	describe('head test', () => {
		test('happy case', async () => {
			const api = new API({});
			api.configure(config);

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});
			const spyon2 = jest
				.spyOn(RestClient.prototype, 'head')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			await api.head('apiName', 'path', { init: 'init' });

			expect(spyon2).toBeCalledWith(
				{
					custom_header: undefined,
					endpoint: 'endpointpath',
					region: 'region',
					service: 'execute-api',
				},
				{
					init: 'init',
					cancellableToken: { cancel: cancelMock, token: tokenMock },
				}
			);
		});

		test('endpoint length 0', async () => {
			const api = new API({});
			api.configure({});

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});
			const spyon2 = jest
				.spyOn(RestClient.prototype, 'head')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			expect.assertions(1);
			try {
				await api.head('apiName', 'path', { init: 'init' });
			} catch (e) {
				expect(e).toBe('API apiName does not exist');
			}
		});

		test('cred not ready', async () => {
			const api = new API({});
			api.configure(config);

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err');
					});
				});

			const spyon4 = jest
				.spyOn(RestClient.prototype as any, '_request')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			expect.assertions(1);
			await api.head('apiName', 'path', { init: 'init' });
			expect(spyon4).toBeCalled();
		});
	});

	describe('endpoint test', () => {
		test('happy case', async () => {
			const api = new API({});
			api.configure(config);

			const endpoint = await api.endpoint('apiName');

			expect(endpoint).toBe('endpoint');
		});
	});
});
