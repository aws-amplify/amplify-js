import { deDupeAsyncRequests } from '../../src/utils/deDupeAsyncRequests';

describe('test debounce callback', () => {
	const numberOfConcurrentCalls = 10;
	const mockServiceCallback = jest.fn();

	beforeEach(() => {
		mockServiceCallback.mockImplementation(async () => {});
	});
	afterEach(() => {
		mockServiceCallback.mockClear();
	});

	it('should allow to invoke the callback when there is no concurrent calls', async () => {
		const debouncedCallback = deDupeAsyncRequests(mockServiceCallback);

		debouncedCallback();
		expect(mockServiceCallback).toHaveBeenCalledTimes(1);
	});

	it('should invoke the callback one time during concurrent sync calls', () => {
		const debouncedCallback = deDupeAsyncRequests(mockServiceCallback);
		for (let i = 0; i < numberOfConcurrentCalls; i++) {
			debouncedCallback();
		}
		expect(mockServiceCallback).toHaveBeenCalledTimes(1);
	});

	it('should allow to invoke the callback again after the promise has being resolved', async () => {
		const debouncedCallback = deDupeAsyncRequests(mockServiceCallback);
		for (let i = 0; i < numberOfConcurrentCalls; i++) {
			debouncedCallback();
		}

		await debouncedCallback();

		debouncedCallback();
		expect(mockServiceCallback).toHaveBeenCalledTimes(2);
	});

	it('should return a value once the callback is resolved', async () => {
		const mockReturnValue = { id: 1 };
		
		mockServiceCallback.mockImplementation(async () => mockReturnValue);
		const debouncedCallback = deDupeAsyncRequests(mockServiceCallback);
		const result = await debouncedCallback();
		expect(result).toEqual(mockReturnValue);
		expect(mockServiceCallback).toHaveBeenCalledTimes(1);
	});
});
