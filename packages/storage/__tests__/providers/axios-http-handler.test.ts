import axios, { CancelTokenSource } from 'axios';
import * as events from 'events';

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

		it('should attach cancelToken to the request', async () => {
			const mockCancelToken = jest.fn().mockImplementationOnce(() => ({
				token: 'token',
			}));
			const handler = new AxiosHttpHandler({}, null, mockCancelToken());
			await handler.handle(request, options);

			expect(axios.request).toHaveBeenLastCalledWith({
				headers: {},
				method: 'get',
				responseType: 'blob',
				url: 'http://localhost:3000/',
				cancelToken: 'token',
			});
		});

		it('should track upload or download progress if emitter is present', async () => {
			const mockEmit = jest.fn();
			const mockEmitter = jest.fn().mockImplementationOnce(() => ({
				emit: mockEmit,
			}));
			const handler = new AxiosHttpHandler({}, mockEmitter());
			await handler.handle(request, options);
			const lastCall =
				axios.request.mock.calls[axios.request.mock.calls.length - 1][0];

			expect(lastCall).toStrictEqual({
				headers: {},
				method: 'get',
				responseType: 'blob',
				url: 'http://localhost:3000/',
				onUploadProgress: expect.any(Function),
				onDownloadProgress: expect.any(Function),
			});

			// Invoke the request's onUploadProgress function manually
			lastCall.onUploadProgress({ loaded: 10, total: 100 });
			expect(mockEmit).toHaveBeenLastCalledWith('sendUploadProgress', {
				loaded: 10,
				total: 100,
			});

			// Invoke the request's onDownloadProgress function manually
			lastCall.onDownloadProgress({ loaded: 10, total: 100 });
			expect(mockEmit).toHaveBeenLastCalledWith('sendDownloadProgress', {
				loaded: 10,
				total: 100,
			});
		});
	});
});
