import { Hub } from '@aws-amplify/core';
import { record as pinpointRecord } from '@aws-amplify/core/internals/providers/pinpoint';
import { ConsoleLogger } from '@aws-amplify/core';
import { record } from '../../../../src/providers/pinpoint';
import {
	resolveConfig,
	resolveCredentials,
} from '../../../../src/providers/pinpoint/utils';
import { AnalyticsValidationErrorCode } from '../../../../src/errors';
import { RecordInput } from '../../../../src/providers/pinpoint/types';
import {
	isAnalyticsEnabled,
	getAnalyticsUserAgentString,
} from '../../../../src/utils';
import {
	appId,
	identityId,
	region,
	event,
	credentials,
	config,
} from './testUtils/data';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/providers/pinpoint');
jest.mock('../../../../src/utils');
jest.mock('../../../../src/providers/pinpoint/utils');

describe('Pinpoint API: record', () => {
	// create spies
	const loggerWarnSpy = jest.spyOn(ConsoleLogger.prototype, 'warn');
	// create mocks
	const mockPinpointRecord = pinpointRecord as jest.Mock;
	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
	const mockIsAnalyticsEnabled = isAnalyticsEnabled as jest.Mock;
	const mockGetAnalyticsUserAgentString =
		getAnalyticsUserAgentString as jest.Mock;
	const mockHubDispatch = Hub.dispatch as jest.Mock;

	beforeEach(() => {
		mockPinpointRecord.mockResolvedValue(undefined);
		mockResolveConfig.mockReturnValue(config);
		mockIsAnalyticsEnabled.mockReturnValue(true);
		mockGetAnalyticsUserAgentString.mockReturnValue('mock-user-agent');
		mockResolveCredentials.mockResolvedValue({
			credentials,
			identityId,
		});
	});

	afterEach(() => {
		mockPinpointRecord.mockReset();
		mockResolveConfig.mockReset();
		mockIsAnalyticsEnabled.mockReset();
		mockGetAnalyticsUserAgentString.mockReset();
		mockResolveCredentials.mockReset();
		mockHubDispatch.mockClear();
	});

	it('invokes the core record implementation', async () => {
		record(event);

		expect(mockResolveCredentials).toBeCalledTimes(1);
		expect(mockResolveConfig).toBeCalledTimes(1);

		await new Promise(process.nextTick);

		expect(mockPinpointRecord).toBeCalledTimes(1);
		expect(mockPinpointRecord).toBeCalledWith({
			appId,
			category: 'Analytics',
			credentials,
			event,
			identityId,
			region,
			userAgentValue: expect.any(String),
		});
	});

	it('logs an error when credentials can not be fetched', async () => {
		mockResolveCredentials.mockRejectedValue(new Error('Mock Error'));

		record(event);

		await new Promise(process.nextTick);

		expect(mockPinpointRecord).not.toBeCalled();
		expect(loggerWarnSpy).toBeCalledWith(expect.any(String), expect.any(Error));
	});

	it('throws a validation error when event does not specify a name', () => {
		const mockParams = {};

		try {
			record(mockParams as RecordInput);
		} catch (e) {
			expect(e.name).toEqual(AnalyticsValidationErrorCode.NoEventName);
		}

		expect.assertions(1);
	});

	it('should not enqueue an event when Analytics has been disable', async () => {
		mockIsAnalyticsEnabled.mockReturnValue(false);

		record(event);

		await new Promise(process.nextTick);

		expect(mockPinpointRecord).not.toBeCalled();
	});

	it('should dispatch a Hub event', async () => {
		record(event);

		await new Promise(process.nextTick);

		expect(mockHubDispatch).toBeCalledWith(
			'analytics',
			{ event: 'record', data: event, message: 'Recording Analytics event' },
			'Analytics',
			expect.anything()
		);
	});
});
