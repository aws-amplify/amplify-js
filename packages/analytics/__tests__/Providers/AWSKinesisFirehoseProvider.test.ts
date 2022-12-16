import {
	FirehoseClient,
	PutRecordBatchCommand,
} from '@aws-sdk/client-firehose';
import { Credentials } from '@aws-amplify/core';
import { AWSKinesisFirehoseProvider as KinesisFirehoseProvider } from '../../src/Providers/AWSKinesisFirehoseProvider';

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

		test('record with immediate transmission', async () => {
			const kinesisProvider = new KinesisFirehoseProvider();
			const putRecordBatchCommandSpy = jest.spyOn(
				PutRecordBatchCommand.prototype,
				'constructor'
			);

			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			await expect(
				kinesisProvider.record({
					event: {
						data: {
							d: 1,
						},
						streamName: 'testStream',
						immediate: true,
					},
					config: {},
				})
			).resolves.toBe(true);

			// Ensure PutRecord was constructed as expected
			expect(putRecordBatchCommandSpy).toHaveBeenCalledTimes(1);
			expect(putRecordBatchCommandSpy).toHaveBeenCalledWith({
				DeliveryStreamName: 'testStream',
				Records: [
					{
						Data: new Uint8Array([123, 34, 100, 34, 58, 49, 125]), // Encoded data payload
					},
				],
			});

			expect(FirehoseClient.prototype.send).toHaveBeenCalledTimes(1);
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
