import { record as pinpointRecord } from '@aws-amplify/core/internals/providers/pinpoint';
import { record } from '../../../../src/providers/pinpoint';
import {
	resolveConfig,
	resolveCredentials,
} from '../../../../src/providers/pinpoint/utils';
import { AnalyticsValidationErrorCode } from '../../../../src/errors';
import { RecordParameters } from '../../../../src/types';
import {
	appId,
	identityId,
	region,
	event,
	credentials,
	config,
} from './testUtils/data';

jest.mock('../../../../src/providers/pinpoint/utils');
jest.mock('@aws-amplify/core/internals/providers/pinpoint');

describe('Pinpoint API: record', () => {
	const mockPinpointRecord = pinpointRecord as jest.Mock;
	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;

	beforeEach(() => {
		mockPinpointRecord.mockReset();
		mockPinpointRecord.mockResolvedValue(undefined);
		mockResolveConfig.mockReset();
		mockResolveConfig.mockReturnValue(config);
		mockResolveCredentials.mockReset();
		mockResolveCredentials.mockResolvedValue({
			credentials,
			identityId,
		});
	});

	it('invokes the core record implementation', async () => {
		const mockParams = {
			event,
			sendImmediately: false,
		};

		await record(mockParams);

		expect(mockResolveCredentials).toBeCalledTimes(1);
		expect(mockResolveConfig).toBeCalledTimes(1);
		expect(mockPinpointRecord).toBeCalledTimes(1);
		expect(mockPinpointRecord).toBeCalledWith({
			appId,
			category: 'Analytics',
			credentials,
			event,
			identityId,
			region,
			sendImmediately: mockParams.sendImmediately,
			userAgentValue: expect.any(String),
		});
	});

	it('defaults to buffering events', async () => {
		const mockParams = { event };

		await record(mockParams);

		expect(mockPinpointRecord).toBeCalledWith({
			appId,
			category: 'Analytics',
			credentials,
			event,
			identityId,
			region,
			sendImmediately: false,
			userAgentValue: expect.any(String),
		});
	});

	it('throws a validation error when no event is provided', async () => {
		const mockParams = {} as RecordParameters;

		try {
			await record(mockParams);
		} catch (e) {
			expect(e.name).toEqual(AnalyticsValidationErrorCode.NoEvent);
		}

		expect.assertions(1);
	});

	it('throws a validation error when event does not specify a name', async () => {
		const mockParams = {
			event: {},
		};

		try {
			await record(mockParams);
		} catch (e) {
			expect(e.name).toEqual(AnalyticsValidationErrorCode.NoEventName);
		}

		expect.assertions(1);
	});
});
