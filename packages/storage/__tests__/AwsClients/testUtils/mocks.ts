// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { XhrSpy } from './types';

/**
 * Mock XMLHttpRequest instance so we can spy on the methods and listeners.
 *
 * @internal
 */
export const spyOnXhr = (): XhrSpy => {
	const uploadListeners: XhrSpy['uploadListeners'] = {};
	const listeners: XhrSpy['listeners'] = {};
	const mockRequest = {
		open: jest.fn(),
		setRequestHeader: jest.fn(),
		responseType: '',
		send: jest.fn(),
		getAllResponseHeaders: jest.fn(),
		upload: {
			addEventListener: jest.fn().mockImplementation((event, cb) => {
				uploadListeners[event] = uploadListeners[event] || [];
				uploadListeners[event]!.push(cb);
			}),
		},
		addEventListener: jest.fn().mockImplementation((event, cb) => {
			listeners[event] = listeners[event] || [];
			listeners[event]!.push(cb);
		}),
		abort: jest.fn(),
	};
	window['XMLHttpRequest'] = jest.fn(() => mockRequest) as any;
	return Object.assign(mockRequest, {
		uploadListeners,
		listeners,
	}) as unknown as XhrSpy;
};

/**
 * Mock a blob response payload.
 *
 * @internal
 */
export const mockBlobResponsePayload = (body: string) => 'blob: ' + body;

/**
 * Mock XMLHttpRequest's response and invoke the corresponding listeners on given mock XHR instance.
 *
 * @internal
 */
export const mockXhrResponse = (
	mockXhr: XhrSpy,
	response: {
		status: number;
		// XHR's raw header string. @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders#return_value
		headerString: string;
		body: string;
	}
) => {
	mockXhr.readyState = XMLHttpRequest.DONE;
	mockXhr.status = response.status;
	Object.defineProperty(mockXhr, 'responseText', {
		get: () => {
			if (mockXhr.responseType === 'text') {
				return response.body as string;
			}
			throw new Error(
				`Cannot read responseText when responseType is ${mockXhr.responseType}`
			);
		},
		configurable: true,
	});
	(Blob.prototype.text as jest.Mock).mockImplementation(async () => {
		if (
			typeof response.body !== 'string' ||
			!response.body.startsWith('blob: ')
		) {
			throw new Error(
				'Attempt to read blob response body that is not mocked as blob'
			);
		}
		return response.body.slice('blob: '.length);
	});
	mockXhr.response = response.body;
	(mockXhr.getAllResponseHeaders as jest.Mock).mockReturnValue(
		response.headerString
	);
	mockXhr.uploadListeners.progress?.forEach(cb => {
		cb({ name: 'MockUploadEvent' } as any);
	});
	mockXhr.listeners.progress?.forEach(cb => {
		cb({ name: 'MockDownloadEvent' } as any);
	});
	mockXhr.listeners.readystatechange?.forEach(cb => {
		cb({} as any);
	});
};

/**
 * Mock XMLHttpRequest's error and invoke the corresponding listeners on given mock XHR instance.
 *
 * @internal
 */
export const triggerNetWorkError = (mockXhr: XhrSpy) => {
	const rawError = new Error('Lower level network error');
	mockXhr.listeners.error?.forEach(cb => {
		cb(rawError as any);
	});
};

/**
 * Mock XMLHttpRequest's abort and invoke the corresponding listeners on given mock XHR instance.
 *
 * @internal
 */
export const triggerServerSideAbort = (mockXhr: XhrSpy) => {
	mockXhr.listeners.abort?.forEach(cb => {
		cb({} as any);
	});
};

/**
 * Mock XMLHttpRequest's given ready state and invoke the corresponding listeners on given mock XHR instance.
 *
 * @internal
 */
export const mockXhrReadyState = (mockXhr: XhrSpy, readyState: number) => {
	mockXhr.readyState = readyState;
	mockXhr.listeners.readystatechange?.forEach(cb => {
		cb({} as any);
	});
};
