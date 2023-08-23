import { record } from '../../src/apis';
import { record as pinpointRecord } from '../../src/providers/pinpoint';
import { event } from './testUtils/data';

jest.mock('../../src/providers/pinpoint');

describe('Category API: record', () => {
	const mockPinpointRecord = pinpointRecord as jest.Mock;

	beforeEach(() => {
		mockPinpointRecord.mockReset();
		mockPinpointRecord.mockResolvedValue(undefined);
	});

	it('defers to the Pinpoint record implementation', async () => {
		const mockParams = {
			event,
		};

		await record(mockParams);

		expect(mockPinpointRecord).toBeCalledTimes(1);
		expect(mockPinpointRecord).toBeCalledWith(mockParams);
	});
});
