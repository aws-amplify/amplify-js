import axios, { CancelTokenSource } from 'axios';
import * as events from 'events';

import {
	AxiosHttpHandler,
	reactNativeRequestTransformer,
} from '../../src/providers/axios-http-handler';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { Platform, Logger } from '@aws-amplify/core';

jest.mock('axios');
jest.useFakeTimers();

let request: HttpRequest = null;

const options = {};

describe('AxiosHttpHandler', () => {
	beforeEach(() => {
		Platform.isReactNative = false;
		axios.request.mockResolvedValue({});
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
			})
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

		it('should timeout after requestTimeout', async () => {
			const handler = new AxiosHttpHandler({ requestTimeout: 1000 });
			const req = handler.handle(request, options);
			expect(setTimeout).toHaveBeenCalledTimes(1);
			expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
			jest.advanceTimersByTime(1000);
			await expect(req).rejects.toThrowError(
				'Request did not complete within 1000 ms'
			);
		});

		it('axios request should log and re-throw error', async () => {
			axios.request = jest
				.fn()
				.mockImplementation(() => Promise.reject(new Error('err')));
			const loggerSpy = jest.spyOn(Logger.prototype, '_log');
			const handler = new AxiosHttpHandler();
			await expect(handler.handle(request, options)).rejects.toThrowError(
				'err'
			);
			expect(loggerSpy).toHaveBeenCalledWith('ERROR', 'err');
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
			const mockTransformer = jest.fn()
			axios.defaults.transformRequest = [mockTransformer];
			reactNativeRequestTransformer[0]('data', {});
			expect(mockTransformer).toHaveBeenCalledTimes(1);
		})
	});
});
