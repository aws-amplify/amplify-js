import axios from 'axios';
import {
	AxiosHttpHandler,
	reactNativeRequestTransformer,
} from '../../src/providers/axios-http-handler';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { Platform, Logger } from '@aws-amplify/core';

jest.mock('axios');

let request: HttpRequest;

const options = {};

describe('AxiosHttpHandler', () => {
	beforeEach(() => {
		Platform.isReactNative = false;
		jest.spyOn(axios, 'request').mockResolvedValue({});
		request = {
			method: 'get',
			path: '/',
			protocol: 'http:',
			hostname: 'localhost',
			port: 3000,
			query: {},
			headers: {},
			clone: () => null as unknown as HttpRequest,
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
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

		it('should add queryString to path', async () => {
			const handler = new AxiosHttpHandler();
			request.query = {
				key: 'value',
			};
			await handler.handle(request, options);
			expect(axios.request).toHaveBeenCalledWith({
				headers: {},
				method: 'get',
				responseType: 'blob',
				url: 'http://localhost:3000/?key=value',
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

		it('should use custom request transformer on React Native', async () => {
			Platform.isReactNative = true;
			const handler = new AxiosHttpHandler();
			const blob = new Blob(['123456789012']);
			request.body = blob;
			await handler.handle(request, options);
			expect(axios.request).toHaveBeenLastCalledWith({
				data: blob,
				headers: {},
				method: 'get',
				responseType: 'blob',
				url: 'http://localhost:3000/',
				transformRequest: reactNativeRequestTransformer,
			});
		});

		it('should attach cancelToken to the request', async () => {
			const mockCancelToken = jest.fn().mockImplementationOnce(() => ({
				token: 'token',
			}));
			const handler = new AxiosHttpHandler({}, undefined, mockCancelToken());
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
			const axiosRequestSpy = jest.spyOn(axios, 'request');
			const handler = new AxiosHttpHandler({}, mockEmitter());
			await handler.handle(request, options);

			const lastCall =
				axiosRequestSpy.mock.calls[axiosRequestSpy.mock.calls.length - 1][0];

			expect(lastCall).toStrictEqual({
				headers: {},
				method: 'get',
				responseType: 'blob',
				url: 'http://localhost:3000/',
				onUploadProgress: expect.any(Function),
				onDownloadProgress: expect.any(Function),
			});

			if (lastCall.onUploadProgress) {
				// Invoke the request's onUploadProgress function manually
				lastCall.onUploadProgress({ loaded: 10, total: 100 });
			}
			expect(mockEmit).toHaveBeenLastCalledWith('sendUploadProgress', {
				loaded: 10,
				total: 100,
			});

			if (lastCall.onDownloadProgress) {
				// Invoke the request's onDownloadProgress function manually
				lastCall.onDownloadProgress({ loaded: 10, total: 100 });
			}
			expect(mockEmit).toHaveBeenLastCalledWith('sendDownloadProgress', {
				loaded: 10,
				total: 100,
			});
		});

		it('should timeout after requestTimeout', async () => {
			jest.useFakeTimers();
			const handler = new AxiosHttpHandler({ requestTimeout: 1000 });
			const req = handler.handle(request, options);
			expect(setTimeout).toHaveBeenCalledTimes(1);
			expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
			jest.advanceTimersByTime(1000);
			await expect(req).rejects.toThrowError(
				'Request did not complete within 1000 ms'
			);
		});

		it('axios request should log errors', async () => {
			axios.request = jest
				.fn()
				.mockImplementation(() => Promise.reject(new Error('err')));
			const loggerSpy = jest.spyOn(Logger.prototype, '_log');
			const handler = new AxiosHttpHandler();
			await handler.handle(request, options);
			expect(loggerSpy).toHaveBeenCalledWith('ERROR', 'err');
		});

		it('cancel request should throw error', async () => {
			expect.assertions(1);
			axios.isCancel = jest.fn().mockImplementation(() => true);
			axios.request = jest
				.fn()
				.mockImplementation(() => Promise.reject(new Error('err')));
			const handler = new AxiosHttpHandler();
			await expect(handler.handle(request, options)).rejects.toThrowError(
				'err'
			);
		});

		it('caught error should default to a 400 status code', async () => {
			axios.request = jest
				.fn()
				.mockImplementationOnce(() => Promise.reject(new Error('err')));
			const handler = new AxiosHttpHandler();
			const result = await handler.handle(request, options);
			expect(result.response.statusCode).toEqual(400);
		});
	});

	describe('React Native Request Transformer', () => {
		it('should return blob as is for Blob', () => {
			const blob = new Blob(['123456789012']);
			const headers = { 'content-type': 'text/plain' };
			const result = reactNativeRequestTransformer[0](blob, headers);
			expect(headers).toStrictEqual({
				'Content-Type': 'text/plain',
			});
			expect(result).toBe(blob);
		});

		it('should run defaultTransformers logic on everything else', () => {
			const mockTransformer = jest.fn();
			axios.defaults.transformRequest = [mockTransformer];
			reactNativeRequestTransformer[0]('data', {});
			expect(mockTransformer).toHaveBeenCalledTimes(1);
		});
	});
});
