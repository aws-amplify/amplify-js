import { AWSCloudWatchProvider } from '../../src/Providers/AWSCloudWatchProvider';
import { AWSCloudWatchProviderOptions } from '../../src/types';
import {
	AWS_CLOUDWATCH_CATEGORY,
	AWS_CLOUDWATCH_PROVIDER_NAME,
} from '../../src/Util/Constants';
import { Credentials } from '../..';
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

const testConfig: AWSCloudWatchProviderOptions = {
	logGroupName: 'logGroup',
	logStreamName: 'logStream',
	region: 'us-west-2',
};

describe('AWSCloudWatchProvider', () => {
	describe('getCategoryName()', () => {
		it('should return the AWS_CLOUDWATCH_CATEGORY', () => {
			const provider = new AWSCloudWatchProvider();
			expect(provider.getCategoryName()).toBe(AWS_CLOUDWATCH_CATEGORY);
		});
	});

	describe('getProviderName()', () => {
		it('should return the AWS_CLOUDWATCH_PROVIDER_NAME', () => {
			const provider = new AWSCloudWatchProvider();
			expect(provider.getProviderName()).toBe(AWS_CLOUDWATCH_PROVIDER_NAME);
		});
	});

	describe('configure()', () => {
		it('should return a config with logGroupName, logStreamName, and region when given a config input', () => {
			const provider = new AWSCloudWatchProvider();
			const config = provider.configure(testConfig);

			expect(config).toStrictEqual(testConfig);
			expect(config).toHaveProperty('logGroupName');
			expect(config).toHaveProperty('logStreamName');
			expect(config).toHaveProperty('region');
		});

		it('should return an empty object when given no config input', () => {
			const provider = new AWSCloudWatchProvider();
			expect(provider.configure()).toStrictEqual({});
		});
	});

	describe('credentials test', () => {
		it('without credentials', async () => {
			const provider = new AWSCloudWatchProvider();
			provider.configure(testConfig);
			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return Promise.reject('err');
				});

			const action = async () => {
				await provider.createLogGroup({
					logGroupName: testConfig.logGroupName,
				});
			};

			expect(action()).rejects.toThrowError();
			spyon.mockRestore();
		});
	});

	describe('CloudWatch api tests', () => {
		beforeEach(() => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});
		});

		describe('createLogGroup test', () => {
			const createLogGroupParams = { logGroupName: 'group-name' };

			it('should send a valid request to the client without error', async () => {
				const provider = new AWSCloudWatchProvider(testConfig);
				const clientSpy = jest
					.spyOn(CloudWatchLogsClient.prototype, 'send')
					.mockImplementationOnce(async params => {
						return 'data';
					});

				await provider.createLogGroup(createLogGroupParams);
				expect(clientSpy.mock.calls[0][0].input).toEqual(createLogGroupParams);

				clientSpy.mockRestore();
			});

			it('should throw an error when the client detects an error', async () => {
				const provider = new AWSCloudWatchProvider(testConfig);
				const clientSpy = jest
					.spyOn(CloudWatchLogsClient.prototype, 'send')
					.mockImplementationOnce(async params => {
						throw Error;
					});

				const action = async () => {
					await provider.createLogGroup(createLogGroupParams);
				};

				expect(action()).rejects.toThrowError();
				clientSpy.mockRestore();
			});
		});

		describe('createLogStream test', () => {
			const params = {
				logGroupName: 'group-name',
				logStreamName: 'stream-name',
			};

			it('should send a valid request to the client without error', async () => {
				const provider = new AWSCloudWatchProvider(testConfig);
				const clientSpy = jest
					.spyOn(CloudWatchLogsClient.prototype, 'send')
					.mockImplementationOnce(async params => {
						return 'data';
					});

				await provider.createLogStream(params);
				expect(clientSpy.mock.calls[0][0].input).toEqual(params);

				clientSpy.mockRestore();
			});

			it('should throw an error when the client detects an error', async () => {
				const provider = new AWSCloudWatchProvider(testConfig);
				const clientSpy = jest
					.spyOn(CloudWatchLogsClient.prototype, 'send')
					.mockImplementationOnce(async params => {
						throw Error;
					});

				const action = async () => {
					await provider.createLogStream(params);
				};

				expect(action()).rejects.toThrowError();
				clientSpy.mockRestore();
			});
		});

		describe('getLogGroups test', () => {
			const params = {
				logGroupNamePrefix: 'group-name',
			};

			it('should send a valid request to the client without error', async () => {
				const provider = new AWSCloudWatchProvider(testConfig);
				const clientSpy = jest
					.spyOn(CloudWatchLogsClient.prototype, 'send')
					.mockImplementationOnce(async params => {
						return 'data';
					});

				await provider.getLogGroups(params);
				expect(clientSpy.mock.calls[0][0].input).toEqual(params);

				clientSpy.mockRestore();
			});

			it('should throw an error when the client detects an error', async () => {
				const provider = new AWSCloudWatchProvider(testConfig);
				const clientSpy = jest
					.spyOn(CloudWatchLogsClient.prototype, 'send')
					.mockImplementationOnce(async params => {
						throw Error;
					});

				const action = async () => {
					await provider.getLogGroups(params);
				};

				expect(action()).rejects.toThrowError();
				clientSpy.mockRestore();
			});
		});

		describe('getLogStreams test', () => {
			const params = {
				logGroupName: 'group-name',
				logStreamNamePrefix: 'stream-name',
			};

			it('should send a valid request to the client without error', async () => {
				const provider = new AWSCloudWatchProvider(testConfig);
				const clientSpy = jest
					.spyOn(CloudWatchLogsClient.prototype, 'send')
					.mockImplementationOnce(async params => {
						return 'data';
					});

				await provider.getLogStreams(params);
				expect(clientSpy.mock.calls[0][0].input).toEqual(params);

				clientSpy.mockRestore();
			});

			it('should throw an error when the client detects an error', async () => {
				const provider = new AWSCloudWatchProvider(testConfig);
				const clientSpy = jest
					.spyOn(CloudWatchLogsClient.prototype, 'send')
					.mockImplementationOnce(async params => {
						throw Error;
					});

				const action = async () => {
					await provider.getLogStreams(params);
				};

				expect(action()).rejects.toThrowError();
				clientSpy.mockRestore();
			});
		});

		describe('pushLogs test', () => {
			const params = [{ message: 'hello', timestamp: 1111 }];

			it('should send a valid request to the client without error', async () => {
				const provider = new AWSCloudWatchProvider(testConfig);
				const clientSpy = jest
					.spyOn(CloudWatchLogsClient.prototype, 'send')
					.mockImplementation(async params => {
						return 'data';
					});

				await provider.pushLogs(params);

				// DescribeLogGroups command
				expect(clientSpy.mock.calls[0][0].input).toEqual({
					logGroupNamePrefix: testConfig.logGroupName,
				});

				// CreateLogGroup command
				expect(clientSpy.mock.calls[1][0].input).toEqual({
					logGroupName: testConfig.logGroupName,
				});

				// DescribeLogStreams command
				expect(clientSpy.mock.calls[2][0].input).toEqual({
					logGroupName: testConfig.logGroupName,
					logStreamNamePrefix: testConfig.logStreamName,
				});

				// CreateLogStream command
				expect(clientSpy.mock.calls[3][0].input).toEqual({
					logGroupName: testConfig.logGroupName,
					logStreamName: testConfig.logStreamName,
				});

				// PutLogEvents command
				expect(clientSpy.mock.calls[4][0].input).toEqual({
					logGroupName: testConfig.logGroupName,
					logStreamName: testConfig.logStreamName,
					logEvents: params,
				});

				clientSpy.mockRestore();
			});

			it('should throw an error when the client detects an error', async () => {
				const provider = new AWSCloudWatchProvider(testConfig);
				jest
					.spyOn(CloudWatchLogsClient.prototype, 'send')
					.mockImplementation(async params => {
						throw Error;
					});

				const action = async () => {
					await provider.pushLogs(params);
				};

				expect(action()).rejects.toThrowError();

				return;
			});
		});
	});
});
