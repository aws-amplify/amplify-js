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
		it('should remove unsafe header host', async () => {
			const handler = new AxiosHttpHandler();
			request.headers['host'] = 'badheader';
			request.headers['SafeHeader'] = 'goodHeader';
			await handler.handle(request, options);

			expect(axios.request).toHaveBeenLastCalledWith({
				data: undefined,
				headers: { SafeHeader: 'goodHeader' },
				method: 'get',
				responseType: 'blob',
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
				responseType: 'blob',
				url: 'http://localhost:3000/',
			});
		});
	});
});
