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
import { AWSLexV2Provider } from '../../src/Providers';
import { Credentials } from '@aws-amplify/core';
import {
	LexRuntimeV2Client,
	RecognizeTextCommand,
	RecognizeTextCommandOutput,
	RecognizeUtteranceCommand,
	RecognizeUtteranceCommandOutput,
} from '@aws-sdk/client-lex-runtime-v2';

import { unGzipBase64AsJson } from '../../src/Providers/AWSLexProviderHelper/convert';
import { prototype } from 'stream';

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
		name: 'BookTrip',
		botId: '0DNZS5QI8M',
		aliasId: 'O1O8YV2JTG',
		localeId: 'en_US',
		region: 'us-west-2',
		providerName: 'AWSLexV2Provider',
	},
	OrderFlowers: {
		name: 'OrderFlowers',
		botId: 'O1O8YV2JTG',
		aliasId: '0DNZS5QI8M',
		localeId: 'en_US',
		region: 'us-west-2',
		providerName: 'AWSLexV2Provider',
	},
};

jest.mock('../../src/Providers/AWSLexProviderHelper/convert', () => ({
	...jest.requireActual('../../src/Providers/AWSLexProviderHelper/convert'),
	unGzipBase64AsJson: data => data,
}));

LexRuntimeV2Client.prototype.send = jest.fn((command, callback) => {
	if (command instanceof RecognizeTextCommand) {
		if (command.input.text === 'done') {
			const result = {
				sessionState: {
					intent: {
						slots: { m1: 'hi', m2: 'done' },
						state: 'ReadyForFulfillment',
					},
				},
				messages: [{ content: 'echo:' + command.input.text }],
			};
			return Promise.resolve(result);
		} else if (command.input.text === 'error') {
			const result = {
				sessionState: {
					intent: { state: 'Failed' },
				},
				messages: [{ content: 'echo:' + command.input.text }],
			};
			return Promise.resolve(result);
		} else {
			const result = {
				sessionState: {
					intent: { state: 'ElicitSlot' },
				},
				messages: [{ content: 'echo:' + command.input.text }],
			};

			return Promise.resolve(result);
		}
	} else if (command instanceof RecognizeUtteranceCommand) {
		if (
			command.input.requestContentType ===
			'audio/x-l16; sample-rate=16000; channel-count=1'
		) {
			const bot = command.input.botId as string;
			const [botName, status] = bot.split(':');

			if (status === 'done') {
				// we add the status to the botName
				// because inputStream would just be a blob if type is voice
				const result = {
					sessionState: {
						intent: {
							slots: { m1: 'voice:hi', m2: 'voice:done' },
							state: 'ReadyForFulfillment',
						},
					},
					messages: [{ content: 'voice:echo:' + command.input.botId }],
					audioStream: createBlob(),
				};
				return Promise.resolve(result);
			} else if (status === 'error') {
				const result = {
					sessionState: {
						intent: { state: 'Failed' },
					},
					messages: [{ content: 'voice:echo:' + command.input.botId }],
					audioStream: createBlob(),
				};
				return Promise.resolve(result);
			} else {
				const result = {
					sessionState: {
						intent: { state: 'ElicitSlot' },
					},
					messages: [{ content: 'voice:echo:' + command.input.botId }],
					audioStream: createBlob(),
				};
				return Promise.resolve(result);
			}
		} else {
			if (command.input.inputStream === 'done') {
				const result = {
					sessionState: {
						intent: {
							slots: { m1: 'hi', m2: 'done' },
							state: 'ReadyForFulfillment',
						},
					},
					messages: [{ content: 'echo:' + command.input.inputStream }],
					audioStream: createBlob(),
				};
				return Promise.resolve(result);
			} else if (command.input.inputStream === 'error') {
				const result = {
					sessionState: {
						intent: { state: 'Failed' },
					},
					messages: [{ content: 'echo:' + command.input.inputStream }],
					audioStream: createBlob(),
				};
				return Promise.resolve(result);
			} else {
				const result = {
					sessionState: {
						intent: { state: 'ElicitSlot' },
					},
					messages: [{ content: 'echo:' + command.input.inputStream }],
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
	test(`Is provider name 'AWSLexV2Provider'`, () => {
		const provider = new AWSLexV2Provider();
		expect(provider.getProviderName()).toEqual('AWSLexV2Provider');
		expect.assertions(1);
	});

	// Test 'getCategory' API
	test(`Is category name 'Interactions'`, () => {
		const provider = new AWSLexV2Provider();
		expect(provider.getCategory()).toEqual('Interactions');
		expect.assertions(1);
	});

	// Test 'configure' API
	describe('configure API', () => {
		const provider = new AWSLexV2Provider();

		test('Check if bot is successfully configured by validating config response', () => {
			expect(provider.configure(botConfig)).toEqual(botConfig);
			expect.assertions(1);
		});

		test('configure multiple bots and re-configure existing bot successfully', () => {
			// config 1st bot
			expect(provider.configure(botConfig)).toEqual(botConfig);

			const anotherBot = {
				BookTrip: {
					name: 'BookHotel',
					botId: '0DNZS5QI8M',
					aliasId: 'O1O8YV2JTG',
					localeId: 'en_US',
					region: 'us-west-2',
					providerName: 'AWSLexV2Provider',
				},
			};
			// config 2nd bot
			expect(provider.configure(anotherBot)).toEqual({
				...botConfig,
				...anotherBot,
			});

			const anotherBotUpdated = {
				BookTrip: {
					name: 'BookHotel',
					botId: '0DNZS5QI8M',
					aliasId: '7542RC2HTD',
					localeId: 'en_IN',
					region: 'us-west-2',
					providerName: 'AWSLexV2Provider',
				},
			};
			// re-configure updated 2nd bot
			// 2nd bot is overridden
			expect(provider.configure(anotherBotUpdated)).toEqual({
				...botConfig,
				...anotherBotUpdated,
			});
			expect.assertions(3);
		});

		test('Configure bot with invalid config', () => {
			const v1Bot = {
				BookHotel: {
					name: 'BookHotel',
					alias: '$LATEST',
					region: 'us-west-2',
				},
			};
			// @ts-ignore
			expect(() => provider.configure(v1Bot)).toThrow(
				'invalid bot configuration'
			);
			expect.assertions(1);
		});
	});

	// Test 'send' API
	describe('send API', () => {
		let provider;

		beforeEach(() => {
			jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => Promise.resolve({ identityId: '1234' }));

			provider = new AWSLexV2Provider();
			provider.configure(botConfig);
		});

		test('send simple text message to bot and fulfill', async () => {
			let response = await provider.sendMessage('BookTrip', 'hi');
			expect(response).toEqual({
				sessionState: {
					intent: {
						state: 'ElicitSlot',
					},
				},
				messages: [{ content: 'echo:hi' }],
			});

			response = await provider.sendMessage('BookTrip', 'done');
			expect(response).toEqual({
				sessionState: {
					intent: {
						slots: { m1: 'hi', m2: 'done' },
						state: 'ReadyForFulfillment',
					},
				},
				messages: [{ content: 'echo:done' }],
			});
			expect.assertions(2);
		});

		test('send obj text message to bot and fulfill', async () => {
			let response = await provider.sendMessage('BookTrip', {
				content: 'hi',
				options: {
					messageType: 'text',
				},
			});
			expect(response).toEqual({
				sessionState: {
					intent: {
						state: 'ElicitSlot',
					},
				},
				messages: [{ content: 'echo:hi' }],
				audioStream: new Uint8Array(),
			});

			response = await provider.sendMessage('BookTrip', {
				content: 'done',
				options: {
					messageType: 'text',
				},
			});
			expect(response).toEqual({
				sessionState: {
					intent: {
						slots: { m1: 'hi', m2: 'done' },
						state: 'ReadyForFulfillment',
					},
				},
				messages: [{ content: 'echo:done' }],
				audioStream: new Uint8Array(),
			});
			expect.assertions(2);
		});

		test('send obj voice message to bot and fulfill', async () => {
			const botconfig = {
				BookTrip: {
					name: 'BookTrip',
					botId: '0DNZS5QI8M:hi',
					aliasId: 'O1O8YV2JTG',
					localeId: 'en_US',
					providerName: 'AWSLexV2Provider',
					region: 'us-west-2',
				},
			};
			provider.configure(botconfig);

			let response = await provider.sendMessage('BookTrip', {
				content: createBlob(),
				options: {
					messageType: 'voice',
				},
			});
			expect(response).toEqual({
				sessionState: {
					intent: {
						state: 'ElicitSlot',
					},
				},
				messages: [{ content: 'voice:echo:0DNZS5QI8M:hi' }],
				audioStream: new Uint8Array(),
			});

			botconfig.BookTrip.botId = '0DNZS5QI8M:done';
			provider.configure(botconfig);
			response = await provider.sendMessage('BookTrip', {
				content: createBlob(),
				options: {
					messageType: 'voice',
				},
			});
			expect(response).toEqual({
				sessionState: {
					intent: {
						slots: { m1: 'voice:hi', m2: 'voice:done' },
						state: 'ReadyForFulfillment',
					},
				},
				messages: [{ content: 'voice:echo:0DNZS5QI8M:done' }],
				audioStream: new Uint8Array(),
			});
			expect.assertions(2);
		});

		test('send a text message bot But with no credentials', async () => {
			jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => Promise.reject({ identityId: '1234' }));

			await expect(provider.sendMessage('BookTrip', 'hi')).rejects.toEqual(
				'No credentials'
			);
			expect.assertions(1);
		});

		test('send message to non-existing bot', async () => {
			await expect(provider.sendMessage('unknownBot', 'hi')).rejects.toEqual(
				'Bot unknownBot does not exist'
			);
			expect.assertions(1);
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

			provider = new AWSLexV2Provider();
			provider.configure(botConfig);
		});

		test('Configure onComplete callback for a configured bot successfully', () => {
			expect(() => provider.onComplete('BookTrip', callback)).not.toThrow();
			expect.assertions(1);
		});

		test('Configure onComplete callback for non-existing bot', async () => {
			expect(() => provider.onComplete('unknownBot', callback)).toThrow(
				'Bot unknownBot does not exist'
			);
			expect.assertions(1);
		});
	});

	// Test 'reportBotStatus' API
	describe('reportBotStatus API', () => {
		jest.useFakeTimers();
		let provider;

		let inProgressResp;
		let completeSuccessResp;
		let completeFailResp;

		let inProgressCallback;
		let completeSuccessCallback;
		let completeFailCallback;

		beforeEach(async () => {
			jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => Promise.resolve({ identityId: '1234' }));

			provider = new AWSLexV2Provider();
			provider.configure(botConfig);

			// mock callbacks
			inProgressCallback = jest.fn((err, confirmation) =>
				fail(`callback shouldn't be called`)
			);

			completeSuccessCallback = jest.fn((err, confirmation) => {
				expect(err).toEqual(null);
				expect(confirmation).toEqual({
					sessionState: {
						intent: {
							slots: { m1: 'hi', m2: 'done' },
							state: 'ReadyForFulfillment',
						},
					},
					messages: [{ content: 'echo:done' }],
				});
			});

			completeFailCallback = jest.fn((err, confirmation) =>
				expect(err).toEqual('Bot conversation failed')
			);

			// mock responses
			inProgressResp = (await provider.sendMessage(
				'BookTrip',
				'hi'
			)) as RecognizeTextCommandOutput;

			completeSuccessResp = (await provider.sendMessage(
				'BookTrip',
				'done'
			)) as RecognizeTextCommandOutput;

			completeFailResp = (await provider.sendMessage(
				'BookTrip',
				'error'
			)) as RecognizeTextCommandOutput;
		});

		test('onComplete callback from `Interactions.onComplete`', async () => {
			// 1. In progress, callback shouldn't be called
			provider.onComplete('BookTrip', inProgressCallback);
			provider._reportBotStatus(inProgressResp, 'BookTrip');
			jest.runAllTimers();
			expect(inProgressCallback).toBeCalledTimes(0);

			// 2. task complete; success, callback be called with response
			provider.onComplete('BookTrip', completeSuccessCallback);
			provider._reportBotStatus(completeSuccessResp, 'BookTrip');
			jest.runAllTimers();
			expect(completeSuccessCallback).toBeCalledTimes(1);

			// 3. task complete; error, callback be called with error
			provider.onComplete('BookTrip', completeFailCallback);
			provider._reportBotStatus(completeFailResp, 'BookTrip');
			jest.runAllTimers();
			expect(completeFailCallback).toBeCalledTimes(1);
			expect.assertions(6);
		});

		test('onComplete callback from `Configure`', async () => {
			const myBot: any = {
				BookTrip: {
					name: 'BookTrip',
					botId: '0DNZS5QI8M',
					aliasId: 'O1O8YV2JTG',
					localeId: 'en_US',
					region: 'us-west-2',
					providerName: 'AWSLexV2Provider',
				},
			};

			// 1. In progress, callback shouldn't be called
			myBot.BookTrip.onComplete = inProgressCallback;
			provider.configure(myBot);
			provider._reportBotStatus(inProgressResp, 'BookTrip');
			jest.runAllTimers();
			expect(inProgressCallback).toBeCalledTimes(0);

			// 2. In progress, callback shouldn't be called
			myBot.BookTrip.onComplete = completeSuccessCallback;
			provider.configure(myBot);
			provider._reportBotStatus(completeSuccessResp, 'BookTrip');
			jest.runAllTimers();
			expect(completeSuccessCallback).toBeCalledTimes(1);

			// 3. In progress, callback shouldn't be called
			myBot.BookTrip.onComplete = completeFailCallback;
			provider.configure(myBot);
			provider._reportBotStatus(completeFailResp, 'BookTrip');
			jest.runAllTimers();
			expect(completeFailCallback).toBeCalledTimes(1);
			expect.assertions(6);
		});
	});
});
