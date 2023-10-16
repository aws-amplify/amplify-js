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

		expect(mockUpdateEndpoint).not.toBeCalled();
		expect(mockBufferPush).toBeCalledWith(
			expect.objectContaining({
				endpointId,
				event,
				session: expect.any(Object),
				timestamp: expect.any(String),
			})
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

		expect(mockClientPutEvents).not.toBeCalled();
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

		expect(mockBufferPush).toBeCalledWith(
			expect.objectContaining({
				endpointId,
				event,
				session: expect.any(Object),
				timestamp: expect.any(String),
			})
		);
	});

	it('throws an error if it is unable to resolve the endpoint ID', async () => {
		mockResolveEndpointId.mockImplementation(() => {
			throw new Error();
		});

		await expect(
			record({ appId, category, credentials, event, identityId, region })
		).rejects.toThrow();
	});
});
