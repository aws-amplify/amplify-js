// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { fetchAuthSession } from '@aws-amplify/core';
import {
	IntentState,
	LexRuntimeV2Client,
	RecognizeTextCommand,
	RecognizeTextCommandOutput,
	RecognizeUtteranceCommand,
} from '@aws-sdk/client-lex-runtime-v2';
import { gzip, strToU8 } from 'fflate';
import { encode } from 'base-64';
import { v4 as uuid } from 'uuid';
import { lexProvider } from '../../src/lex-v2/AWSLexV2Provider';

jest.mock('@aws-amplify/core');

(global as any).Response = class Response {
	arrayBuffer(blob: Blob) {
		return Promise.resolve(new ArrayBuffer(0));
	}
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
	},
};

const credentials = {
	credentials: {
		accessKeyId: 'access-key-id',
		secretAccessKey: 'secret-access-key',
		sessionToken: 'session-token',
	},
	identityId: 'identity-id',
};

const mockFetchAuthSession = fetchAuthSession as jest.Mock;

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
	// Test 'send' API
	describe('send API', () => {
		let provider;

		beforeEach(() => {
			mockFetchAuthSession.mockReturnValue(credentials);
			provider = lexProvider;
		});

		afterEach(() => mockFetchAuthSession.mockReset());

		test('send simple text message to bot and fulfill', async () => {
			let response = await provider.sendMessage(botConfig.BookTrip, 'hi');
			expect(response).toEqual({
				sessionState: {
					intent: {
						state: 'ElicitSlot',
					},
				},
				messages: [{ content: 'echo:hi' }],
			});

			response = await provider.sendMessage(botConfig.BookTrip, 'done');
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
			let response = await provider.sendMessage(botConfig.BookTrip, {
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

			response = await provider.sendMessage(botConfig.BookTrip, {
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
					region: 'us-west-2',
				},
			};

			let response = await provider.sendMessage(botconfig.BookTrip, {
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
			response = await provider.sendMessage(botconfig.BookTrip, {
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
			mockFetchAuthSession.mockReturnValue(Promise.reject(new Error()));

			await expect(
				provider.sendMessage(botConfig.BookTrip, 'hi'),
			).rejects.toEqual('No credentials');
			expect.assertions(1);
		});

		test('send obj text and obj voice messages in wrong format', async () => {
			// obj text in wrong format
			await expect(
				provider.sendMessage(botConfig.BookTrip, {
					content: createBlob(),
					options: {
						messageType: 'text',
					},
				}),
			).rejects.toEqual('invalid content type');

			// obj voice in wrong format
			await expect(
				provider.sendMessage(botConfig.BookTrip, {
					content: 'Hi',
					options: {
						messageType: 'voice',
					},
				}),
			).rejects.toEqual('invalid content type');
		});
	});

	// Test 'onComplete' API
	describe('onComplete API', () => {
		const callback = (err, confirmation) => {};
		let provider;

		beforeEach(() => {
			mockFetchAuthSession.mockReturnValue(credentials);
			provider = lexProvider;
		});

		afterEach(() => mockFetchAuthSession.mockReset());

		test('Configure onComplete callback for a configured bot successfully', () => {
			expect(() =>
				provider.onComplete(botConfig.BookTrip, callback),
			).not.toThrow();
			expect.assertions(1);
		});
	});

	// Test 'reportBotStatus' API
	describe('reportBotStatus API', () => {
		jest.useFakeTimers();
		let provider = lexProvider;
		// enum, action types callback function can handle
		const ACTION_TYPE = Object.freeze({
			IN_PROGRESS: 'inProgress',
			COMPLETE: 'complete',
			ERROR: 'error',
		});

		let mockCallbackProvider;
		let mockResponseProvider;

		beforeEach(async () => {
			mockFetchAuthSession.mockReturnValue(credentials);
			mockCallbackProvider = actionType => {
				switch (actionType) {
					case ACTION_TYPE.IN_PROGRESS:
						return jest.fn((err, confirmation) =>
							fail(`callback shouldn't be called`),
						);

					case ACTION_TYPE.COMPLETE:
						return jest.fn((err, confirmation) => {
							expect(err).toEqual(undefined);
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
							expect(err).toEqual(new Error('Bot conversation failed')),
						);
				}
			};

			const inProgressResp = (await provider.sendMessage(
				botConfig.BookTrip,
				'in progress. callback isnt fired',
			)) as RecognizeTextCommandOutput;

			const completeSuccessResp = (await provider.sendMessage(
				botConfig.BookTrip,
				'done',
			)) as RecognizeTextCommandOutput;

			const completeFailResp = (await provider.sendMessage(
				botConfig.BookTrip,
				'error',
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

		afterEach(() => {
			mockFetchAuthSession.mockReset();
		});

		describe('onComplete callback from `Interactions.onComplete`', () => {
			test(`In progress, callback shouldn't be called`, async () => {
				// callback is only called once conversation is completed
				let config = { ...botConfig.BookTrip, name: uuid() };
				const inProgressCallback = mockCallbackProvider(
					ACTION_TYPE.IN_PROGRESS,
				);
				provider.onComplete(config, inProgressCallback);

				provider._reportBotStatus(
					mockResponseProvider(ACTION_TYPE.IN_PROGRESS),
					config,
				);

				jest.runAllTimers();
				expect(inProgressCallback).toHaveBeenCalledTimes(0);
				expect.assertions(1);
			});

			test(`task complete; callback with success resp`, async () => {
				let config = { ...botConfig.BookTrip, name: uuid() };
				const completeSuccessCallback = mockCallbackProvider(
					ACTION_TYPE.COMPLETE,
				);

				provider.onComplete(config, completeSuccessCallback);
				provider._reportBotStatus(
					mockResponseProvider(ACTION_TYPE.COMPLETE),
					config,
				);

				jest.runAllTimers();
				expect(completeSuccessCallback).toHaveBeenCalledTimes(1);
				// 2 assertions from callback
				expect.assertions(3);
			});

			test(`task complete; callback with error resp`, async () => {
				let config = { ...botConfig.BookTrip, name: uuid() };
				const completeFailCallback = mockCallbackProvider(ACTION_TYPE.ERROR);
				provider.onComplete(config, completeFailCallback);

				provider._reportBotStatus(
					mockResponseProvider(ACTION_TYPE.ERROR),
					config,
				);

				jest.runAllTimers();
				expect(completeFailCallback).toHaveBeenCalledTimes(1);
				// 1 assertion from callback
				expect.assertions(2);
			});
		});
	});
});
