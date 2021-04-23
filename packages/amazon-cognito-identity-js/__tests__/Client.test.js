import Client from '../src/Client';
import { promisifyCallback } from './util';
import { region, endpoint, networkError } from './constants';
import { netRequestMockSuccess } from '../__mocks__/mocks';

describe('Client unit test suite', () => {
	beforeAll(() => {
		jest.restoreAllMocks();
	});
	describe('Promisify Request tests', () => {
		const client = new Client(region, endpoint, {});

		afterAll(() => {
			jest.restoreAllMocks();
		});

		test('Promisify request happy case', () => {
			netRequestMockSuccess(true);
			const data = client.promisifyRequest({}, {});
			Promise.resolve(data).then(res => {
				expect(res).toEqual({});
			});
		});

		test('Promisify request throws an error', () => {
			netRequestMockSuccess(false);
			const error = client.promisifyRequest({}, {});
			Promise.resolve(error).catch(err => {
				expect(err).toMatchObject(networkError);
			});
		});
	});

	describe('Request unit tests', () => {
		const client = new Client(region, endpoint, {});
		afterEach(() => {
			jest.restoreAllMocks();
		});

		test('Happy case for request', async () => {
			jest.spyOn(window, 'fetch');

			window.fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ endpoint: endpoint }),
			});

			await promisifyCallback(client, 'request', '', {}).then(res => {
				expect(res).toMatchObject({ endpoint: endpoint });
			});
		});

		test('Network Error case for request', async () => {
			jest.spyOn(window, 'fetch');
			const networkError = new TypeError('Network Error');

			fetch.mockRejectedValue(networkError);

			await promisifyCallback(client, 'request', '', {}).catch(err => {
				expect(err).toMatchObject({ message: 'Network error' });
			});
		});

		test('Network success but downstream error', async () => {
			jest.spyOn(window, 'fetch');

			window.fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ __type: 'test' }),
			});

			await promisifyCallback(client, 'request', '', {}).catch(err => {
				expect(err).toMatchObject({ code: 'test' });
			});
		});
	});
});
