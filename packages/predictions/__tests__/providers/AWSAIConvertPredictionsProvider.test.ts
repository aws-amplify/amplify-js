import {
	Category,
	PredictionsAction,
	getAmplifyUserAgentObject,
} from '@aws-amplify/core/internals/utils';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import {
	TranslateClient,
	TranslateTextCommand,
} from '@aws-sdk/client-translate';
import {
	PredictionsValidationErrorCode,
	validationErrorMap,
} from '../../src/errors/types/validation';
import { AmazonAIConvertPredictionsProvider } from '../../src/providers';
import {
	SpeechToTextInput,
	SpeechToTextOutput,
	TextToSpeechInput,
	TranslateTextInput,
} from '../../src/types';

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';

const result = { TranslatedText: 'translatedText', TargetLanguageCode: 'es' };
const resetTranslateMock = () => {
	TranslateClient.prototype.send = jest.fn(command => {
		if (command instanceof TranslateTextCommand) {
			return Promise.resolve(result);
		}
	}) as any;
};

const resetPollyMock = () => {
	PollyClient.prototype.send = jest.fn(command => {
		if (command instanceof SynthesizeSpeechCommand) {
			const result = {
				AudioStream: {
					buffer: 'dummyStream',
				},
			};
			return Promise.resolve(result);
		}
	}) as any;
};

(global as any).Response = jest.fn(stream => {
	const response = {
		arrayBuffer: () => {
			return 'dummyStream';
		},
	};
	return response;
});

(global as any).WebSocket = jest.fn(url => {
	let onCloseCallback;
	let onErrorCallback;
	let onMsgCallback;
	let connection = {
		set onmessage(callback) {
			onMsgCallback = callback;
		},
		set onerror(callback) {
			onErrorCallback = callback;
		},
		set onclose(callback) {
			onCloseCallback = callback;
		},
		set onopen(callback) {
			callback();
		},
		send: jest.fn(() => {
			if (onMsgCallback) {
				onMsgCallback('');
			}
			onCloseCallback();
		}),
	};

	return connection;
});

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const identityId = 'identityId';

const options = {
	translateText: {
		region: 'us-west-2',
		defaults: {
			sourceLanguage: 'en',
			targetLanguage: 'es',
		},
	},
	speechGenerator: {
		region: 'us-west-2',
		defaults: {
			language: 'en',
			voiceId: 'Aditi',
		},
	},
	transcription: {
		region: 'us-west-2',
		proxy: false,
		defaults: {
			language: 'en-US',
		},
	},
};

const validTranslateTextInput: TranslateTextInput = {
	translateText: {
		source: {
			text: 'sourceText',
			language: 'en',
		},
		targetLanguage: 'es',
	},
};

const validTextToSpeechInput: TextToSpeechInput = {
	textToSpeech: {
		source: {
			text: 'sourceText',
		},
		voiceId: 'Joanna',
	},
};

const validSpeechToTextInput: SpeechToTextInput = {
	transcription: {
		source: {
			bytes: new Buffer([0, 1, 2]),
		},
	},
};

describe('Predictions convert provider test', () => {
	beforeEach(() => {
		resetPollyMock();
		resetTranslateMock();
	});

	describe('translateText tests', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});
		test('happy case credentials exist', () => {
			const ctx = createMockAmplifyContext({
				Predictions: { convert: options },
			});
			(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({
				credentials,
				identityId,
			});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider(ctx);
			expect(
				predictionsProvider.convert(validTranslateTextInput),
			).resolves.toMatchObject({ language: 'es', text: 'translatedText' });
		});
		test('error case credentials do not exist', () => {
			const ctx = createMockAmplifyContext({
				Predictions: { convert: options },
			});
			(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider(ctx);

			expect(
				predictionsProvider.convert(validTranslateTextInput),
			).rejects.toThrow(
				expect.objectContaining(
					validationErrorMap[PredictionsValidationErrorCode.NoCredentials],
				),
			);
		});
		test('error case credentials exist but service fails', () => {
			const ctx = createMockAmplifyContext({
				Predictions: { convert: options },
			});
			(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({
				credentials,
				identityId,
			});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider(ctx);
			jest.spyOn(TranslateClient.prototype, 'send').mockImplementation(() => {
				return Promise.reject('error');
			});
			expect(
				predictionsProvider.convert(validTranslateTextInput),
			).rejects.toMatch('error');
		});
	});

	describe('convertTextToSpeech tests', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});
		test('happy case credentials exist', () => {
			const ctx = createMockAmplifyContext({
				Predictions: { convert: options },
			});
			(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({
				credentials,
				identityId,
			});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider(ctx);
			window.URL.createObjectURL = jest.fn();
			jest.spyOn(URL, 'createObjectURL').mockImplementation(blob => {
				return 'dummyURL';
			});
			expect(
				predictionsProvider.convert(validTextToSpeechInput),
			).resolves.toMatchObject({
				speech: {
					url: 'dummyURL',
				},
				audioStream: 'dummyStream',
				text: 'sourceText',
			});
		});
		test('error case credentials do not exist', () => {
			const ctx = createMockAmplifyContext({
				Predictions: { convert: options },
			});
			(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider(ctx);
			expect(
				predictionsProvider.convert(validTextToSpeechInput),
			).rejects.toThrow(
				expect.objectContaining(
					validationErrorMap[PredictionsValidationErrorCode.NoCredentials],
				),
			);
		});
		test('error case credentials exist but service fails', () => {
			const ctx = createMockAmplifyContext({
				Predictions: { convert: options },
			});
			(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({
				credentials,
				identityId,
			});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider(ctx);
			jest.spyOn(PollyClient.prototype, 'send').mockImplementation(() => {
				return Promise.reject('error');
			});
			expect(
				predictionsProvider.convert(validTextToSpeechInput),
			).rejects.toMatch('error');
		});
	});

	describe('speechToText tests', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});
		test('Error region not configured', () => {
			const ctx = createMockAmplifyContext({
				Predictions: {
					convert: {
						transcription: {
							proxy: false,
							defaults: {
								language: 'en-US',
							},
						},
					},
				},
			});
			(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({
				credentials,
				identityId,
			});
			AmazonAIConvertPredictionsProvider.serializeDataFromTranscribe = jest.fn(
				() => {
					return 'Hello how are you';
				},
			);

			const predictionsProvider = new AmazonAIConvertPredictionsProvider(ctx);

			return expect(
				predictionsProvider.convert(validSpeechToTextInput),
			).rejects.toThrow(
				expect.objectContaining(
					validationErrorMap[PredictionsValidationErrorCode.NoRegion],
				),
			);
		});
		test('Error languageCode not configured ', () => {
			const ctx = createMockAmplifyContext({
				Predictions: {
					convert: {
						transcription: {
							region: 'us-west-2',
							proxy: false,
						},
					},
				},
			});
			(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({
				credentials,
				identityId,
			});
			AmazonAIConvertPredictionsProvider.serializeDataFromTranscribe = jest.fn(
				() => {
					return 'Hello how are you';
				},
			);

			const predictionsProvider = new AmazonAIConvertPredictionsProvider(ctx);

			expect(
				predictionsProvider.convert(validSpeechToTextInput),
			).rejects.toThrow(
				expect.objectContaining(
					validationErrorMap[PredictionsValidationErrorCode.NoLanguage],
				),
			);
		});
		test('Happy case ', () => {
			const ctx = createMockAmplifyContext({
				Predictions: { convert: options },
			});
			(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({
				credentials,
				identityId,
			});
			AmazonAIConvertPredictionsProvider.serializeDataFromTranscribe = jest.fn(
				() => {
					return 'Hello, how are you?';
				},
			);

			const predictionsProvider = new AmazonAIConvertPredictionsProvider(ctx);

			expect(
				predictionsProvider.convert(validSpeechToTextInput),
			).resolves.toMatchObject({
				transcription: {
					fullText: 'Hello, how are you?',
				},
			} as SpeechToTextOutput);
		});
		test('Downsized Happy case ', async () => {
			const ctx = createMockAmplifyContext({
				Predictions: {
					convert: {
						transcription: {
							region: 'us-west-2',
							proxy: false,
							defaults: {
								language: 'fr-FR',
							},
						},
					},
				},
			});
			(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({
				credentials,
				identityId,
			});
			AmazonAIConvertPredictionsProvider.serializeDataFromTranscribe = jest.fn(
				() => {
					return 'Bonjour, comment vas tu?';
				},
			);
			const downsampleBufferSpyon = jest.spyOn(
				AmazonAIConvertPredictionsProvider.prototype as any,
				'downsampleBuffer',
			);

			const predictionsProvider = new AmazonAIConvertPredictionsProvider(ctx);

			await predictionsProvider.convert(validSpeechToTextInput);
			expect(downsampleBufferSpyon).toHaveBeenCalledWith(
				expect.objectContaining({ outputSampleRate: 8000 }),
			);
			downsampleBufferSpyon.mockClear();
		});
	});

	describe('custom user agent', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});
		test('convert text to speech initializes a client with the correct custom user agent', async () => {
			const ctx = createMockAmplifyContext({
				Predictions: { convert: options },
			});
			(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({
				credentials,
				identityId,
			});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider(ctx);
			window.URL.createObjectURL = jest.fn();
			jest.spyOn(URL, 'createObjectURL').mockImplementation(blob => {
				return 'dummyURL';
			});

			await predictionsProvider.convert(validTextToSpeechInput);

			// Assert via the client instance captured by the mocked `send`
			// (`config` is public SDK client API) instead of peeking the
			// provider's private client field.
			const pollyClient = (PollyClient.prototype.send as jest.Mock).mock
				.contexts[0] as PollyClient;
			expect(pollyClient.config.customUserAgent).toEqual(
				getAmplifyUserAgentObject({
					category: Category.Predictions,
					action: PredictionsAction.Convert,
				}),
			);
		});
		test('convert translate text initializes a client with the correct custom user agent', async () => {
			const ctx = createMockAmplifyContext({
				Predictions: { convert: options },
			});
			(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({
				credentials,
				identityId,
			});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider(ctx);

			await predictionsProvider.convert(validTranslateTextInput);
			// Assert via the client instance captured by the mocked `send`
			// (`config` is public SDK client API) instead of peeking the
			// provider's private client field.
			const translateClient = (TranslateClient.prototype.send as jest.Mock)
				.mock.contexts[0] as TranslateClient;
			expect(translateClient.config.customUserAgent).toEqual(
				getAmplifyUserAgentObject({
					category: Category.Predictions,
					action: PredictionsAction.Convert,
				}),
			);
		});
	});
});
