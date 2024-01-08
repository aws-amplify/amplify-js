import { getTimestamp } from '../../../src/logging/utils';

describe('logging time utils', () => {
	const mockDate = new Date('2024-01-01T17:30:00Z');
	jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

	it('should getTimestamp in format', () => {
		expect(getTimestamp()).toEqual('30:00.0');
	});
});
