import {
	FirehoseClient,
	PutRecordBatchCommand,
} from '@aws-sdk/client-firehose';
import { Credentials } from '@aws-amplify/core';
import KinesisFirehoseProvider from '../../src/Providers/AWSKinesisFirehoseProvider';

jest.mock('@aws-sdk/client-firehose');

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

jest.useFakeTimers();

beforeEach(() => {
	FirehoseClient.prototype.send = jest.fn(async command => {
		if (command instanceof PutRecordBatchCommand) {
			return 'data';
		}
	});
});

afterEach(() => {
	jest.restoreAllMocks();
});

describe('kinesis firehose provider test', () => {
	describe('getCategory test', () => {
		test('happy case', () => {
			const analytics = new KinesisFirehoseProvider();

			expect(analytics.getCategory()).toBe('Analytics');
		});
	});

	describe('getProviderName test', () => {
		test('happy case', () => {
			const analytics = new KinesisFirehoseProvider();

			expect(analytics.getProviderName()).toBe('AWSKinesisFirehose');
		});
	});

	describe('configure test', () => {
		test('happy case', () => {
			const analytics = new KinesisFirehoseProvider();

			expect(analytics.configure({ region: 'region1' })).toEqual({
				bufferSize: 1000,
				flushInterval: 5000,
				flushSize: 100,
				region: 'region1',
				resendLimit: 5,
			});
		});
	});

	describe('record test', () => {
		test('record without credentials', async () => {
			const analytics = new KinesisFirehoseProvider();

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return Promise.reject('err');
				});

			expect(await analytics.record('params')).toBe(false);
			spyon.mockRestore();
		});

		test('record happy case', async () => {
			const analytics = new KinesisFirehoseProvider();
			analytics.configure({ region: 'region1' });

			const spyon = jest.spyOn(FirehoseClient.prototype, 'send');

			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			await analytics.record({
				event: {
					data: {
						data: 'data',
					},
					streamName: 'stream',
				},
				config: {},
			});

			jest.advanceTimersByTime(6000);

			expect(spyon).toBeCalled();

			spyon.mockRestore();
		});
	});
});
