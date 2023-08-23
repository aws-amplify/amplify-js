import { v4 } from 'uuid';
import { putEvents as clientPutEvents } from '../../../../src/AwsClients/Pinpoint';
import { record } from '../../../../src/providers/pinpoint/apis';
import { updateEndpoint } from '../../../../src/providers/pinpoint/apis/updateEndpoint';
import { getEndpointId } from '../../../../src/providers/pinpoint/utils';
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
import { getExpectedPutEventsInput } from './testUtils/getExpectedPutEventsInput';

jest.mock('uuid');
jest.mock('../../../../src/AwsClients/Pinpoint');
jest.mock('../../../../src/providers/pinpoint/utils');
jest.mock('../../../../src/providers/pinpoint/apis/updateEndpoint');

describe('Pinpoint Provider API: record', () => {
	const mockClientPutEvents = clientPutEvents as jest.Mock;
	const mockGetEndpointId = getEndpointId as jest.Mock;
	const mockUpdateEndpoint = updateEndpoint as jest.Mock;
	const mockUuid = v4 as jest.Mock;

	beforeEach(() => {
		mockUuid.mockReturnValue(uuid);
		mockClientPutEvents.mockClear();
		mockUpdateEndpoint.mockReset();
		mockUpdateEndpoint.mockResolvedValue(undefined);
		mockGetEndpointId.mockReset();
		mockGetEndpointId.mockReturnValue(endpointId);
	});

	it('calls the service API if an existing endpoint is available', async () => {
		await record({
			appId,
			category,
			credentials,
			event,
			identityId,
			region,
		});

		expect(mockClientPutEvents).toBeCalledWith(
			{ credentials, region },
			getExpectedPutEventsInput({})
		);
		expect(mockUpdateEndpoint).toBeCalledTimes(0);
	});

	it("prepares an endpoint if one hasn't been setup", async () => {
		mockGetEndpointId.mockReturnValueOnce(undefined);

		await record({
			appId,
			category,
			credentials,
			event,
			identityId,
			region,
		});

		expect(mockUpdateEndpoint).toBeCalledTimes(1);
		expect(mockUpdateEndpoint).toBeCalledWith({
			appId,
			category,
			credentials,
			identityId,
			region,
		});
		expect(mockClientPutEvents).toBeCalledWith(
			{ credentials, region },
			getExpectedPutEventsInput({})
		);
	});

	it('does not invoke the service API if buffering events', async () => {
		await record({
			appId,
			category,
			credentials,
			event,
			identityId,
			region,
			sendImmediately: false,
		});

		expect(mockClientPutEvents).toBeCalledTimes(0);

		// TODO(v6) Test that event was sent to the buffer
	});

	it('reuses an existing session if it exists', async () => {
		const expectedSessionId = uuid;
		const newUuid = 'new-uuid';

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

		expect(mockClientPutEvents).toBeCalledWith(
			{ credentials, region },
			getExpectedPutEventsInput({
				eventId: newUuid,
				sessionId: expectedSessionId,
			})
		);
	});

	it('throws an error if it is unable to determine the endpoint ID', async () => {
		mockGetEndpointId.mockReturnValue(undefined);

		try {
			await record({
				appId,
				category,
				credentials,
				event,
				identityId,
				region,
			});
		} catch (e) {
			expect(e.message).toEqual('Endpoint was not created.');
		}

		expect.assertions(1);
	});
});
