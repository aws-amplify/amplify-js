/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { AWSLexProvider } from '../../src/Providers';
import { Credentials } from '@aws-amplify/core';
import {
	LexRuntimeServiceClient,
	PostContentCommand,
	PostTextCommand,
	PostTextCommandOutput,
} from '@aws-sdk/client-lex-runtime-service';

(global as any).Response = () => {};
(global as any).Response.prototype.arrayBuffer = (blob: Blob) => {
	return Promise.resolve(new ArrayBuffer(0));
};

// mock stream response
const createBlob = () => {
	return new Blob();
};

// bot config
const botConfig = {
	BookTrip: {
		name: 'BookTrip', // default provider 'AWSLexProvider'
		alias: '$LATEST',
		region: 'us-west-2',
	},
	OrderFlowers: {
		name: 'OrderFlowers',
		alias: '$LATEST',
		region: 'us-west-2',
		providerName: 'AWSLexProvider',
	},
};

LexRuntimeServiceClient.prototype.send = jest.fn((command, callback) => {
	if (command instanceof PostTextCommand) {
		if (command.input.inputText === 'done') {
			const result = {
				message: 'echo:' + command.input.inputText,
				dialogState: 'ReadyForFulfillment',
				slots: {
					m1: 'hi',
					m2: 'done',
				},
			};
			return Promise.resolve(result);
		} else if (command.input.inputText === 'error') {
			const result = {
				message: 'echo:' + command.input.inputText,
				dialogState: 'Failed',
			};
			return Promise.resolve(result);
		} else {
			const result = {
				message: 'echo:' + command.input.inputText,
				dialogState: 'ElicitSlot',
			};
			return Promise.resolve(result);
		}
	} else if (command instanceof PostContentCommand) {
		if (
			command.input.contentType ===
			'audio/x-l16; sample-rate=16000; channel-count=1'
		) {
			const bot = command.input.botName as string;
			const [botName, status] = bot.split(':');

			if (status === 'done') {
				// we add the status to the botName
				// because inputStream would just be a blob if type is voice
				const result = {
					message: 'voice:echo:' + command.input.botName,
					dialogState: 'ReadyForFulfillment',
					slots: {
						m1: 'voice:hi',
						m2: 'voice:done',
					},
					audioStream: createBlob(),
				};
				return Promise.resolve(result);
			} else if (status === 'error') {
				const result = {
					message: 'voice:echo:' + command.input.botName,
					dialogState: 'Failed',
					audioStream: createBlob(),
				};
				return Promise.resolve(result);
			} else {
				const result = {
					message: 'voice:echo:' + command.input.botName,
					dialogState: 'ElicitSlot',
					audioStream: createBlob(),
				};
				return Promise.resolve(result);
			}
		} else {
			if (command.input.inputStream === 'done') {
				const result = {
					message: 'echo:' + command.input.inputStream,
					dialogState: 'ReadyForFulfillment',
					slots: {
						m1: 'hi',
						m2: 'done',
					},
					audioStream: createBlob(),
				};
				return Promise.resolve(result);
			} else if (command.input.inputStream === 'error') {
				const result = {
					message: 'echo:' + command.input.inputStream,
					dialogState: 'Failed',
					audioStream: createBlob(),
				};
				return Promise.resolve(result);
			} else {
				const result = {
					message: 'echo:' + command.input.inputStream,
					dialogState: 'ElicitSlot',
					audioStream: createBlob(),
				};
				return Promise.resolve(result);
			}
		}
	}
}) as any;

afterEach(() => {
	jest.restoreAllMocks();
});

describe('Interactions', () => {
	// Test 'getProviderName' API
	test(`Is provider name 'AWSLexProvider'`, () => {
		const provider = new AWSLexProvider();
		expect(provider.getProviderName()).toEqual('AWSLexProvider');
	});

	// Test 'getCategory' API
	test(`Is category name 'Interactions'`, () => {
		const provider = new AWSLexProvider();
		expect(provider.getCategory()).toEqual('Interactions');
	});

	// Test 'configure' API
	describe('configure API', () => {
		const provider = new AWSLexProvider();

		test('Check if bot is successfully configured by validating config response', () => {
			expect(provider.configure(botConfig)).toEqual(botConfig);
		});

		test('configure multiple bots and re-configure existing bot successfully', () => {
			// config 1st bot
			expect(provider.configure(botConfig)).toEqual(botConfig);

			const anotherBot = {
				BookHotel: {
					name: 'BookHotel',
					alias: '$LATEST',
					region: 'us-west-2',
				},
			};
			// config 2nd bot
			expect(provider.configure(anotherBot)).toEqual({
				...botConfig,
				...anotherBot,
			});

			const anotherBotUpdated = {
				BookHotel: {
					name: 'BookHotel',
					alias: 'MyBookHotel',
					region: 'us-west-1',
				},
			};
			// re-configure updated 2nd bot
			// 2nd bot is overridden
			expect(provider.configure(anotherBotUpdated)).toEqual({
				...botConfig,
				...anotherBotUpdated,
			});
		});

		test('Configure bot with invalid config', () => {
			const invalidConfig = {
				BookHotel: {
					name: 'BookHotel',
					region: 'us-west-2',
					// alias: '$LATEST', this is required
				},
			};
			// @ts-ignore
			expect(() => provider.configure(invalidConfig)).toThrow(
				'invalid bot configuration'
			);
		});
	});

	// Test 'send' API
	describe('send API', () => {
		let provider;

		beforeEach(() => {
			jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => Promise.resolve({ identityId: '1234' }));

			provider = new AWSLexProvider();
			provider.configure(botConfig);
		});

		test('send simple text message to bot and fulfill', async () => {
			let response = await provider.sendMessage('BookTrip', 'hi');
			expect(response).toEqual({
				dialogState: 'ElicitSlot',
				message: 'echo:hi',
			});

			response = await provider.sendMessage('BookTrip', 'done');
			expect(response).toEqual({
				dialogState: 'ReadyForFulfillment',
				message: 'echo:done',
				slots: {
					m1: 'hi',
					m2: 'done',
				},
			});
		});

		test('send obj text message to bot and fulfill', async () => {
			let response = await provider.sendMessage('BookTrip', {
				content: 'hi',
				options: {
					messageType: 'text',
				},
			});
			expect(response).toEqual({
				dialogState: 'ElicitSlot',
				message: 'echo:hi',
				audioStream: new Uint8Array(),
			});

			response = await provider.sendMessage('BookTrip', {
				content: 'done',
				options: {
					messageType: 'text',
				},
			});
			expect(response).toEqual({
				dialogState: 'ReadyForFulfillment',
				message: 'echo:done',
				audioStream: new Uint8Array(),
				slots: {
					m1: 'hi',
					m2: 'done',
				},
			});
		});

		test('send obj voice message to bot and fulfill', async () => {
			const botconfig = {
				'BookTrip:hi': {
					name: 'BookTrip:hi',
					alias: '$LATEST',
					region: 'us-west-2',
				},
				'BookTrip:done': {
					name: 'BookTrip:done',
					alias: '$LATEST',
					region: 'us-west-2',
				},
			};
			provider.configure(botconfig);

			let response = await provider.sendMessage('BookTrip:hi', {
				content: createBlob(),
				options: {
					messageType: 'voice',
				},
			});
			expect(response).toEqual({
				dialogState: 'ElicitSlot',
				message: 'voice:echo:BookTrip:hi',
				audioStream: new Uint8Array(),
			});

			response = await provider.sendMessage('BookTrip:done', {
				content: createBlob(),
				options: {
					messageType: 'voice',
				},
			});
			expect(response).toEqual({
				dialogState: 'ReadyForFulfillment',
				message: 'voice:echo:BookTrip:done',
				audioStream: new Uint8Array(),
				slots: {
					m1: 'voice:hi',
					m2: 'voice:done',
				},
			});
		});

		test('send a text message bot But with no credentials', async () => {
			jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => Promise.reject({ identityId: undefined }));

			await expect(provider.sendMessage('BookTrip', 'hi')).rejects.toEqual(
				'No credentials'
			);
		});

		test('send message to non-existing bot', async () => {
			await expect(provider.sendMessage('unknownBot', 'hi')).rejects.toEqual(
				'Bot unknownBot does not exist'
			);
		});
	});

	// Test 'onComplete' API
	describe('onComplete API', () => {
		const callback = (err, confirmation) => {};
		let provider;

		beforeEach(() => {
			jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => Promise.resolve({ identityId: '1234' }));

			provider = new AWSLexProvider();
			provider.configure(botConfig);
		});

		test('Configure onComplete callback for a configured bot successfully', () => {
			expect(() => provider.onComplete('BookTrip', callback)).not.toThrow();
		});

		test('Configure onComplete callback for non-existing bot', async () => {
			expect(() => provider.onComplete('unknownBot', callback)).toThrow(
				'Bot unknownBot does not exist'
			);
		});
	});

	// Test 'reportBotStatus' API
	describe('reportBotStatus API', () => {
		// jest.useFakeTimers();
		jest.useFakeTimers();
		let provider;

		let inProgressResp;
		let completeSuccessResp;
		let completeFailResp;

		const inProgressCallback = (err, confirmation) =>
			fail(`callback shouldn't be called`);

		const completeSuccessCallback = (err, confirmation) => {
			expect(err).toEqual(null);
			expect(confirmation).toEqual({ slots: { m1: 'hi', m2: 'done' } });
		};

		const completeFailCallback = (err, confirmation) =>
			expect(err).toEqual('Bot conversation failed');

		beforeEach(async () => {
			jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => Promise.resolve({ identityId: '1234' }));

			provider = new AWSLexProvider();
			provider.configure(botConfig);

			inProgressResp = (await provider.sendMessage(
				'BookTrip',
				'hi'
			)) as PostTextCommandOutput;

			completeSuccessResp = (await provider.sendMessage(
				'BookTrip',
				'done'
			)) as PostTextCommandOutput;

			completeFailResp = (await provider.sendMessage(
				'BookTrip',
				'error'
			)) as PostTextCommandOutput;
		});

		test('Configure onComplete callback using `Interactions.onComplete` API', async () => {
			// 1. In progress, callback shouldn't be called
			provider.onComplete('BookTrip', inProgressCallback);
			provider.reportBotStatus('BookTrip', inProgressResp);
			jest.runAllTimers();

			// 2. task complete; success, callback be called with response
			provider.onComplete('BookTrip', completeSuccessCallback);
			provider.reportBotStatus('BookTrip', completeSuccessResp);
			jest.runAllTimers();

			// 3. task complete; error, callback be called with error
			provider.onComplete('BookTrip', completeFailCallback);
			provider.reportBotStatus('BookTrip', completeFailResp);
			jest.runAllTimers();
		});

		test('Configure onComplete callback using `configuration`', async () => {
			const myBot: any = {
				BookTrip: {
					name: 'BookTrip',
					alias: '$LATEST',
					region: 'us-west-2',
				},
			};

			// 1. In progress, callback shouldn't be called
			myBot.BookTrip.onComplete = inProgressCallback;
			provider.configure(myBot);
			provider.reportBotStatus('BookTrip', inProgressResp);
			jest.runAllTimers();

			// 2. In progress, callback shouldn't be called
			myBot.BookTrip.onComplete = completeSuccessCallback;
			provider.configure(myBot);
			provider.reportBotStatus('BookTrip', completeSuccessResp);
			jest.runAllTimers();

			// 3. In progress, callback shouldn't be called
			myBot.BookTrip.onComplete = completeFailCallback;
			provider.configure(myBot);
			provider.reportBotStatus('BookTrip', completeFailResp);
			jest.runAllTimers();
		});
	});
});
