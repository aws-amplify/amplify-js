import axios from 'axios';
import { RestAPIClass as API } from '../src/';
import { RestClient } from '../src/RestClient';
import { Signer, Credentials } from '@aws-amplify/core';

jest.mock('axios');

const config = {
	API: {
		region: 'region',
		header: {},
	},
};

afterEach(() => {
	jest.restoreAllMocks();
});

describe('Rest API test', () => {
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
			const api = new API(config);
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
			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			await api.get('apiName', 'path', 'init');

			expect(spyon2).toBeCalledWith('endpointpath', 'init');
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

			const api = new API(options);
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

			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
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

			const api = new API(options);
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

			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
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

			const api = new API(options);
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

			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
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
			};
			expect(spyonRequest).toBeCalledWith(expectedParams, undefined);
		});
		test('query-string on init and url', async () => {
			const resp = { data: [{ name: 'Bob' }] };

			const options = {
				aws_project_region: 'region',
				aws_cloud_logic_custom,
			};

			const api = new API(options);
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

			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
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
			};
			expect(spyonSigner).toBeCalledWith(expectedParams, creds2, {
				region: 'us-east-1',
				service: 'execute-api',
			});
		});

		test('endpoint length 0', async () => {
			const api = new API(config);
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
			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return '';
				});

			expect.assertions(1);
			try {
				await api.get('apiName', 'path', 'init');
			} catch (e) {
				expect(e).toBe('API apiName does not exist');
			}
		});

		test('cred not ready', async () => {
			const api = new API(config);
			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err no current credentials');
					});
				});

			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			const spyon4 = jest
				.spyOn(RestClient.prototype as any, '_request')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			expect.assertions(1);
			await api.get('apiName', 'path', 'init');
			expect(spyon4).toBeCalled();
		});

		test('no restclient instance', async () => {
			const api = new API(config);
			const spyon = jest
				.spyOn(API.prototype, 'createInstance')
				.mockImplementationOnce(() => {
					return Promise.reject('err');
				});

			expect.assertions(1);
			try {
				await api.get('apiName', 'path', 'init');
			} catch (e) {
				expect(e).toBe('err');
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
			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			api.configure(options);
			await api.post('apiName', 'path', 'init');

			expect(spyon2).toBeCalledWith('endpointpath', 'init');
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
			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return '';
				});

			const api = new API(config);
			expect.assertions(1);
			try {
				await api.post('apiName', 'path', 'init');
			} catch (e) {
				expect(e).toBe('API apiName does not exist');
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

			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			const api = new API(config);
			const spyon4 = jest
				.spyOn(RestClient.prototype as any, '_request')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			expect.assertions(1);
			await api.post('apiName', 'path', 'init');
			expect(spyon4).toBeCalled();
		});

		test('no restclient instance', async () => {
			const api = new API(config);
			const spyon = jest
				.spyOn(API.prototype, 'createInstance')
				.mockImplementationOnce(() => {
					return Promise.reject('err');
				});

			expect.assertions(1);
			try {
				await api.post('apiName', 'path', 'init');
			} catch (e) {
				expect(e).toBe('err');
			}
		});
	});

	describe('put test', () => {
		test('happy case', async () => {
			const api = new API(config);
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
			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			await api.put('apiName', 'path', 'init');

			expect(spyon2).toBeCalledWith('endpointpath', 'init');
		});

		test('endpoint length 0', async () => {
			const api = new API(config);
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
			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return '';
				});

			expect.assertions(1);
			try {
				await api.put('apiName', 'path', 'init');
			} catch (e) {
				expect(e).toBe('API apiName does not exist');
			}
		});

		test('cred not ready', async () => {
			const api = new API(config);
			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err');
					});
				});

			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			const spyon4 = jest
				.spyOn(RestClient.prototype as any, '_request')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			expect.assertions(1);
			await api.put('apiName', 'path', 'init');
			expect(spyon4).toBeCalled();
		});

		test('no restclient instance', async () => {
			const api = new API(config);
			const spyon = jest
				.spyOn(API.prototype, 'createInstance')
				.mockImplementationOnce(() => {
					return Promise.reject('err');
				});

			expect.assertions(1);
			try {
				await api.put('apiName', 'path', 'init');
			} catch (e) {
				expect(e).toBe('err');
			}
		});
	});

	describe('patch test', () => {
		test('happy case', async () => {
			const api = new API(config);
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
			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			await api.patch('apiName', 'path', 'init');

			expect(spyon2).toBeCalledWith('endpointpath', 'init');
		});

		test('endpoint length 0', async () => {
			const api = new API(config);
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
			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return '';
				});

			expect.assertions(1);
			try {
				await api.patch('apiName', 'path', 'init');
			} catch (e) {
				expect(e).toBe('API apiName does not exist');
			}
		});

		test('cred not ready', async () => {
			const api = new API(config);
			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err');
					});
				});

			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			const spyon4 = jest
				.spyOn(RestClient.prototype as any, '_request')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			expect.assertions(1);
			await api.patch('apiName', 'path', 'init');
			expect(spyon4).toBeCalled();
		});

		test('no restclient instance', async () => {
			const api = new API(config);
			const spyon = jest
				.spyOn(API.prototype, 'createInstance')
				.mockImplementationOnce(() => {
					return Promise.reject('err');
				});

			expect.assertions(1);
			try {
				await api.patch('apiName', 'path', 'init');
			} catch (e) {
				expect(e).toBe('err');
			}
		});
	});

	describe('del test', () => {
		test('happy case', async () => {
			const api = new API(config);
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
			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			await api.del('apiName', 'path', 'init');

			expect(spyon2).toBeCalledWith('endpointpath', 'init');
		});

		test('endpoint length 0', async () => {
			const api = new API(config);
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
			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return '';
				});

			expect.assertions(1);
			try {
				await api.del('apiName', 'path', 'init');
			} catch (e) {
				expect(e).toBe('API apiName does not exist');
			}
		});

		test('cred not ready', async () => {
			const api = new API(config);
			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err');
					});
				});

			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			const spyon4 = jest
				.spyOn(RestClient.prototype as any, '_request')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			expect.assertions(1);
			await api.del('apiName', 'path', 'init');
			expect(spyon4).toBeCalled();
		});

		test('no restclient instance', async () => {
			const api = new API(config);
			const spyon = jest
				.spyOn(API.prototype, 'createInstance')
				.mockImplementationOnce(() => {
					return Promise.reject('err');
				});

			expect.assertions(1);
			try {
				await api.del('apiName', 'path', 'init');
			} catch (e) {
				expect(e).toBe('err');
			}
		});
	});

	describe('head test', () => {
		test('happy case', async () => {
			const api = new API(config);
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
			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			await api.head('apiName', 'path', 'init');

			expect(spyon2).toBeCalledWith('endpointpath', 'init');
		});

		test('endpoint length 0', async () => {
			const api = new API(config);
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
			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return '';
				});

			expect.assertions(1);
			try {
				await api.head('apiName', 'path', 'init');
			} catch (e) {
				expect(e).toBe('API apiName does not exist');
			}
		});

		test('cred not ready', async () => {
			const api = new API(config);
			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err');
					});
				});

			const spyon3 = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			const spyon4 = jest
				.spyOn(RestClient.prototype as any, '_request')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			expect.assertions(1);
			await api.head('apiName', 'path', 'init');
			expect(spyon4).toBeCalled();
		});

		test('no restclient instance', async () => {
			const api = new API(config);
			const spyon = jest
				.spyOn(API.prototype, 'createInstance')
				.mockImplementationOnce(() => {
					return Promise.reject('err');
				});

			expect.assertions(1);
			try {
				await api.head('apiName', 'path', 'init');
			} catch (e) {
				expect(e).toBe('err');
			}
		});
	});

	describe('endpoint test', () => {
		test('happy case', async () => {
			const api = new API(config);
			const spyon = jest
				.spyOn(RestClient.prototype, 'endpoint')
				.mockImplementationOnce(() => {
					return 'endpoint';
				});

			await api.endpoint('apiName');

			expect(spyon).toBeCalledWith('apiName');
		});

		test('no restclient instance', async () => {
			const api = new API(config);
			const spyon = jest
				.spyOn(API.prototype, 'createInstance')
				.mockImplementationOnce(() => {
					return Promise.reject('err');
				});

			expect.assertions(1);
			try {
				await api.endpoint('apiName');
			} catch (e) {
				expect(e).toBe('err');
			}
		});
	});
});
