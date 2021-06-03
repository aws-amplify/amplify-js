import axios from 'axios';

import {
	AxiosHttpHandler,
	reactNativeRequestTransformer,
} from '../../src/providers/axios-http-handler';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { Platform } from '@aws-amplify/core';

jest.mock('axios');

let request: HttpRequest = null;

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
