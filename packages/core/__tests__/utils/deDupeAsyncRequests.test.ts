import { dedupeAsyncFunction } from '../../src/utils/dedupeAsyncFunction';

describe('dedupeAsyncFunction()', () => {
	const numberOfConcurrentCalls = 10;
	const mockServiceFunction = jest.fn();
	const mockReturnValue = { id: 1 };

	beforeEach(() => {
		mockServiceFunction.mockImplementation(async () => mockReturnValue);
	});
	afterEach(() => {
		mockServiceFunction.mockClear();
	});

	it('should invoke the mockServiceFunction', async () => {
		const deDupedFunction = dedupeAsyncFunction(mockServiceFunction);

		deDupedFunction();
		expect(mockServiceFunction).toHaveBeenCalledTimes(1);
	});

	it('should invoke the mockServiceFunction one time during concurrent sync calls', () => {
		const deDupedFunction = dedupeAsyncFunction(mockServiceFunction);
		for (let i = 0; i < numberOfConcurrentCalls; i++) {
			deDupedFunction();
		}
		expect(mockServiceFunction).toHaveBeenCalledTimes(1);
	});

	it('should return a value once the mockServiceFunction is resolved', async () => {
		const deDupedFunction = dedupeAsyncFunction(mockServiceFunction);
		expect(await deDupedFunction()).toEqual(mockReturnValue);
		expect(mockServiceFunction).toHaveBeenCalledTimes(1);
	});

	it('should allow to invoke the mockServiceFunction again after the promise has being resolved', async () => {
		const deDupedFunction = dedupeAsyncFunction(mockServiceFunction);
		for (let i = 0; i < numberOfConcurrentCalls; i++) {
			expect(deDupedFunction()).toBeInstanceOf(Promise);
		}

		// resolves the promise
		expect(await deDupedFunction()).toEqual(mockReturnValue);

		// should allow to call the mockServiceFunction again
		deDupedFunction();

		expect(mockServiceFunction).toHaveBeenCalledTimes(2);
	});
});
