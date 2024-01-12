import { debounceCallback } from '../../src/utils/debounceCallback';

describe('test debounce callback', () => {
	const numberOfConcurrentCalls = 10;
	const mockServiceCallback = jest.fn();

	afterEach(() => {
		mockServiceCallback.mockClear();
	});

	it('should allow to invoke the callback when there is no concurrent calls', async () => {
		const debouncedCallback = debounceCallback(mockServiceCallback);

		debouncedCallback();
		expect(mockServiceCallback).toHaveBeenCalledTimes(1);
	});

	it('should invoke the callback one time during concurrent sync calls', () => {
		const debouncedCallback = debounceCallback(mockServiceCallback);
		for (let i = 0; i < numberOfConcurrentCalls; i++) {
			debouncedCallback();
		}
		expect(mockServiceCallback).toHaveBeenCalledTimes(1);
	});

	it('should allow to invoke the callback again after the promise has being resolved', async () => {
		const debouncedCallback = debounceCallback(mockServiceCallback);
		for (let i = 0; i < numberOfConcurrentCalls; i++) {
			debouncedCallback();
		}

		await debouncedCallback();

		debouncedCallback();
		expect(mockServiceCallback).toHaveBeenCalledTimes(2);
	});

	it('should return a value once the callback is resolved', async () => {
		const mockReturnValue = { id: 1 };
		mockServiceCallback.mockImplementation(() => mockReturnValue);
		const debouncedCallback = debounceCallback(mockServiceCallback);
		const result = await debouncedCallback();
		expect(result).toEqual(mockReturnValue);
		expect(mockServiceCallback).toHaveBeenCalledTimes(1);
	});
});
