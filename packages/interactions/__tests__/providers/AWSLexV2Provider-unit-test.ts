// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AWSLexV2Provider } from '../../src/Providers';
import { Credentials } from '@aws-amplify/core';
import {
	LexRuntimeV2Client,
	RecognizeTextCommand,
	RecognizeTextCommandOutput,
	RecognizeUtteranceCommand,
} from '@aws-sdk/client-lex-runtime-v2';
import { gzip, strToU8 } from 'fflate';
import { encode } from 'base-64';
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

const arrayBufferToBase64 = (buffer: Uint8Array) => {
	var binary = '';
	var bytes = new Uint8Array(buffer);
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return encode(binary);
};

const gzipBase64Json = async (dataObject: object) => {
	try {
		// 1. obj to string
		const objString = JSON.stringify(dataObject);

		// 2. objectString to arrayBuffer
		const arrayBuffer = strToU8(objString);

		// 3. gzip compress
		const compressedData: Uint8Array = await new Promise((resolve, reject) => {
			gzip(arrayBuffer, (err, data) => {
				if (err) reject(err);
				else resolve(data);
			});
		});

		// 4. arrayBuffer to base64
		return arrayBufferToBase64(compressedData);
	} catch (error) {
		return Promise.reject('unable to compress and encode ' + error);
	}
};

const handleRecognizeTextCommand = command => {
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
};

const handleRecognizeUtteranceCommandAudio = async command => {
	const bot = command.input.botId as string;
	const [botName, status] = bot.split(':');

	if (status === 'done') {
		// we add the status to the botName
		// because inputStream would just be a blob if type is voice
		const result = {
			sessionState: await gzipBase64Json({
				intent: {
					slots: { m1: 'voice:hi', m2: 'voice:done' },
					state: 'ReadyForFulfillment',
				},
			}),
			messages: await gzipBase64Json([
				{ content: 'voice:echo:' + command.input.botId },
			]),
			audioStream: createBlob(),
		};
		return Promise.resolve(result);
	} else if (status === 'error') {
		const result = {
			sessionState: await gzipBase64Json({
				intent: { state: 'Failed' },
			}),
			messages: await gzipBase64Json([
				{ content: 'voice:echo:' + command.input.botId },
			]),
			audioStream: createBlob(),
		};
		return Promise.resolve(result);
	} else {
		const result = {
			sessionState: await gzipBase64Json({
				intent: { state: 'ElicitSlot' },
			}),
			messages: await gzipBase64Json([
				{ content: 'voice:echo:' + command.input.botId },
			]),
			audioStream: createBlob(),
		};
		return Promise.resolve(result);
	}
};

const handleRecognizeUtteranceCommandText = async command => {
	if (command.input.inputStream === 'done') {
		const result = {
			sessionState: await gzipBase64Json({
				intent: {
					slots: { m1: 'hi', m2: 'done' },
					state: 'ReadyForFulfillment',
				},
			}),
			messages: await gzipBase64Json([
				{ content: 'echo:' + command.input.inputStream },
			]),
			audioStream: createBlob(),
		};
		return Promise.resolve(result);
	} else if (command.input.inputStream === 'error') {
		const result = {
			sessionState: await gzipBase64Json({
				intent: { state: 'Failed' },
			}),
			messages: await gzipBase64Json([
				{ content: 'echo:' + command.input.inputStream },
			]),
			audioStream: createBlob(),
		};
		return Promise.resolve(result);
	} else {
		const result = {
			sessionState: await gzipBase64Json({
				intent: { state: 'ElicitSlot' },
			}),
			messages: await gzipBase64Json([
				{ content: 'echo:' + command.input.inputStream },
			]),
			audioStream: createBlob(),
		};
		return Promise.resolve(result);
	}
};

LexRuntimeV2Client.prototype.send = jest.fn(async (command, callback) => {
	let response;
	if (command instanceof RecognizeTextCommand) {
		response = handleRecognizeTextCommand(command);
	} else if (command instanceof RecognizeUtteranceCommand) {
		if (
			command.input.requestContentType ===
			'audio/x-l16; sample-rate=16000; channel-count=1'
		) {
			response = await handleRecognizeUtteranceCommandAudio(command);
		} else {
			response = await handleRecognizeUtteranceCommandText(command);
		}
	}
	return response;
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

		test('send obj text and obj voice messages in wrong format', async () => {
			// obj text in wrong format
			await expect(
				provider.sendMessage('BookTrip', {
					content: createBlob(),
					options: {
						messageType: 'text',
					},
				})
			).rejects.toEqual('invalid content type');

			// obj voice in wrong format
			await expect(
				provider.sendMessage('BookTrip', {
					content: 'Hi',
					options: {
						messageType: 'voice',
					},
				})
			).rejects.toEqual('invalid content type');
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

		// enum, action types callback function can handle
		const ACTION_TYPE = Object.freeze({
			IN_PROGRESS: 'inProgress',
			COMPLETE: 'complete',
			ERROR: 'error',
		});

		let mockCallbackProvider;
		let mockResponseProvider;

		beforeEach(async () => {
			jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => Promise.resolve({ identityId: '1234' }));

			provider = new AWSLexV2Provider();
			provider.configure(botConfig);

			mockCallbackProvider = actionType => {
				switch (actionType) {
					case ACTION_TYPE.IN_PROGRESS:
						return jest.fn((err, confirmation) =>
							fail(`callback shouldn't be called`)
						);

					case ACTION_TYPE.COMPLETE:
						return jest.fn((err, confirmation) => {
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
					case ACTION_TYPE.ERROR:
						return jest.fn((err, confirmation) =>
							expect(err).toEqual(new Error('Bot conversation failed'))
						);
				}
			};

			const inProgressResp = (await provider.sendMessage(
				'BookTrip',
				'in progress. callback isnt fired'
			)) as RecognizeTextCommandOutput;

			const completeSuccessResp = (await provider.sendMessage(
				'BookTrip',
				'done'
			)) as RecognizeTextCommandOutput;

			const completeFailResp = (await provider.sendMessage(
				'BookTrip',
				'error'
			)) as RecognizeTextCommandOutput;

			mockResponseProvider = actionType => {
				switch (actionType) {
					case ACTION_TYPE.IN_PROGRESS:
						return inProgressResp;
					case ACTION_TYPE.COMPLETE:
						return completeSuccessResp;
					case ACTION_TYPE.ERROR:
						return completeFailResp;
				}
			};
		});

		describe('onComplete callback from `Interactions.onComplete`', () => {
			test(`In progress, callback shouldn't be called`, async () => {
				// callback is only called once conversation is completed
				const inProgressCallback = mockCallbackProvider(
					ACTION_TYPE.IN_PROGRESS
				);
				provider.onComplete('BookTrip', inProgressCallback);

				provider._reportBotStatus(
					mockResponseProvider(ACTION_TYPE.IN_PROGRESS),
					'BookTrip'
				);

				jest.runAllTimers();
				expect(inProgressCallback).toBeCalledTimes(0);
				expect.assertions(1);
			});

			test(`task complete; callback with success resp`, async () => {
				const completeSuccessCallback = mockCallbackProvider(
					ACTION_TYPE.COMPLETE
				);

				provider.onComplete('BookTrip', completeSuccessCallback);
				provider._reportBotStatus(
					mockResponseProvider(ACTION_TYPE.COMPLETE),
					'BookTrip'
				);

				jest.runAllTimers();
				expect(completeSuccessCallback).toBeCalledTimes(1);
				// 2 assertions from callback
				expect.assertions(3);
			});

			test(`task complete; callback with error resp`, async () => {
				const completeFailCallback = mockCallbackProvider(ACTION_TYPE.ERROR);
				provider.onComplete('BookTrip', completeFailCallback);

				provider._reportBotStatus(
					mockResponseProvider(ACTION_TYPE.ERROR),
					'BookTrip'
				);

				jest.runAllTimers();
				expect(completeFailCallback).toBeCalledTimes(1);
				// 1 assertion from callback
				expect.assertions(2);
			});
		});

		describe('onComplete callback from `Interactions.onComplete`', () => {
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

			test(`In progress, callback shouldn't be called`, async () => {
				const inProgressCallback = mockCallbackProvider(
					ACTION_TYPE.IN_PROGRESS
				);
				myBot.BookTrip.onComplete = inProgressCallback;

				provider.configure(myBot);
				provider._reportBotStatus(
					mockResponseProvider(ACTION_TYPE.IN_PROGRESS),
					'BookTrip'
				);

				jest.runAllTimers();
				expect(inProgressCallback).toBeCalledTimes(0);
				expect.assertions(1);
			});

			test(`task complete; callback with success resp`, async () => {
				const completeSuccessCallback = mockCallbackProvider(
					ACTION_TYPE.COMPLETE
				);
				myBot.BookTrip.onComplete = completeSuccessCallback;

				provider.configure(myBot);
				provider._reportBotStatus(
					mockResponseProvider(ACTION_TYPE.COMPLETE),
					'BookTrip'
				);

				jest.runAllTimers();
				expect(completeSuccessCallback).toBeCalledTimes(1);
				// 2 assertions from callback
				expect.assertions(3);
			});

			test(`task complete; callback with error resp`, async () => {
				const completeFailCallback = mockCallbackProvider(ACTION_TYPE.ERROR);
				myBot.BookTrip.onComplete = completeFailCallback;

				provider.configure(myBot);
				provider._reportBotStatus(
					mockResponseProvider(ACTION_TYPE.ERROR),
					'BookTrip'
				);

				jest.runAllTimers();
				expect(completeFailCallback).toBeCalledTimes(1);
				// 1 assertion from callback
				expect.assertions(2);
			});
		});
	});
});
