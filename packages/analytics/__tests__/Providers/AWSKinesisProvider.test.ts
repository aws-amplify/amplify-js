import { Credentials } from '@aws-amplify/core';
import { AWSKinesisProvider as KinesisProvider } from '../../src/Providers/AWSKinesisProvider';
import { KinesisClient, PutRecordsCommand } from '@aws-sdk/client-kinesis';

jest.useFakeTimers();

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

jest.mock('@aws-sdk/client-kinesis');

beforeEach(() => {
	KinesisClient.prototype.send = jest.fn(async command => {
		if (command instanceof PutRecordsCommand) {
			return 'data';
		}
	});
});

afterEach(() => {
	jest.restoreAllMocks();
});

describe('kinesis provider test', () => {
	describe('getCategory test', () => {
		test('happy case', () => {
			const analytics = new KinesisProvider();

			expect(analytics.getCategory()).toBe('Analytics');
		});
	});

	describe('getProviderName test', () => {
		test('happy case', () => {
			const analytics = new KinesisProvider();

			expect(analytics.getProviderName()).toBe('AWSKinesis');
		});
	});

	describe('configure test', () => {
		test('happy case', () => {
			const analytics = new KinesisProvider();

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
			const analytics = new KinesisProvider();

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return Promise.reject('err');
				});

			expect(await analytics.record('params')).toBe(false);
		});

		test('record with immediate transmission', async () => {
			const kinesisProvider = new KinesisProvider();
			const putRecordCommandSpy = jest.spyOn(
				PutRecordsCommand.prototype,
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
			expect(putRecordCommandSpy).toHaveBeenCalledTimes(1);
			expect(putRecordCommandSpy).toHaveBeenCalledWith({
				Records: [
					{
						Data: new Uint8Array([123, 34, 100, 34, 58, 49, 125]), // Encoded data payload
						PartitionKey: 'partition-identityId',
					},
				],
				StreamName: 'testStream',
			});

			expect(KinesisClient.prototype.send).toHaveBeenCalledTimes(1);
		});

		test('record happy case', async () => {
			const analytics = new KinesisProvider();

			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
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
		});
	});

	describe('passing parameters to KinesisClient', () => {
		test('happy case', async () => {
			const config = {
				region: 'region1',
				endpoint: 'endpoint1',
			};

			const analytics = new KinesisProvider({ ...config });

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

			expect(KinesisClient).toHaveBeenCalledWith(
				expect.objectContaining(config)
			);
		});
	});
});
