import { XhrSpy } from './types';

// Mock XMLHttpRequest instance so we can spy on the methods and listeners.
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
		body: BodyInit;
	}
) => {
	mockXhr.readyState = XMLHttpRequest.DONE;
	mockXhr.status = response.status;
	mockXhr.responseText = `text from raw response: ${response.body}`;
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
