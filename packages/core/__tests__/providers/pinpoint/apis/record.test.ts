import { v4 } from 'uuid';
import { putEvents as clientPutEvents } from '../../../../src/awsClients/pinpoint';
import { record } from '../../../../src/providers/pinpoint/apis';
import { updateEndpoint } from '../../../../src/providers/pinpoint/apis/updateEndpoint';
import { resolveEndpointId } from '../../../../src/providers/pinpoint/utils';
import {
	appId,
	category,
	credentials,
	endpointId,
	region,
	identityId,
	event,
	uuid,
} from '../testUtils/data';
import { getEventBuffer } from '../../../../src/providers/pinpoint/utils/getEventBuffer';
import {
	SESSION_START_EVENT,
	SESSION_STOP_EVENT,
} from '../../../../src/utils/sessionListener';

jest.mock('uuid');
jest.mock('../../../../src/awsClients/pinpoint');
jest.mock('../../../../src/providers/pinpoint/utils');
jest.mock('../../../../src/providers/pinpoint/apis/updateEndpoint');
jest.mock('../../../../src/providers/pinpoint/utils/getEventBuffer');

describe('Pinpoint Provider API: record', () => {
	const mockGetEventBuffer = getEventBuffer as jest.Mock;
	const mockClientPutEvents = clientPutEvents as jest.Mock;
	const mockResolveEndpointId = resolveEndpointId as jest.Mock;
	const mockUpdateEndpoint = updateEndpoint as jest.Mock;
	const mockBufferPush = jest.fn();
	const mockUuid = v4 as jest.Mock;

	beforeEach(() => {
		mockUuid.mockReturnValue(uuid);
		mockUpdateEndpoint.mockResolvedValue(undefined);
		mockResolveEndpointId.mockReturnValue(endpointId);
		mockGetEventBuffer.mockReturnValue({
			push: mockBufferPush,
		});
	});

	afterEach(() => {
		mockClientPutEvents.mockClear();
		mockUpdateEndpoint.mockReset();
		mockResolveEndpointId.mockReset();
		mockGetEventBuffer.mockReset();
		mockBufferPush.mockReset();
	});

	it('uses an existing enpoint if available', async () => {
		await record({
			appId,
			category,
			credentials,
			event,
			identityId,
			region,
		});

		expect(mockUpdateEndpoint).not.toHaveBeenCalled();
		expect(mockBufferPush).toHaveBeenCalledWith(
			expect.objectContaining({
				endpointId,
				event,
				session: expect.any(Object),
				timestamp: expect.any(String),
			}),
		);
	});

	it('does not invoke the service API directly', async () => {
		await record({
			appId,
			category,
			credentials,
			event,
			identityId,
			region,
		});

		expect(mockClientPutEvents).not.toHaveBeenCalled();
	});

	it('reuses an existing session if it exists', async () => {
		await record({
			appId,
			category,
			credentials,
			event,
			identityId,
			region,
		});

		mockUuid.mockReturnValue('new-uuid');

		await record({
			appId,
			category,
			credentials,
			event,
			identityId,
			region,
		});

		expect(mockBufferPush).toHaveBeenCalledWith(
			expect.objectContaining({
				endpointId,
				event,
				session: expect.any(Object),
				timestamp: expect.any(String),
			}),
		);
	});

	it('should start and stop sessions when appropriate events are received', async () => {
		const mockStartEvent = {
			name: SESSION_START_EVENT,
		};
		const mockEndEvent = {
			name: SESSION_STOP_EVENT,
		};

		mockUuid.mockReturnValue('new-uuid');

		await record({
			appId,
			category,
			credentials,
			event: mockStartEvent,
			identityId,
			region,
		});

		expect(mockBufferPush).toHaveBeenCalledWith(
			expect.objectContaining({
				endpointId,
				event: mockStartEvent,
				session: {
					Id: 'new-uuid',
					StartTimestamp: expect.any(String),
				},
				timestamp: expect.any(String),
			}),
		);

		// End the session
		mockUuid.mockReturnValue('new-uuid-2'); // Ensure the original session is ended
		await record({
			appId,
			category,
			credentials,
			event: mockEndEvent,
			identityId,
			region,
		});

		expect(mockBufferPush).toHaveBeenLastCalledWith(
			expect.objectContaining({
				endpointId,
				event: mockEndEvent,
				session: {
					Id: 'new-uuid',
					Duration: expect.any(Number),
					StartTimestamp: expect.any(String),
					StopTimestamp: expect.any(String),
				},
				timestamp: expect.any(String),
			}),
		);
	});

	it('throws an error if it is unable to resolve the endpoint ID', async () => {
		mockResolveEndpointId.mockImplementation(() => {
			throw new Error();
		});

		await expect(
			record({ appId, category, credentials, event, identityId, region }),
		).rejects.toThrow();
	});
});
