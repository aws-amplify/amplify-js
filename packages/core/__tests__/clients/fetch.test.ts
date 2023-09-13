import { fetchTransferHandler } from '../../src/clients/handlers/fetch';

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
	const mockPayloadValue = 'payload value';
	const mockFetch = jest.fn();

	beforeAll(() => {
		global['fetch'] = mockFetch;
	});

	beforeEach(() => {
		jest.clearAllMocks();
		mockFetch.mockResolvedValue(mockFetchResponse);
	});

	test('should support abort signal', async () => {
		const signal = new AbortController().signal;
		await fetchTransferHandler(mockRequest, { abortSignal: signal });
		expect(mockFetch).toBeCalledTimes(1);
		expect(mockFetch.mock.calls[0][1]).toEqual(
			expect.objectContaining({ signal })
		);
	});

	test('should support headers', async () => {
		mockFetchResponse.headers.forEach.mockImplementation((cb: any) => {
			cb('foo', 'bar');
		});
		const { headers } = await fetchTransferHandler(mockRequest, {});
		expect(headers).toEqual({ bar: 'foo' });
	});

	test('should support text() in response.body with caching', async () => {
		mockBody.text.mockResolvedValue(mockPayloadValue);
		const { body } = await fetchTransferHandler(mockRequest, {});
		if (!body) {
			fail('body should exist');
		}
		expect(await body.text()).toBe(mockPayloadValue);
		expect(await body.text()).toBe(mockPayloadValue);
		expect(mockBody.text).toBeCalledTimes(1); // test caching
	});

	test('should support blob() in response.body with caching', async () => {
		mockBody.blob.mockResolvedValue(mockPayloadValue);
		const { body } = await fetchTransferHandler(mockRequest, {});
		if (!body) {
			fail('body should exist');
		}
		expect(await body.blob()).toBe(mockPayloadValue);
		expect(await body.blob()).toBe(mockPayloadValue);
		expect(mockBody.blob).toBeCalledTimes(1); // test caching
	});

	test('should support json() in response.body with caching', async () => {
		mockBody.json.mockResolvedValue(mockPayloadValue);
		const { body } = await fetchTransferHandler(mockRequest, {});
		if (!body) {
			fail('body should exist');
		}
		expect(await body.json()).toBe(mockPayloadValue);
		expect(await body.json()).toBe(mockPayloadValue);
		expect(mockBody.json).toBeCalledTimes(1); // test caching
	});

	test.each(['GET', 'HEAD', 'DELETE'])(
		'should ignore request payload for %s request',
		async method => {
			await fetchTransferHandler(
				{ ...mockRequest, method, body: 'Mock Body' },
				{}
			);
			expect(mockFetch).toBeCalledTimes(1);
			expect(mockFetch.mock.calls[0][0].body).toBeUndefined();
		}
	);
});
