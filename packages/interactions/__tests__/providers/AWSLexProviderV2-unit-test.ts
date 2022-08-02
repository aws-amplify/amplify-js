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
import { AWSLexProviderV2 } from '../../src/Providers';
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
		providerName: 'AWSLexProviderV2',
	},
	OrderFlowers: {
		name: 'OrderFlowers',
		botId: 'O1O8YV2JTG',
		aliasId: '0DNZS5QI8M',
		localeId: 'en_US',
		region: 'us-west-2',
		providerName: 'AWSLexProviderV2',
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
	describe('constructor test', () => {
		test('happy case', () => {
			const provider = new AWSLexProviderV2();
		});
	});

	// Test 'getProviderName' API
	describe('getProviderName API', () => {
		test('happy case', () => {
			const provider = new AWSLexProviderV2();
			expect(provider.getProviderName()).toEqual('AWSLexProviderV2');
		});
	});

	// Test 'getCategory' API
	describe('getCategory API', () => {
		test('happy case', () => {
			const provider = new AWSLexProviderV2();
			expect(provider.getCategory()).toEqual('Interactions');
		});
	});

	// Test 'configure' API
	describe('configure API', () => {
		const provider = new AWSLexProviderV2();

		test('happy case', () => {
			expect(provider.configure(botConfig)).toEqual(botConfig);
		});

		test('configure multiple bots', () => {
			// config 1st bot
			expect(provider.configure(botConfig)).toEqual(botConfig);

			const anotherBot = {
				BookTrip: {
					name: 'BookHotel',
					botId: '0DNZS5QI8M',
					aliasId: 'O1O8YV2JTG',
					localeId: 'en_US',
					region: 'us-west-2',
					providerName: 'AWSLexProviderV2',
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
					providerName: 'AWSLexProviderV2',
				},
			};
			// re-configure updated 2nd bot
			// 2nd bot is overridden
			expect(provider.configure(anotherBotUpdated)).toEqual({
				...botConfig,
				...anotherBotUpdated,
			});
		});

		test('FailureCase: invalid bot config', () => {
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
		});
	});

	// Test 'send' API
	describe('send API', () => {
		let provider;

		beforeEach(() => {
			jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => Promise.resolve({ identityId: '1234' }));

			provider = new AWSLexProviderV2();
			provider.configure(botConfig);
		});

		test('send simple text message and fulfill', async () => {
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
		});

		test('send obj text message and fulfill', async () => {
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
		});

		test('send obj voice message and fulfill', async () => {
			const botconfig = {
				BookTrip: {
					name: 'BookTrip',
					botId: '0DNZS5QI8M:hi',
					aliasId: 'O1O8YV2JTG',
					localeId: 'en_US',
					providerName: 'AWSLexProviderV2',
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
		});

		test('FailureCase: No credentials send', async () => {
			jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => Promise.reject({ identityId: '1234' }));

			await expect(provider.sendMessage('BookTrip', 'hi')).rejects.toEqual(
				'No credentials'
			);
		});

		test('FailureCase: send to not existing bot', async () => {
			await expect(provider.sendMessage('unknownBot', 'hi')).rejects.toEqual(
				'Bot unknownBot does not exist'
			);
		});

		test('FailureCase: send simple text, obj text and obj voice messages in wrong format', async () => {
			await expect(provider.sendMessage('BookTrip', 3421)).rejects.toEqual(
				`message type isn't supported`
			);

			// obj text in wrong format
			await expect(
				provider.sendMessage('BookTrip', {
					content: createBlob(),
					options: {
						messageType: 'text',
					},
				})
			).rejects.toEqual(`message type isn't supported`);

			// obj voice in wrong format
			await expect(
				provider.sendMessage('BookTrip', {
					content: 'Hi',
					options: {
						messageType: 'voice',
					},
				})
			).rejects.toEqual(`message type isn't supported`);
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

			provider = new AWSLexProviderV2();
			provider.configure(botConfig);
		});

		test('happy case', () => {
			provider.onComplete('BookTrip', callback);
		});

		test('FailureCase: onComplete to not existing bot', async () => {
			expect(() => provider.onComplete('unknownBot', callback)).toThrow(
				'Bot unknownBot does not exist'
			);
		});

		test('FailureCase: onComplete with wrong input format', async () => {
			// wrong callback
			expect(() => provider.onComplete('BookTrip', 'hi')).toThrow(
				`message type isn't supported`
			);

			// wrong botname
			expect(() => provider.onComplete({}, 'Hi')).toThrow(
				`message type isn't supported`
			);
		});
	});

	// Test 'reportBotStatus' API
	describe('reportBotStatus API', () => {
		jest.useFakeTimers();
		let provider;

		let inProgressResp;
		let completeSuccessResp;
		let completeFailResp;

		const inProgressCallback = (err, confirmation) => {
			fail(`callback shouldn't be called`);
		};

		const completeSuccessCallback = (err, confirmation) => {
			expect(err).toEqual(null);
			expect(confirmation).toEqual({ slots: { m1: 'hi', m2: 'done' } });
		};

		const completeFailCallback = (err, confirmation) => {
			expect(err).toEqual('Bot conversation failed');
		};

		beforeEach(async () => {
			jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => Promise.resolve({ identityId: '1234' }));

			provider = new AWSLexProviderV2();
			provider.configure(botConfig);

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
			provider.reportBotStatus('BookTrip', inProgressResp.sessionState);
			jest.runAllTimers();

			// 2. task complete; success, callback be called with response
			provider.onComplete('BookTrip', completeSuccessCallback);
			provider.reportBotStatus('BookTrip', completeSuccessResp.sessionState);
			jest.runAllTimers();

			// 3. task complete; error, callback be called with error
			provider.onComplete('BookTrip', completeFailCallback);
			provider.reportBotStatus('BookTrip', completeFailResp.sessionState);
			jest.runAllTimers();
		});

		test('onComplete callback from `Configure`', async () => {
			const myBot: any = {
				BookTrip: {
					name: 'BookTrip',
					botId: '0DNZS5QI8M',
					aliasId: 'O1O8YV2JTG',
					localeId: 'en_US',
					region: 'us-west-2',
					providerName: 'AWSLexProviderV2',
				},
			};

			// 1. In progress, callback shouldn't be called
			myBot.BookTrip.onComplete = inProgressCallback;
			provider.configure(myBot);
			provider.reportBotStatus('BookTrip', inProgressResp.sessionState);
			jest.runAllTimers();

			// 2. In progress, callback shouldn't be called
			myBot.BookTrip.onComplete = completeSuccessCallback;
			provider.configure(myBot);
			provider.reportBotStatus('BookTrip', completeSuccessResp.sessionState);
			jest.runAllTimers();

			// 3. In progress, callback shouldn't be called
			myBot.BookTrip.onComplete = completeFailCallback;
			provider.configure(myBot);
			provider.reportBotStatus('BookTrip', completeFailResp.sessionState);
			jest.runAllTimers();
		});
	});
});
