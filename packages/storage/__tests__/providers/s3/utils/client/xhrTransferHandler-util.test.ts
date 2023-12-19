// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { xhrTransferHandler } from '../../../../../src/providers/s3/utils/client/runtime/xhrTransferHandler';
import { isCancelError } from '../../../../../src/errors/CanceledError';
import {
	spyOnXhr,
	mockXhrResponse,
	triggerNetWorkError,
	triggerServerSideAbort,
	mockXhrReadyState,
	mockProgressEvents,
} from './testUtils/mocks';

jest.mock('@aws-amplify/core');

const defaultRequest = {
	method: 'GET',
	url: new URL('https://foo.com'),
	headers: {
		foo: 'bar',
	},
};

const mock200Response = {
	status: 200,
	headerString: 'foo: bar',
	body: 'hello world',
};

const mockReadablStreamCtor = jest.fn();

describe('xhrTransferHandler', () => {
	const originalXhr = window.XMLHttpRequest;
	const originalReadableStream = window.ReadableStream;
	const originalFileReaderCtor = window.FileReader;
	beforeEach(() => {
		jest.resetAllMocks();
		window.ReadableStream = mockReadablStreamCtor;
		window.FileReader = Object.assign(
			jest.fn().mockImplementation(() => {
				return new originalFileReaderCtor();
			}),
			{ ...originalFileReaderCtor }
		);
	});

	afterEach(() => {
		window.XMLHttpRequest = originalXhr;
		window.ReadableStream = originalReadableStream;
		window.FileReader = originalFileReaderCtor;
	});

	it('should call xhr.open with the correct arguments', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
		});
		mockXhrResponse(mockXhr, mock200Response);
		await requestPromise;
		expect(mockXhr.open).toHaveBeenCalledWith(
			defaultRequest.method,
			defaultRequest.url.toString()
		);
	});

	it('should call xhr.setRequestHeader ignoring forbidden header -- host', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(
			{
				...defaultRequest,
				headers: {
					foo: 'bar',
					host: 'https://example.com',
				},
			},
			{
				responseType: 'text',
			}
		);
		mockXhrResponse(mockXhr, mock200Response);
		await requestPromise;
		expect(mockXhr.setRequestHeader).toHaveBeenCalledTimes(1);
		expect(mockXhr.setRequestHeader).toHaveBeenCalledWith('foo', 'bar');
	});

	it('should set the xhr.responseType to the responseType option', async () => {
		let mockXhr = spyOnXhr();
		let requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
		});
		mockXhrResponse(mockXhr, mock200Response);
		await requestPromise;
		expect(mockXhr.responseType).toBe('text');
		mockXhr = spyOnXhr();
		requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'blob',
		});
		mockXhrResponse(mockXhr, mock200Response);
		await requestPromise;
		expect(mockXhr.responseType).toBe('blob');
	});

	it('should call xhr.send with Body', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(
			{
				...defaultRequest,
				body: 'hello world',
			},
			{
				responseType: 'text',
			}
		);
		mockXhrResponse(mockXhr, mock200Response);
		await requestPromise;
		expect(mockXhr.send).toHaveBeenCalledWith('hello world');
	});

	it('should throw if request Body is a ReadableStream', async () => {
		spyOnXhr();
		await expect(
			xhrTransferHandler(
				{
					...defaultRequest,
					body: new ReadableStream(),
				},
				{
					responseType: 'text',
				}
			)
		).rejects.toThrow('ReadableStream request payload is not supported.');
	});

	it('should call xhr.send with null when Body is undefined', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(
			{
				...defaultRequest,
				body: undefined,
			},
			{
				responseType: 'text',
			}
		);
		mockXhrResponse(mockXhr, mock200Response);
		await requestPromise;
		expect(mockXhr.send).toHaveBeenCalledWith(null);
	});

	it('should call xhr.getAllResponseHeaders when xhr.readyState is DONE', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
		});
		const headerString = [
			'date: Fri, 08 Dec 2017 21:04:30 GMT',
			'content-encoding: gzip',
			'x-content-type-options: nosniff',
			'server: meinheld/0.6.1',
			'x-frame-options: DENY',
			'content-type: text/html; charset=utf-8',
			'connection: keep-alive',
			'strict-transport-security: max-age=63072000',
			'vary: Cookie, Accept-Encoding',
			'content-length: 6502',
			'x-xss-protection: 1; mode=block',
		].join('\r\n');
		mockXhrResponse(mockXhr, {
			...mock200Response,
			headerString,
		});
		const { headers } = await requestPromise;
		expect(mockXhr.getAllResponseHeaders).toHaveBeenCalled();
		expect(headers).toEqual({
			date: 'Fri, 08 Dec 2017 21:04:30 GMT',
			'content-encoding': 'gzip',
			'x-content-type-options': 'nosniff',
			server: 'meinheld/0.6.1',
			'x-frame-options': 'DENY',
			'content-type': 'text/html; charset=utf-8',
			connection: 'keep-alive',
			'strict-transport-security': 'max-age=63072000',
			vary: 'Cookie, Accept-Encoding',
			'content-length': '6502',
			'x-xss-protection': '1; mode=block',
		});
	});

	it('should add error event listener to xhr', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
		});
		triggerNetWorkError(mockXhr);
		await expect(requestPromise).rejects.toThrow(
			expect.objectContaining({
				message: 'Network Error',
				name: 'ECONNABORTED',
			})
		);
	});

	it('should clear xhr when error event is emitted', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
		});
		triggerNetWorkError(mockXhr);
		await expect(requestPromise).rejects.toThrow(
			expect.objectContaining({
				message: 'Network Error',
				name: 'ECONNABORTED',
			})
		);
		// Should be no-op if the xhr is already cleared
		mockXhrResponse(mockXhr, mock200Response);
		expect(mockXhr.getAllResponseHeaders).not.toHaveBeenCalled();
	});

	it('should add progress event listener to xhr.upload and xhr(download) when onDownloadProgress/onUploadProgress is supplied', async () => {
		const mockXhr = spyOnXhr();
		const onDownloadProgress = jest.fn();
		const onUploadProgress = jest.fn();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
			onDownloadProgress,
			onUploadProgress,
		});
		mockXhrResponse(mockXhr, mock200Response);
		const uploadProgressEvent = {
			loaded: 111,
			total: 111,
			lengthComputable: true,
		};
		const downloadProgressEvent = {
			loaded: 222,
			total: 222,
			lengthComputable: true,
		};
		mockProgressEvents({
			mockXhr,
			uploadEvents: [uploadProgressEvent],
			downloadEvents: [downloadProgressEvent],
		});
		await requestPromise;
		expect(onDownloadProgress).toHaveBeenCalledWith({
			transferredBytes: downloadProgressEvent.loaded,
			totalBytes: downloadProgressEvent.total,
		});
		expect(onUploadProgress).toHaveBeenCalledWith({
			transferredBytes: uploadProgressEvent.loaded,
			totalBytes: uploadProgressEvent.total,
		});
	});

	it('should add abort event listener to xhr', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
		});
		triggerServerSideAbort(mockXhr);
		await expect(requestPromise).rejects.toThrow(
			expect.objectContaining({
				message: 'Request aborted',
				name: 'ERR_ABORTED',
			})
		);
	});

	it('should clear xhr when abort event is emitted', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
		});
		triggerServerSideAbort(mockXhr);
		await expect(requestPromise).rejects.toThrow(
			expect.objectContaining({
				message: 'Request aborted',
				name: 'ERR_ABORTED',
			})
		);
		// Should be no-op if the xhr is already cleared
		mockXhrResponse(mockXhr, mock200Response);
		expect(mockXhr.getAllResponseHeaders).not.toHaveBeenCalled();
	});

	it('should process response only when xhr.readyState is DONE', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
		});
		[
			XMLHttpRequest.UNSENT,
			XMLHttpRequest.OPENED,
			XMLHttpRequest.HEADERS_RECEIVED,
			XMLHttpRequest.LOADING,
		].forEach(readyState => {
			mockXhrReadyState(mockXhr, readyState);
			expect(mockXhr.getAllResponseHeaders).not.toHaveBeenCalled();
		});
		mockXhrResponse(mockXhr, mock200Response);
		await requestPromise;
		expect(mockXhr.getAllResponseHeaders).toHaveBeenCalledTimes(1);
	});

	it('should NOT process response when xhr is cleared', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
		});
		mockXhrResponse(mockXhr, mock200Response);
		await requestPromise;
		mockXhrResponse(mockXhr, mock200Response);
		expect(mockXhr.getAllResponseHeaders).toHaveBeenCalledTimes(1);
	});

	it('should set Blob response with ResponseBodyMixin when xhr.responseType is blob', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'blob',
		});
		mockXhrResponse(mockXhr, {
			...mock200Response,
			body: new Blob([mock200Response.body]),
		});
		const { body } = await requestPromise;

		expect(await body!.blob()).toBe(body);

		await body!.text();
		const responseText = await body!.text();
		expect(responseText).toBe(mock200Response.body);
		expect(FileReader).toHaveBeenCalledTimes(1); // validate memoization

		await expect(body!.json()).rejects.toThrow(
			expect.objectContaining({
				message: expect.stringContaining(
					'Parsing response to JSON is not implemented.'
				),
			})
		);
	});

	it('should set Text response with ResponseBodyMixin when xhr.responseType is not blob', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
		});
		mockXhrResponse(mockXhr, mock200Response);
		const { body } = await requestPromise;
		expect(await body?.text()).toEqual(mock200Response.body);
	});

	it('should clear xhr when xhr.readyState is DONE', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
		});

		mockXhrResponse(mockXhr, mock200Response);
		await requestPromise;
		// Should be no-op if the xhr is already cleared
		mockXhrResponse(mockXhr, mock200Response);
		expect(mockXhr.getAllResponseHeaders).toHaveBeenCalledTimes(1);
	});

	it('should immediately reject with canceled error when signal is already aborted', async () => {
		expect.assertions(3);
		const mockXhr = spyOnXhr();
		const abortController = new AbortController();
		abortController.abort();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
			abortSignal: abortController.signal,
		});
		try {
			await requestPromise;
			fail('requestPromise should reject');
		} catch (e) {
			expect(isCancelError(e)).toBe(true);
			expect.objectContaining({
				message: 'canceled',
				name: 'ERR_CANCELED',
			});
		}
		expect(mockXhr.abort).toHaveBeenCalledTimes(1);
		expect(mockXhr.send).not.toHaveBeenCalled();
	});

	it('should reject with canceled error when signal is aborted', async () => {
		expect.assertions(3);
		const mockXhr = spyOnXhr();
		const abortController = new AbortController();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
			abortSignal: abortController.signal,
		});
		abortController.abort();
		try {
			await requestPromise;
			fail('requestPromise should reject');
		} catch (e) {
			expect(isCancelError(e)).toBe(true);
			expect.objectContaining({
				message: 'canceled',
				name: 'ERR_CANCELED',
			});
		}
		expect(mockXhr.abort).toHaveBeenCalledTimes(1);
		expect(mockXhr.send).toHaveBeenCalledTimes(1);
	});
});
