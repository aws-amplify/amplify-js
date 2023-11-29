// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	LexRuntimeServiceClient,
	PostContentCommand,
	PostTextCommand,
	PostTextCommandOutput,
} from '@aws-sdk/client-lex-runtime-service';
import { lexProvider } from '../../src/lex-v1/AWSLexProvider';
import { fetchAuthSession } from '@aws-amplify/core';

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
		name: 'BookTrip', // default provider 'AWSLexProvider'
		alias: '$LATEST',
		region: 'us-west-2',
	},
	OrderFlowers: {
		name: 'OrderFlowers',
		alias: '$LATEST',
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
	// send text and audio message to bot
	describe('send API', () => {
		let provider;

		beforeEach(() => {
			mockFetchAuthSession.mockReturnValue(credentials);
			provider = lexProvider;
		});

		afterEach(() => {
			mockFetchAuthSession.mockReset();
		});

		test('send simple text message to bot and fulfill', async () => {
			let response = await provider.sendMessage(botConfig.BookTrip, 'hi');
			expect(response).toEqual({
				dialogState: 'ElicitSlot',
				message: 'echo:hi',
			});

			response = await provider.sendMessage(botConfig.BookTrip, 'done');
			expect(response).toEqual({
				dialogState: 'ReadyForFulfillment',
				message: 'echo:done',
				slots: {
					m1: 'hi',
					m2: 'done',
				},
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
				dialogState: 'ElicitSlot',
				message: 'echo:hi',
				audioStream: new Uint8Array(),
			});

			response = await provider.sendMessage(botConfig.BookTrip, {
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
			expect.assertions(2);
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

			let response = await provider.sendMessage(botconfig['BookTrip:hi'], {
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

			response = await provider.sendMessage(botconfig['BookTrip:done'], {
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
			expect.assertions(2);
		});

		test('send a text message bot But with no credentials', async () => {
			mockFetchAuthSession.mockReturnValue(Promise.reject(new Error()));

			await expect(
				provider.sendMessage(botConfig.BookTrip, 'hi')
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
				})
			).rejects.toEqual('invalid content type');

			// obj voice in wrong format
			await expect(
				provider.sendMessage(botConfig.BookTrip, {
					content: 'Hi',
					options: {
						messageType: 'voice',
					},
				})
			).rejects.toEqual('invalid content type');
		});
	});

	// attach 'onComplete' callback to bot
	describe('onComplete API', () => {
		const callback = (err, confirmation) => {};
		let provider;

		beforeEach(() => {
			mockFetchAuthSession.mockReturnValue(credentials);
			provider = lexProvider;
		});

		afterEach(() => {
			mockFetchAuthSession.mockReset();
		});

		test('Configure onComplete callback for a configured bot successfully', () => {
			expect(() =>
				provider.onComplete(botConfig.BookTrip, callback)
			).not.toThrow();
			expect.assertions(1);
		});
	});

	// test if 'onComplete' callback is fired for different actions
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
			mockFetchAuthSession.mockReturnValue(credentials);
			provider = lexProvider;

			// mock callbacks
			inProgressCallback = jest.fn((err, confirmation) =>
				fail(`callback shouldn't be called`)
			);

			completeSuccessCallback = jest.fn((err, confirmation) => {
				expect(err).toEqual(undefined);
				expect(confirmation).toEqual({
					message: 'echo:done',
					dialogState: 'ReadyForFulfillment',
					slots: {
						m1: 'hi',
						m2: 'done',
					},
				});
			});

			completeFailCallback = jest.fn((err, confirmation) =>
				expect(err).toEqual(new Error('Bot conversation failed'))
			);

			// mock responses
			inProgressResp = (await provider.sendMessage(
				botConfig.BookTrip,
				'hi'
			)) as PostTextCommandOutput;

			completeSuccessResp = (await provider.sendMessage(
				botConfig.BookTrip,
				'done'
			)) as PostTextCommandOutput;

			completeFailResp = (await provider.sendMessage(
				botConfig.BookTrip,
				'error'
			)) as PostTextCommandOutput;
		});

		afterEach(() => {
			mockFetchAuthSession.mockReset();
		});

		test('Configure onComplete callback using `Interactions.onComplete` API', async () => {
			// 1. In progress, callback shouldn't be called
			provider.onComplete(botConfig.BookTrip, inProgressCallback);
			provider.reportBotStatus(inProgressResp, botConfig.BookTrip);
			jest.runAllTimers();
			expect(inProgressCallback).toHaveBeenCalledTimes(0);

			// 2. task complete; success, callback be called with response
			provider.onComplete(botConfig.BookTrip, completeSuccessCallback);
			provider.reportBotStatus(completeSuccessResp, botConfig.BookTrip);
			jest.runAllTimers();
			expect(completeSuccessCallback).toHaveBeenCalledTimes(1);

			// 3. task complete; error, callback be called with error
			provider.onComplete(botConfig.BookTrip, completeFailCallback);
			provider.reportBotStatus(completeFailResp, botConfig.BookTrip);
			jest.runAllTimers();
			expect(completeFailCallback).toHaveBeenCalledTimes(1);
			expect.assertions(6);
		});
	});
});
