import axios from 'axios';

import { AxiosHttpHandler } from '../../src/providers/axios-http-handler';

jest.mock('axios');

let request = null;

const options = {};

describe('AxiosHttpHandler', () => {
	beforeAll(() => {
		axios.request.mockResolvedValue({});
	});

	beforeEach(() => {
		request = {
			method: 'get',
			path: '/',
			protocol: 'http:',
			hostname: 'localhost',
			port: 3000,
			query: {},
			headers: {},
			clone: null,
		};
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

		it('should remove unsafe header host', async () => {
			const handler = new AxiosHttpHandler();
			request.headers['host'] = 'badheader';
			request.headers['SafeHeader'] = 'goodHeader';
			await handler.handle(request, options);

			expect(axios.request).toHaveBeenLastCalledWith({
				data: undefined,
				headers: { SafeHeader: 'goodHeader' },
				method: 'get',
				url: 'http://localhost:3000/',
			});
		});

		it("should update data to null when it's undefined and content-type header is set", async () => {
			const handler = new AxiosHttpHandler();
			request.headers['Content-Type'] = 'amazing/content';
			await handler.handle(request, options);

			expect(axios.request).toHaveBeenLastCalledWith({
				data: null,
				headers: { 'Content-Type': 'amazing/content' },
				method: 'get',
				url: 'http://localhost:3000/',
			});
		});
	});
});
