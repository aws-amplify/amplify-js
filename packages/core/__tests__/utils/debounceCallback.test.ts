import { debounceCallback } from '../../src/utils/debounceCallback';

jest.useFakeTimers();

describe('test debounce callback', () => {
	const numberOfConcurrentCalls = 10;
	const mockServiceCallback = jest.fn();
	const mockSetTimeout = jest.spyOn(globalThis, 'setTimeout');

	afterEach(() => {
		mockServiceCallback.mockClear();
		mockSetTimeout.mockClear();
	});

	it('should invoke the callback one time during concurrent calls', () => {
		const debouncedCallback = debounceCallback(mockServiceCallback, 100);
		for (let i = 0; i < numberOfConcurrentCalls; i++) {
			debouncedCallback();
		}
		expect(mockServiceCallback).toHaveBeenCalledTimes(1);
		expect(mockSetTimeout).toHaveBeenCalledTimes(numberOfConcurrentCalls);
	});

	it('should allow to invoke the callback when there is no concurrent calls', () => {
		const debouncedCallback = debounceCallback(mockServiceCallback, 100);

		debouncedCallback();
		expect(mockServiceCallback).toHaveBeenCalledTimes(1);
		expect(mockSetTimeout).toHaveBeenCalledTimes(1);
	});

	it('should allow to invoke the callback after concurrent calls have being made.', () => {
		const debouncedCallback = debounceCallback(mockServiceCallback, 100);
		for (let i = 0; i < numberOfConcurrentCalls; i++) {
			debouncedCallback();
		}

		jest.runAllTimers();
		debouncedCallback();
		expect(mockServiceCallback).toHaveBeenCalledTimes(2);
		expect(mockSetTimeout).toHaveBeenCalledTimes(numberOfConcurrentCalls + 1);
	});

	it('should return a value once debounced function is invoked', () => {
		const mockReturnValue = { id: 1 };
		mockServiceCallback.mockImplementation(() => mockReturnValue);
		const debouncedCallback = debounceCallback(mockServiceCallback, 100);
		const result = debouncedCallback();
		expect(result).toEqual(mockReturnValue);
		expect(mockServiceCallback).toHaveBeenCalledTimes(1);
		expect(mockSetTimeout).toHaveBeenCalledTimes(1);
	});
});
