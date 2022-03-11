import {
	cloudWatchEventFromGeneric,
	cloudWatchLogEventBatch,
	truncateOversizedEvent,
} from '../../src/Providers/APIProvider/CloudWatchEventFormatter';
import { postOptions } from '../../src/Providers/APIProvider/Fetch';
import { APILoggingProvider } from '../../src/Providers/APIProvider/APILoggingProvider';
import {
	GenericLogEvent,
	LoggingProvider,
	APILoggingProviderOptions,
} from '../../src/types/types';
import { InputLogEvent } from '@aws-sdk/client-cloudwatch-logs';
import { getStringByteSize } from '../../src/';
import {
	AWS_CLOUDWATCH_BASE_BUFFER_SIZE,
	AWS_CLOUDWATCH_MAX_BATCH_EVENT_SIZE,
	AWS_CLOUDWATCH_MAX_EVENT_SIZE,
} from '../../src/Util/Constants';

const wait = async (ms: number) =>
	await new Promise(resolve => setTimeout(resolve, ms));
const LOCALHOST = 'http://localhost:3000';

describe('APILoggingProvider', () => {
	describe('Config', () => {
		afterEach(() => {
			jest.restoreAllMocks();
		});
		test('Config validation - no endpoint', () => {
			const error = jest.spyOn(console, 'error').mockImplementation(() => {});
			const config: any = {};
			new APILoggingProvider(config);

			expect(error).toBeCalledWith(
				expect.stringMatching(/Unable to start/),
				Error(
					'Invalid configuration. `config.endpoint` must be a string. Received: undefined'
				)
			);
		});

		test('Config validation - http', () => {
			const error = jest.spyOn(console, 'error').mockImplementation(() => {});
			const config: any = {
				endpoint: 'http://google.com',
			};
			new APILoggingProvider(config);

			expect(error).toBeCalledWith(
				expect.stringMatching(/Unable to start/),
				Error(
					'Invalid configuration. Only HTTPS endpoints are supported. Received: http:'
				)
			);
		});

		test('Config validation - allow http for localhost', () => {
			const error = jest.spyOn(console, 'error').mockImplementation(() => {});
			const config: any = {
				endpoint: LOCALHOST,
			};
			new APILoggingProvider(config);

			expect(error).not.toHaveBeenCalled();
		});
	});
	describe('Push logs', () => {
		let globalAny: any = globalThis;
		beforeEach(() => {
			globalAny.fetch = jest
				.fn()
				.mockImplementationOnce(
					(input: RequestInfo) =>
						<Promise<Response>>Promise.resolve({ ok: true })
				);
		});

		afterEach(() => {
			globalAny.fetch.mockClear();
		});

		test('Happy Path', async () => {
			const unitTestConfig = {
				endpoint: LOCALHOST,
				bufferInterval: 100, // 100ms
			};
			const apiLoggingProvider = new APILoggingProvider(unitTestConfig);

			const testLog: GenericLogEvent = {
				data: { a: 1 },
				level: 'WARN',
				message: 'Test Event',
				source: 'Unit Test',
				timestamp: 1000000000000,
			};

			const { timestamp, ...message } = testLog;

			const expectedBody = {
				body: JSON.stringify({
					logEvents: [
						{
							timestamp,
							message: JSON.stringify(message),
						},
					],
				}),
			};

			apiLoggingProvider.pushLog(testLog);
			await wait(200); // wait 200ms since our bufferInterval is 100ms

			expect(fetch).toHaveBeenCalledWith(
				LOCALHOST,
				expect.objectContaining(expectedBody)
			);
		});

		test('Happy Path + metadata', async () => {
			const unitTestConfig = {
				endpoint: LOCALHOST,
				bufferInterval: 100, // 100ms
				metadata: {
					appId: 123,
					username: 'bob',
				},
			};
			const apiLoggingProvider = new APILoggingProvider(unitTestConfig);

			const testLog: GenericLogEvent = {
				data: { a: 1 },
				level: 'WARN',
				message: 'Test Event',
				source: 'Unit Test',
				timestamp: 1000000000000,
			};

			const { timestamp, ...message } = testLog;

			const expectedBody = {
				body: JSON.stringify({
					logEvents: [
						{
							timestamp,
							message: JSON.stringify(message),
						},
					],
					metadata: {
						appId: 123,
						username: 'bob',
					},
				}),
			};

			apiLoggingProvider.pushLog(testLog);
			await wait(200); // wait 200ms since our bufferInterval is 100ms

			expect(fetch).toHaveBeenCalledWith(
				LOCALHOST,
				expect.objectContaining(expectedBody)
			);
		});
	});
});

describe('cloudWatchEventFromGeneric', () => {
	test('Generate CloudWatch event from generic', () => {
		const timestamp = Date.now();

		const genericEvent: GenericLogEvent = {
			level: 'DEBUG',
			source: 'test',
			timestamp,
			message: 'test message',
			data: { a: 1 },
		};

		const cloudWatchEvent: InputLogEvent = {
			message: JSON.stringify({
				level: 'DEBUG',
				source: 'test',
				message: 'test message',
				data: { a: 1 },
			}),
			timestamp,
		};

		expect(cloudWatchEventFromGeneric(genericEvent)).toEqual(cloudWatchEvent);
	});
});

describe('cloudWatchLogEventBatch', () => {});

describe('truncateOversizedEvent', () => {
	test('Truncate long message', () => {
		let longMessage = '';

		for (let i = 0; i < 20000; i++) {
			longMessage += 'test message ';
		}

		const cloudWatchEvent: InputLogEvent = {
			timestamp: Date.now(),
			message: JSON.stringify({
				level: 'DEBUG',
				source: 'test',
				message: longMessage,
				data: { a: 1 },
			}),
		};

		expect(getStringByteSize(cloudWatchEvent.message)).toBeGreaterThan(
			AWS_CLOUDWATCH_MAX_EVENT_SIZE
		);

		const truncated = truncateOversizedEvent(cloudWatchEvent);

		expect(getStringByteSize(truncated.message)).toBeLessThan(
			AWS_CLOUDWATCH_MAX_EVENT_SIZE
		);
	});

	test('Truncate large data object', () => {
		let data = {};

		for (let i = 0; i < 20000; i++) {
			data[`a${i}`] = 'test data ';
		}

		const cloudWatchEvent: InputLogEvent = {
			timestamp: Date.now(),
			message: JSON.stringify({
				level: 'DEBUG',
				source: 'test',
				message: 'test message',
				data,
			}),
		};

		expect(getStringByteSize(cloudWatchEvent.message)).toBeGreaterThan(
			AWS_CLOUDWATCH_MAX_EVENT_SIZE
		);

		const truncated = truncateOversizedEvent(cloudWatchEvent);

		expect(getStringByteSize(truncated.message)).toBeLessThan(
			AWS_CLOUDWATCH_MAX_EVENT_SIZE
		);
	});
});

describe('postOptions', () => {
	const body = { a: 1 };
	expect(postOptions(body)).toMatchInlineSnapshot(`
		Object {
		  "body": "{\\"a\\":1}",
		  "cache": "no-cache",
		  "credentials": "same-origin",
		  "headers": Object {
		    "Content-Type": "application/json",
		  },
		  "method": "POST",
		  "mode": "cors",
		}
	`);
});
