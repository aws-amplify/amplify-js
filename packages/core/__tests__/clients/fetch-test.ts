const mockUnfetch = jest.fn();
jest.mock('isomorphic-unfetch', () => {
	global['fetch'] = mockUnfetch;
});

import { fetchTransferHandler } from '../../src/clients/fetch';

describe(fetchTransferHandler.name, () => {
	const mockBody = {
		text: jest.fn(),
		blob: jest.fn(),
		json: jest.fn(),
	};
	const mockFetchResponse = Object.assign(
		{
			status: 200,
			headers: { forEach: jest.fn() },
			body: {},
		},
		mockBody
	);
	const mockRequest = {
		method: 'GET' as const,
		headers: {},
		url: new URL('https://foo.bar'),
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUnfetch.mockResolvedValue(mockFetchResponse);
	});

	test('should support abort signal', async () => {
		const signal = new AbortController().signal;
		await fetchTransferHandler(mockRequest, { abortSignal: signal });
		expect(mockUnfetch).toBeCalledTimes(1);
		expect(mockUnfetch.mock.calls[0][1]).toEqual(
			expect.objectContaining({ signal })
		);
	});

	test('should support text() in response.body', async () => {
		const { body } = await fetchTransferHandler(mockRequest, {});
		if (!body) {
			fail('body should exist');
		}
		await body.text();
		expect(mockBody.text).toBeCalledTimes(1);
	});

	test('should support blob() in response.body', async () => {
		const { body } = await fetchTransferHandler(mockRequest, {});
		if (!body) {
			fail('body should exist');
		}
		await body.blob();
		expect(mockBody.blob).toBeCalledTimes(1);
	});

	test('should support json() in response.body', async () => {
		const { body } = await fetchTransferHandler(mockRequest, {});
		if (!body) {
			fail('body should exist');
		}
		await body.json();
		expect(mockBody.json).toBeCalledTimes(1);
	});

	test.each(['GET', 'HEAD', 'DELETE'])(
		'should ignore request payload for %s request',
		async method => {
			await fetchTransferHandler(
				{ ...mockRequest, method, body: 'Mock Body' },
				{}
			);
			expect(mockUnfetch).toBeCalledTimes(1);
			expect(mockUnfetch.mock.calls[0][0].body).toBeUndefined();
		}
	);
});
