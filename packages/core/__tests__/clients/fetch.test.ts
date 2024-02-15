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
		mockBody,
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

	it('should support abort signal', async () => {
		const signal = new AbortController().signal;
		await fetchTransferHandler(mockRequest, { abortSignal: signal });
		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(mockFetch.mock.calls[0][1]).toEqual(
			expect.objectContaining({ signal }),
		);
	});

	it('should configure cache', async () => {
		const cacheMode = 'no-store';
		await fetchTransferHandler(mockRequest, { cache: cacheMode });
		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(mockFetch.mock.calls[0][1]).toEqual(
			expect.objectContaining({ cache: cacheMode }),
		);
	});

	it('should set credentials options to "include" if cross domain credentials is set', async () => {
		await fetchTransferHandler(mockRequest, {
			withCrossDomainCredentials: true,
		});
		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(mockFetch.mock.calls[0][1]).toEqual(
			expect.objectContaining({ credentials: 'include' }),
		);
	});

	it('should set credentials options to "same-origin" if cross domain credentials is not set', async () => {
		await fetchTransferHandler(mockRequest, {});
		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(mockFetch.mock.calls[0][1]).toEqual(
			expect.objectContaining({ credentials: 'same-origin' }),
		);
	});

	it('should support headers', async () => {
		mockFetchResponse.headers.forEach.mockImplementation((cb: any) => {
			cb('foo', 'bar');
		});
		const { headers } = await fetchTransferHandler(mockRequest, {});
		expect(headers).toEqual({ bar: 'foo' });
	});

	it('should support text() in response.body with caching', async () => {
		mockBody.text.mockResolvedValue(mockPayloadValue);
		const { body } = await fetchTransferHandler(mockRequest, {});
		if (!body) {
			fail('body should exist');
		}
		expect(await body.text()).toBe(mockPayloadValue);
		expect(await body.text()).toBe(mockPayloadValue);
		expect(mockBody.text).toHaveBeenCalledTimes(1); // test caching
	});

	it('should support blob() in response.body with caching', async () => {
		mockBody.blob.mockResolvedValue(mockPayloadValue);
		const { body } = await fetchTransferHandler(mockRequest, {});
		if (!body) {
			fail('body should exist');
		}
		expect(await body.blob()).toBe(mockPayloadValue);
		expect(await body.blob()).toBe(mockPayloadValue);
		expect(mockBody.blob).toHaveBeenCalledTimes(1); // test caching
	});

	it('should support json() in response.body with caching', async () => {
		mockBody.json.mockResolvedValue(mockPayloadValue);
		const { body } = await fetchTransferHandler(mockRequest, {});
		if (!body) {
			fail('body should exist');
		}
		expect(await body.json()).toBe(mockPayloadValue);
		expect(await body.json()).toBe(mockPayloadValue);
		expect(mockBody.json).toHaveBeenCalledTimes(1); // test caching
	});

	test.each(['GET', 'HEAD', 'DELETE'])(
		'should ignore request payload for %s request',
		async method => {
			await fetchTransferHandler(
				{ ...mockRequest, method, body: 'Mock Body' },
				{},
			);
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch.mock.calls[0][0].body).toBeUndefined();
		},
	);
});
