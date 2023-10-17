import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	Category,
	PredictionsAction,
	getAmplifyUserAgentObject,
} from '@aws-amplify/core/internals/utils';
import {
	TranslateTextInput,
	TextToSpeechInput,
	SpeechToTextInput,
	SpeechToTextOutput,
} from '../../src/types';
import { AmazonAIConvertPredictionsProvider } from '../../src/providers';
import {
	TranslateClient,
	TranslateTextCommand,
} from '@aws-sdk/client-translate';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import {
	PredictionsValidationErrorCode,
	validationErrorMap,
} from '../../src/errors/types/validation';

const mockFetchAuthSession = fetchAuthSession as jest.Mock;
const mockGetConfig = Amplify.getConfig as jest.Mock;

jest.mock('@aws-amplify/core', () => ({
	fetchAuthSession: jest.fn(),
	Amplify: {
		getConfig: jest.fn(),
	},
}));

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
			mockFetchAuthSession.mockResolvedValue({
				credentials,
				identityId,
			});
			mockGetConfig.mockReturnValue({
				Predictions: {
					convert: options,
				},
			});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			expect(
				predictionsProvider.convert(validTranslateTextInput)
			).resolves.toMatchObject({ language: 'es', text: 'translatedText' });
		});
		test('error case credentials do not exist', () => {
			mockFetchAuthSession.mockResolvedValue({});
			mockGetConfig.mockReturnValue({
				Predictions: {
					convert: options,
				},
			});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider();

			expect(
				predictionsProvider.convert(validTranslateTextInput)
			).rejects.toThrow(
				expect.objectContaining(
					validationErrorMap[PredictionsValidationErrorCode.NoCredentials]
				)
			);
		});
		test('error case credentials exist but service fails', () => {
			mockFetchAuthSession.mockResolvedValue({
				credentials,
				identityId,
			});
			mockGetConfig.mockReturnValue({
				Predictions: {
					convert: options,
				},
			});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			jest.spyOn(TranslateClient.prototype, 'send').mockImplementation(() => {
				return Promise.reject('error');
			});
			expect(
				predictionsProvider.convert(validTranslateTextInput)
			).rejects.toMatch('error');
		});
	});

	describe('convertTextToSpeech tests', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});
		test('happy case credentials exist', () => {
			mockFetchAuthSession.mockResolvedValue({
				credentials,
				identityId,
			});
			mockGetConfig.mockReturnValue({
				Predictions: {
					convert: options,
				},
			});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			window.URL.createObjectURL = jest.fn();
			jest.spyOn(URL, 'createObjectURL').mockImplementation(blob => {
				return 'dummyURL';
			});
			expect(
				predictionsProvider.convert(validTextToSpeechInput)
			).resolves.toMatchObject({
				speech: {
					url: 'dummyURL',
				},
				audioStream: 'dummyStream',
				text: 'sourceText',
			});
		});
		test('error case credentials do not exist', () => {
			mockFetchAuthSession.mockResolvedValue({});
			mockGetConfig.mockReturnValue({
				Predictions: {
					convert: options,
				},
			});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			expect(
				predictionsProvider.convert(validTextToSpeechInput)
			).rejects.toThrow(
				expect.objectContaining(
					validationErrorMap[PredictionsValidationErrorCode.NoCredentials]
				)
			);
		});
		test('error case credentials exist but service fails', () => {
			mockFetchAuthSession.mockResolvedValue({
				credentials,
				identityId,
			});
			mockGetConfig.mockReturnValue({
				Predictions: {
					convert: options,
				},
			});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			jest.spyOn(PollyClient.prototype, 'send').mockImplementation(() => {
				return Promise.reject('error');
			});
			expect(
				predictionsProvider.convert(validTextToSpeechInput)
			).rejects.toMatch('error');
		});
	});

	describe('speechToText tests', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});
		test('Error region not configured', () => {
			mockFetchAuthSession.mockResolvedValue({
				credentials,
				identityId,
			});
			mockGetConfig.mockReturnValue({
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
			AmazonAIConvertPredictionsProvider.serializeDataFromTranscribe = jest.fn(
				() => {
					return 'Hello how are you';
				}
			);

			const predictionsProvider = new AmazonAIConvertPredictionsProvider();

			return expect(
				predictionsProvider.convert(validSpeechToTextInput)
			).rejects.toThrow(
				expect.objectContaining(
					validationErrorMap[PredictionsValidationErrorCode.NoRegion]
				)
			);
		});
		test('Error languageCode not configured ', () => {
			mockFetchAuthSession.mockResolvedValue({
				credentials,
				identityId,
			});
			mockGetConfig.mockReturnValue({
				Predictions: {
					convert: {
						transcription: {
							region: 'us-west-2',
							proxy: false,
						},
					},
				},
			});
			AmazonAIConvertPredictionsProvider.serializeDataFromTranscribe = jest.fn(
				() => {
					return 'Hello how are you';
				}
			);

			const predictionsProvider = new AmazonAIConvertPredictionsProvider();

			expect(
				predictionsProvider.convert(validSpeechToTextInput)
			).rejects.toThrow(
				expect.objectContaining(
					validationErrorMap[PredictionsValidationErrorCode.NoLanguage]
				)
			);
		});
		test('Happy case ', () => {
			mockFetchAuthSession.mockResolvedValue({
				credentials,
				identityId,
			});
			mockGetConfig.mockReturnValue({
				Predictions: {
					convert: options,
				},
			});
			AmazonAIConvertPredictionsProvider.serializeDataFromTranscribe = jest.fn(
				() => {
					return 'Hello, how are you?';
				}
			);

			const predictionsProvider = new AmazonAIConvertPredictionsProvider();

			expect(
				predictionsProvider.convert(validSpeechToTextInput)
			).resolves.toMatchObject({
				transcription: {
					fullText: 'Hello, how are you?',
				},
			} as SpeechToTextOutput);
		});
		test('Downsized Happy case ', async () => {
			mockFetchAuthSession.mockResolvedValue({
				credentials,
				identityId,
			});
			mockGetConfig.mockReturnValue({
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
			AmazonAIConvertPredictionsProvider.serializeDataFromTranscribe = jest.fn(
				() => {
					return 'Bonjour, comment vas tu?';
				}
			);
			const downsampleBufferSpyon = jest.spyOn(
				AmazonAIConvertPredictionsProvider.prototype as any,
				'downsampleBuffer'
			);

			const predictionsProvider = new AmazonAIConvertPredictionsProvider();

			await predictionsProvider.convert(validSpeechToTextInput);
			expect(downsampleBufferSpyon).toBeCalledWith(
				expect.objectContaining({ outputSampleRate: 8000 })
			);
			downsampleBufferSpyon.mockClear();
		});
	});

	describe('custom user agent', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});
		test('convert text to speech initializes a client with the correct custom user agent', async () => {
			mockFetchAuthSession.mockResolvedValue({
				credentials,
				identityId,
			});
			mockGetConfig.mockReturnValue({
				Predictions: {
					convert: options,
				},
			});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			window.URL.createObjectURL = jest.fn();
			jest.spyOn(URL, 'createObjectURL').mockImplementation(blob => {
				return 'dummyURL';
			});

			await predictionsProvider.convert(validTextToSpeechInput);

			expect(
				predictionsProvider['pollyClient']!.config.customUserAgent
			).toEqual(
				getAmplifyUserAgentObject({
					category: Category.Predictions,
					action: PredictionsAction.Convert,
				})
			);
		});
		test('convert translate text initializes a client with the correct custom user agent', async () => {
			mockFetchAuthSession.mockResolvedValue({
				credentials,
				identityId,
			});
			mockGetConfig.mockReturnValue({
				Predictions: {
					convert: options,
				},
			});
			const predictionsProvider = new AmazonAIConvertPredictionsProvider();

			await predictionsProvider.convert(validTranslateTextInput);
			expect(
				predictionsProvider['translateClient']!.config.customUserAgent
			).toEqual(
				getAmplifyUserAgentObject({
					category: Category.Predictions,
					action: PredictionsAction.Convert,
				})
			);
			expect(predictionsProvider['textractClient']).toBeUndefined();
		});
	});
});
