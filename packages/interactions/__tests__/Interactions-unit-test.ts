import { InteractionsClass as Interactions } from '../src/Interactions';
import { AWSLexProvider, AbstractInteractionsProvider } from '../src/Providers';
import { Credentials } from '@aws-amplify/core';
import {
	LexRuntimeServiceClient,
	PostContentCommand,
	PostTextCommand,
} from '@aws-sdk/client-lex-runtime-service';

(global as any).Response = () => {};
(global as any).Response.prototype.arrayBuffer = (blob: Blob) => {
	return Promise.resolve(new ArrayBuffer(0));
};

// mock stream response
const createBlob = () => {
	return new Blob();
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
		} else {
			const result = {
				message: 'echo:' + command.input.inputText,
				dialogState: 'ElicitSlot',
			};
			return Promise.resolve(result);
		}
	} else if (command instanceof PostContentCommand) {
		if (command.input.contentType === 'audio/x-l16; sample-rate=16000') {
			if (command.input.inputStream === 'voice:done') {
				const result = {
					message: 'voice:echo:' + command.input.inputStream,
					dialogState: 'ReadyForFulfillment',
					slots: {
						m1: 'voice:hi',
						m2: 'voice:done',
					},
					audioStream: createBlob(),
				};
				return Promise.resolve(result);
			} else {
				const result = {
					message: 'voice:echo:' + command.input.inputStream,
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

class AWSLexProvider2 extends AWSLexProvider {
	getProviderName() {
		return 'AWSLexProvider2';
	}
}

class AWSLexProviderWrong extends AbstractInteractionsProvider {
	private onCompleteResolve: Function;
	private onCompleteReject: Function;

	getProviderName() {
		return 'AWSLexProviderWrong';
	}

	getCategory() {
		return 'IDontKnow';
	}

	sendMessage(message: string | Object): Promise<Object> {
		return new Promise(async (res, rej) => {});
	}

	async onComplete() {
		return new Promise((res, rej) => {
			this.onCompleteResolve = res;
			this.onCompleteReject = rej;
		});
	}
}

afterEach(() => {
	jest.restoreAllMocks();
});

describe('Interactions', () => {
	describe('constructor test', () => {
		test('happy case', () => {
			const interactions = new Interactions({});
		});
	});

	describe('configure test', () => {
		test('happy case', () => {
			const interactions = new Interactions({});

			const options = {
				key: 'value',
			};

			const config = interactions.configure(options);

			expect(config).toEqual({ bots: {}, key: 'value' });
		});

		test('aws-exports configuration and send message to existing bot', async () => {
			const curCredSpyOn = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => Promise.resolve({ identityId: '1234' }));

			const awsmobile = {
				aws_bots: 'enable',
				aws_bots_config: [
					{
						name: 'BookTripMOBILEHUB',
						alias: '$LATEST',
						description: 'Bot to make reservations for a visit to a city.',
						'bot-template': 'bot-trips',
						'commands-help': [
							'Book a car',
							'Reserve a car',
							'Make a car reservation',
							'Book a hotel',
							'Reserve a room',
							'I want to make a hotel reservation',
						],
						region: 'us-east-1',
					},
				],
				aws_project_name: 'bots',
				aws_project_region: 'us-east-1',
			};
			const interactions = new Interactions({});

			const config = interactions.configure(awsmobile);

			expect(config).toEqual({
				aws_bots: 'enable',
				aws_bots_config: [
					{
						alias: '$LATEST',
						'bot-template': 'bot-trips',
						'commands-help': [
							'Book a car',
							'Reserve a car',
							'Make a car reservation',
							'Book a hotel',
							'Reserve a room',
							'I want to make a hotel reservation',
						],
						description: 'Bot to make reservations for a visit to a city.',
						name: 'BookTripMOBILEHUB',
						region: 'us-east-1',
					},
				],
				aws_project_name: 'bots',
				aws_project_region: 'us-east-1',
				bots: {
					BookTripMOBILEHUB: {
						alias: '$LATEST',
						'bot-template': 'bot-trips',
						'commands-help': [
							'Book a car',
							'Reserve a car',
							'Make a car reservation',
							'Book a hotel',
							'Reserve a room',
							'I want to make a hotel reservation',
						],
						description: 'Bot to make reservations for a visit to a city.',
						name: 'BookTripMOBILEHUB',
						region: 'us-east-1',
					},
				},
			});

			const response = await interactions.send('BookTripMOBILEHUB', 'hi');

			expect(response).toEqual({
				dialogState: 'ElicitSlot',
				message: 'echo:hi',
			});
		});

		test('aws-exports configuration with two bots and send message to existing bot', async () => {
			const curCredSpyOn = jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => Promise.resolve({ identityId: '1234' }));

			const awsmobile = {
				aws_bots: 'enable',
				aws_bots_config: [
					{
						name: 'BookTripMOBILEHUB',
						alias: '$LATEST',
						description: 'Bot to make reservations for a visit to a city.',
						'bot-template': 'bot-trips',
						'commands-help': [
							'Book a car',
							'Reserve a car',
							'Make a car reservation',
							'Book a hotel',
							'Reserve a room',
							'I want to make a hotel reservation',
						],
						region: 'us-east-1',
					},
					{
						name: 'BookTripMOBILEHUB2',
						alias: '$LATEST',
						description: 'Bot to make reservations for a visit to a city.',
						'bot-template': 'bot-trips',
						'commands-help': [
							'Book a car',
							'Reserve a car',
							'Make a car reservation',
							'Book a hotel',
							'Reserve a room',
							'I want to make a hotel reservation',
						],
						region: 'us-east-1',
					},
				],
				aws_project_name: 'bots',
				aws_project_region: 'us-east-1',
			};
			const interactions = new Interactions({});

			const config = interactions.configure(awsmobile);

			expect(config).toEqual({
				aws_bots: 'enable',
				aws_bots_config: [
					{
						alias: '$LATEST',
						'bot-template': 'bot-trips',
						'commands-help': [
							'Book a car',
							'Reserve a car',
							'Make a car reservation',
							'Book a hotel',
							'Reserve a room',
							'I want to make a hotel reservation',
						],
						description: 'Bot to make reservations for a visit to a city.',
						name: 'BookTripMOBILEHUB',
						region: 'us-east-1',
					},
					{
						alias: '$LATEST',
						'bot-template': 'bot-trips',
						'commands-help': [
							'Book a car',
							'Reserve a car',
							'Make a car reservation',
							'Book a hotel',
							'Reserve a room',
							'I want to make a hotel reservation',
						],
						description: 'Bot to make reservations for a visit to a city.',
						name: 'BookTripMOBILEHUB2',
						region: 'us-east-1',
					},
				],
				aws_project_name: 'bots',
				aws_project_region: 'us-east-1',
				bots: {
					BookTripMOBILEHUB: {
						alias: '$LATEST',
						'bot-template': 'bot-trips',
						'commands-help': [
							'Book a car',
							'Reserve a car',
							'Make a car reservation',
							'Book a hotel',
							'Reserve a room',
							'I want to make a hotel reservation',
						],
						description: 'Bot to make reservations for a visit to a city.',
						name: 'BookTripMOBILEHUB',
						region: 'us-east-1',
					},
					BookTripMOBILEHUB2: {
						alias: '$LATEST',
						'bot-template': 'bot-trips',
						'commands-help': [
							'Book a car',
							'Reserve a car',
							'Make a car reservation',
							'Book a hotel',
							'Reserve a room',
							'I want to make a hotel reservation',
						],
						description: 'Bot to make reservations for a visit to a city.',
						name: 'BookTripMOBILEHUB2',
						region: 'us-east-1',
					},
				},
			});

			const response = await interactions.send('BookTripMOBILEHUB', 'hi');

			expect(response).toEqual({
				dialogState: 'ElicitSlot',
				message: 'echo:hi',
			});

			const response2 = await interactions.send('BookTripMOBILEHUB2', 'hi2');

			expect(response2).toEqual({
				dialogState: 'ElicitSlot',
				message: 'echo:hi2',
			});

			const interactionsMessageVoice = {
				content: 'voice:hi',
				options: {
					messageType: 'voice',
				},
			};

			const interactionsMessageText = {
				content: 'hi',
				options: {
					messageType: 'text',
				},
			};

			const responseVoice = await interactions.send(
				'BookTripMOBILEHUB',
				interactionsMessageVoice
			);
			expect(responseVoice).toEqual({
				dialogState: 'ElicitSlot',
				message: 'voice:echo:voice:hi',
				audioStream: new Uint8Array(),
			});

			const responseText = await interactions.send(
				'BookTripMOBILEHUB',
				interactionsMessageText
			);
			expect(responseText).toEqual({
				dialogState: 'ElicitSlot',
				message: 'echo:hi',
				audioStream: new Uint8Array(),
			});
		});

		test('Interactions configuration with two bots and send message to existing bot and fullfil', async () => {
			const curCredSpyOn = jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => Promise.resolve({ identityId: '1234' }));
			const configuration = {
				Interactions: {
					bots: {
						BookTripMOBILEHUB: {
							name: 'BookTripMOBILEHUB',
							alias: '$LATEST',
							region: 'us-east-1',
						},
						BookTripMOBILEHUB2: {
							name: 'BookTripMOBILEHUB2',
							alias: '$LATEST',
							region: 'us-east-1',
						},
					},
				},
			};

			const interactions = new Interactions({});

			const config = interactions.configure(configuration);

			expect(config).toEqual(configuration.Interactions);
			const response = await interactions.send('BookTripMOBILEHUB', 'hi');

			expect(response).toEqual({
				dialogState: 'ElicitSlot',
				message: 'echo:hi',
			});

			const response2 = await interactions.send('BookTripMOBILEHUB2', 'hi2');

			expect(response2).toEqual({
				dialogState: 'ElicitSlot',
				message: 'echo:hi2',
			});

			const interactionsMessageVoice = {
				content: 'voice:hi',
				options: {
					messageType: 'voice',
				},
			};

			const interactionsMessageText = {
				content: 'hi',
				options: {
					messageType: 'text',
				},
			};

			const responseVoice = await interactions.send(
				'BookTripMOBILEHUB',
				interactionsMessageVoice
			);
			expect(responseVoice).toEqual({
				dialogState: 'ElicitSlot',
				message: 'voice:echo:voice:hi',
				audioStream: new Uint8Array(),
			});

			const responseText = await interactions.send(
				'BookTripMOBILEHUB',
				interactionsMessageText
			);
			expect(responseText).toEqual({
				dialogState: 'ElicitSlot',
				message: 'echo:hi',
				audioStream: new Uint8Array(),
			});
		});

		describe('Sending messages to bot', () => {
			jest.useFakeTimers();
			test('onComplete callback from `Interactions.onComplete` called with text', async () => {
				const curCredSpyOn = jest
					.spyOn(Credentials, 'get')
					.mockImplementation(() => Promise.resolve({ identityId: '1234' }));

				function onCompleteCallback(err, confirmation) {
					expect(confirmation).toEqual({ slots: { m1: 'hi', m2: 'done' } });
				}

				const configuration = {
					Interactions: {
						bots: {
							BookTripMOBILEHUB: {
								name: 'BookTripMOBILEHUB',
								alias: '$LATEST',
								region: 'us-east-1',
							},
						},
					},
				};

				const interactions = new Interactions({});

				const config = interactions.configure(configuration);

				expect(config).toEqual(configuration.Interactions);
				interactions.onComplete('BookTripMOBILEHUB', onCompleteCallback);
				await interactions.send('BookTripMOBILEHUB', 'hi');
				const response = await interactions.send('BookTripMOBILEHUB', 'done');
				expect(response).toEqual({
					dialogState: 'ReadyForFulfillment',
					message: 'echo:done',
					slots: {
						m1: 'hi',
						m2: 'done',
					},
				});

				const interactionsMessageText = {
					content: 'done',
					options: {
						messageType: 'text',
					},
				};

				const textResponse = await interactions.send(
					'BookTripMOBILEHUB',
					interactionsMessageText
				);
				expect(textResponse).toEqual({
					dialogState: 'ReadyForFulfillment',
					message: 'echo:done',
					slots: {
						m1: 'hi',
						m2: 'done',
					},
					audioStream: new Uint8Array(),
				});
				jest.runAllTimers();
			});

			test('onComplete callback from `Interactions.onComplete` called with voice', async () => {
				const curCredSpyOn = jest
					.spyOn(Credentials, 'get')
					.mockImplementation(() => Promise.resolve({ identityId: '1234' }));

				function onCompleteCallback(err, confirmation) {
					expect(confirmation).toEqual({
						slots: { m1: 'voice:hi', m2: 'voice:done' },
					});
				}

				const configuration = {
					Interactions: {
						bots: {
							BookTripMOBILEHUB: {
								name: 'BookTripMOBILEHUB',
								alias: '$LATEST',
								region: 'us-east-1',
							},
						},
					},
				};

				const interactions = new Interactions({});
				const config = interactions.configure(configuration);
				interactions.onComplete('BookTripMOBILEHUB', onCompleteCallback);

				const interactionsMessageVoice = {
					content: 'voice:done',
					options: {
						messageType: 'voice',
					},
				};

				const voiceResponse = await interactions.send(
					'BookTripMOBILEHUB',
					interactionsMessageVoice
				);
				expect(voiceResponse).toEqual({
					dialogState: 'ReadyForFulfillment',
					message: 'voice:echo:voice:done',
					slots: {
						m1: 'voice:hi',
						m2: 'voice:done',
					},
					audioStream: new Uint8Array(),
				});
				jest.runAllTimers();
			});

			test('onComplete callback from configure being called with text', async () => {
				const curCredSpyOn = jest
					.spyOn(Credentials, 'get')
					.mockImplementation(() => Promise.resolve({ identityId: '1234' }));

				function onCompleteCallback(err, confirmation) {
					expect(confirmation).toEqual({ slots: { m1: 'hi', m2: 'done' } });
				}
				const configuration = {
					Interactions: {
						bots: {
							BookTripMOBILEHUB: {
								name: 'BookTripMOBILEHUB',
								alias: '$LATEST',
								region: 'us-east-1',
								onComplete: onCompleteCallback,
							},
						},
					},
				};

				const interactions = new Interactions({});
				const config = interactions.configure(configuration);

				expect(config).toEqual(configuration.Interactions);

				await interactions.send('BookTripMOBILEHUB', 'hi');
				const response = await interactions.send('BookTripMOBILEHUB', 'done');
				expect(response).toEqual({
					dialogState: 'ReadyForFulfillment',
					message: 'echo:done',
					slots: {
						m1: 'hi',
						m2: 'done',
					},
				});
				const interactionsMessageText = {
					content: 'done',
					options: {
						messageType: 'text',
					},
				};

				const textResponse = await interactions.send(
					'BookTripMOBILEHUB',
					interactionsMessageText
				);
				expect(textResponse).toEqual({
					dialogState: 'ReadyForFulfillment',
					message: 'echo:done',
					slots: {
						m1: 'hi',
						m2: 'done',
					},
					audioStream: new Uint8Array(),
				});
				jest.runAllTimers();
			});

			test('onComplete callback from configure being called with voice', async () => {
				const curCredSpyOn = jest
					.spyOn(Credentials, 'get')
					.mockImplementation(() => Promise.resolve({ identityId: '1234' }));

				function onCompleteCallback(err, confirmation) {
					expect(confirmation).toEqual({
						slots: { m1: 'voice:hi', m2: 'voice:done' },
					});
				}
				const configuration = {
					Interactions: {
						bots: {
							BookTripMOBILEHUB: {
								name: 'BookTripMOBILEHUB',
								alias: '$LATEST',
								region: 'us-east-1',
								onComplete: onCompleteCallback,
							},
						},
					},
				};

				const interactions = new Interactions({});
				const config = interactions.configure(configuration);

				expect(config).toEqual(configuration.Interactions);

				const interactionsMessageVoice = {
					content: 'voice:done',
					options: {
						messageType: 'voice',
					},
				};
				const voiceResponse = await interactions.send(
					'BookTripMOBILEHUB',
					interactionsMessageVoice
				);
				expect(voiceResponse).toEqual({
					dialogState: 'ReadyForFulfillment',
					message: 'voice:echo:voice:done',
					slots: {
						m1: 'voice:hi',
						m2: 'voice:done',
					},
					audioStream: new Uint8Array(),
				});
				jest.runAllTimers();
			});

			test('aws-exports configuration and send message to not existing bot', async () => {
				const awsmobile = {
					aws_bots: 'enable',
					aws_bots_config: [
						{
							name: 'BookTripMOBILEHUB',
							alias: '$LATEST',
							description: 'Bot to make reservations for a visit to a city.',
							'bot-template': 'bot-trips',
							'commands-help': [
								'Book a car',
								'Reserve a car',
								'Make a car reservation',
								'Book a hotel',
								'Reserve a room',
								'I want to make a hotel reservation',
							],
							region: 'us-east-1',
						},
					],
					aws_project_name: 'bots',
					aws_project_region: 'us-east-1',
				};
				const interactions = new Interactions({});

				const config = interactions.configure(awsmobile);

				expect(config).toEqual({
					aws_bots: 'enable',
					aws_bots_config: [
						{
							alias: '$LATEST',
							'bot-template': 'bot-trips',
							'commands-help': [
								'Book a car',
								'Reserve a car',
								'Make a car reservation',
								'Book a hotel',
								'Reserve a room',
								'I want to make a hotel reservation',
							],
							description: 'Bot to make reservations for a visit to a city.',
							name: 'BookTripMOBILEHUB',
							region: 'us-east-1',
						},
					],
					aws_project_name: 'bots',
					aws_project_region: 'us-east-1',
					bots: {
						BookTripMOBILEHUB: {
							alias: '$LATEST',
							'bot-template': 'bot-trips',
							'commands-help': [
								'Book a car',
								'Reserve a car',
								'Make a car reservation',
								'Book a hotel',
								'Reserve a room',
								'I want to make a hotel reservation',
							],
							description: 'Bot to make reservations for a visit to a city.',
							name: 'BookTripMOBILEHUB',
							region: 'us-east-1',
						},
					},
				});

				try {
					await interactions.send('BookTrip', 'hi');
				} catch (err) {
					expect(err.message).toEqual('Bot BookTrip does not exist');
				}
			});

			test('aws-exports configuration and try to add onComplete to not existing bot', async () => {
				const awsmobile = {
					aws_bots: 'enable',
					aws_bots_config: [
						{
							name: 'BookTripMOBILEHUB',
							alias: '$LATEST',
							description: 'Bot to make reservations for a visit to a city.',
							'bot-template': 'bot-trips',
							'commands-help': [
								'Book a car',
								'Reserve a car',
								'Make a car reservation',
								'Book a hotel',
								'Reserve a room',
								'I want to make a hotel reservation',
							],
							region: 'us-east-1',
						},
					],
					aws_project_name: 'bots',
					aws_project_region: 'us-east-1',
				};
				const interactions = new Interactions({});

				const config = interactions.configure(awsmobile);

				expect(config).toEqual({
					aws_bots: 'enable',
					aws_bots_config: [
						{
							alias: '$LATEST',
							'bot-template': 'bot-trips',
							'commands-help': [
								'Book a car',
								'Reserve a car',
								'Make a car reservation',
								'Book a hotel',
								'Reserve a room',
								'I want to make a hotel reservation',
							],
							description: 'Bot to make reservations for a visit to a city.',
							name: 'BookTripMOBILEHUB',
							region: 'us-east-1',
						},
					],
					aws_project_name: 'bots',
					aws_project_region: 'us-east-1',
					bots: {
						BookTripMOBILEHUB: {
							alias: '$LATEST',
							'bot-template': 'bot-trips',
							'commands-help': [
								'Book a car',
								'Reserve a car',
								'Make a car reservation',
								'Book a hotel',
								'Reserve a room',
								'I want to make a hotel reservation',
							],
							description: 'Bot to make reservations for a visit to a city.',
							name: 'BookTripMOBILEHUB',
							region: 'us-east-1',
						},
					},
				});

				try {
					await interactions.onComplete('BookTrip', () => {});
				} catch (err) {
					expect(err.message).toEqual('Bot BookTrip does not exist');
				}
			});
		});

		describe('Adding pluggins', () => {
			test('Adding AWSLexProvider2 bot not found', async () => {
				const configuration = {
					Interactions: {
						bots: {
							BookTripMOBILEHUB: {
								name: 'BookTripMOBILEHUB',
								alias: '$LATEST',
								region: 'us-east-1',
								providerName: 'AWSLexProvider2',
							},
						},
					},
				};

				const interactions = new Interactions({});

				const config = interactions.configure(configuration);

				interactions.addPluggable(new AWSLexProvider2());

				try {
					await interactions.send('BookTrip', 'hi');
				} catch (err) {
					expect(err.message).toEqual('Bot BookTrip does not exist');
				}
			});

			test('Adding custom plugin happy path', async () => {
				jest
					.spyOn(Credentials, 'get')
					.mockImplementation(() => Promise.resolve({ identityId: '1234' }));
				const configuration = {
					Interactions: {
						bots: {
							BookTripMOBILEHUB: {
								name: 'BookTripMOBILEHUB',
								alias: '$LATEST',
								region: 'us-east-1',
								providerName: 'AWSLexProvider2',
							},
						},
					},
				};

				const interactions = new Interactions({});
				const config = interactions.configure(configuration);
				expect(config).toEqual({
					bots: {
						BookTripMOBILEHUB: {
							alias: '$LATEST',
							name: 'BookTripMOBILEHUB',
							providerName: 'AWSLexProvider2',
							region: 'us-east-1',
						},
					},
				});
				const pluggin = new AWSLexProvider2({});

				interactions.addPluggable(pluggin);

				const response = await interactions.send('BookTripMOBILEHUB', 'hi');

				expect(response).toEqual({
					dialogState: 'ElicitSlot',
					message: 'echo:hi',
				});

				const interactionsMessageVoice = {
					content: 'voice:hi',
					options: {
						messageType: 'voice',
					},
				};

				const interactionsMessageText = {
					content: 'hi',
					options: {
						messageType: 'text',
					},
				};

				const responseVoice = await interactions.send(
					'BookTripMOBILEHUB',
					interactionsMessageVoice
				);
				expect(responseVoice).toEqual({
					dialogState: 'ElicitSlot',
					message: 'voice:echo:voice:hi',
					audioStream: new Uint8Array(),
				});

				const responseText = await interactions.send(
					'BookTripMOBILEHUB',
					interactionsMessageText
				);
				expect(responseText).toEqual({
					dialogState: 'ElicitSlot',
					message: 'echo:hi',
					audioStream: new Uint8Array(),
				});
			});
		});
	});
});
