// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { xhrTransferHandler } from '../../src/AwsClients/S3/runtime/xhrTransferHandler';
import {
	SEND_UPLOAD_PROGRESS_EVENT,
	SEND_DOWNLOAD_PROGRESS_EVENT,
} from '../../src/AwsClients/S3/utils';
import {
	spyOnXhr,
	mockXhrResponse,
	triggerNetWorkError,
	triggerServerSideAbort,
	mockXhrReadyState,
	mockBlobResponsePayload,
} from './testUtils/mocks';

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

describe('xhrTransferHandler', () => {
	const originalXhr = window.XMLHttpRequest;
	const originalReadableStream = window.ReadableStream;
	const originalBlobText = Blob.prototype.text;
	beforeEach(() => {
		jest.resetAllMocks();
		window.ReadableStream = jest.fn() as any;
		Blob.prototype.text = jest.fn();
	});

	afterEach(() => {
		window.XMLHttpRequest = originalXhr;
		window.ReadableStream = originalReadableStream;
		Blob.prototype.text = originalBlobText;
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
		expect(mockXhr.setRequestHeader).toBeCalledTimes(1);
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
					body: new window.ReadableStream(),
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
				code: 'ECONNABORTED',
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
				code: 'ECONNABORTED',
			})
		);
		// Should be no-op if the xhr is already cleared
		mockXhrResponse(mockXhr, mock200Response);
		expect(mockXhr.getAllResponseHeaders).not.toHaveBeenCalled();
	});

	it('should add progress event listener to xhr.upload and xhr(download) when emitter is supplied', async () => {
		const mockXhr = spyOnXhr();
		const emitter = {
			emit: jest.fn(),
		} as any;
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
			emitter,
		});
		mockXhrResponse(mockXhr, mock200Response);
		await requestPromise;
		expect(emitter.emit).toHaveBeenCalledWith(SEND_UPLOAD_PROGRESS_EVENT, {
			name: 'MockUploadEvent',
		});
		expect(emitter.emit).toHaveBeenCalledWith(SEND_DOWNLOAD_PROGRESS_EVENT, {
			name: 'MockDownloadEvent',
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
				code: 'ERR_ABORTED',
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
				code: 'ERR_ABORTED',
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
		expect(mockXhr.getAllResponseHeaders).toBeCalledTimes(1);
	});

	it('should NOT process response when xhr is cleared', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
		});
		mockXhrResponse(mockXhr, mock200Response);
		await requestPromise;
		mockXhrResponse(mockXhr, mock200Response);
		expect(mockXhr.getAllResponseHeaders).toBeCalledTimes(1);
	});

	it('should set Blob response with ResponseBodyMixin when xhr.responseType is blob', async () => {
		const mockXhr = spyOnXhr();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'blob',
		});
		mockXhrResponse(mockXhr, {
			...mock200Response,
			body: mockBlobResponsePayload(mock200Response.body),
		});
		const { body } = await requestPromise;

		expect(await body!.blob()).toBe(String(body));

		await body!.text();
		const responseText = await body!.text();
		expect(responseText).toBe(mock200Response.body);
		expect(Blob.prototype.text).toBeCalledTimes(1); // validate memoization

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
		expect(await body.text()).toEqual(mock200Response.body);
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
		expect(mockXhr.getAllResponseHeaders).toBeCalledTimes(1);
	});

	it('should immediately reject with canceled error when signal is already aborted', async () => {
		const mockXhr = spyOnXhr();
		const abortController = new AbortController();
		abortController.abort();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
			abortSignal: abortController.signal,
		});
		await expect(requestPromise).rejects.toThrow(
			expect.objectContaining({
				message: 'canceled',
				code: 'ERR_CANCELED',
			})
		);
		expect(mockXhr.abort).toBeCalledTimes(1);
		expect(mockXhr.send).not.toBeCalled();
	});

	it('should reject with canceled error when signal is aborted', async () => {
		const mockXhr = spyOnXhr();
		const abortController = new AbortController();
		const requestPromise = xhrTransferHandler(defaultRequest, {
			responseType: 'text',
			abortSignal: abortController.signal,
		});
		abortController.abort();
		await expect(requestPromise).rejects.toThrow(
			expect.objectContaining({
				message: 'canceled',
				code: 'ERR_CANCELED',
			})
		);
		expect(mockXhr.abort).toBeCalledTimes(1);
		expect(mockXhr.send).toBeCalledTimes(1);
	});
});
