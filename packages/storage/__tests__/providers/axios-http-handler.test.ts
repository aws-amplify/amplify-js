import axios from 'axios';

import { AxiosHttpHandler } from '../../src/providers/axios-http-handler';

jest.mock('axios');

const request = {
	method: 'get',
	path: '/',
	protocol: 'http:',
	hostname: 'localhost',
	port: 3000,
	query: {},
	headers: {},
	clone: null,
};

const options = {};

describe('AxiosHttpHandler', () => {
	beforeAll(() => {
		axios.request.mockResolvedValue({});
	});

	describe('.handle', () => {
		it('should not set responseType by default', async () => {
			const handler = new AxiosHttpHandler({});
			await handler.handle(request, options);

			expect(axios.request).toHaveBeenLastCalledWith({
				data: undefined,
				headers: {},
				method: 'get',
				url: 'http://localhost:3000/',
			});
		});

		it('should add responseType: "blob" when bufferBody is true', async () => {
			const handler = new AxiosHttpHandler({ bufferBody: true });
			await handler.handle(request, options);

			expect(axios.request).toHaveBeenLastCalledWith({
				data: undefined,
				headers: {},
				method: 'get',
				responseType: 'blob',
				url: 'http://localhost:3000/',
			});
		});
	});
});
