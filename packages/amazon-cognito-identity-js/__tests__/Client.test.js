import Client from '../src/Client';
import { promisifyCallback } from './util';
import { region, endpoint } from './constants';

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
			jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
				args[2](null, {});
			});
			const data = client.promisifyRequest({}, {});
			Promise.resolve(data).then(res => {
				expect(res).toEqual({});
			});
		});

		test('Promisify request throws an error', () => {
			jest.spyOn(Client.prototype, 'request').mockImplementation((...args) => {
				const err = new Error('Network error');
				args[2](err, null);
			});
			const error = client.promisifyRequest({}, {});
			Promise.resolve(error).catch(err => {
				expect(err).toMatchObject(new Error('Network error'));
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
