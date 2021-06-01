import { Credentials } from '@aws-amplify/core';
import {
	TranslateTextInput,
	TextToSpeechInput,
	SpeechToTextInput,
	SpeechToTextOutput,
} from '../../src/types';
import { AmazonAIConvertPredictionsProvider } from '../../src/Providers';
import {
	TranslateClient,
	TranslateTextCommand,
} from '@aws-sdk/client-translate';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';

const result = { TranslatedText: 'translatedText', TargetLanguageCode: 'es' };
TranslateClient.prototype.send = jest.fn(command => {
	if (command instanceof TranslateTextCommand) {
		return Promise.resolve(result);
	}
}) as any;

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

(global as any).Response = jest.fn(stream => {
	const response = {
		arrayBuffer: () => {
			return 'dummyStream';
		},
	};
	return response;
});

(global as any).WebSocket = jest.fn(url => {
	let onCloseCallback = null;
	let onErrorCallback = null;
	let onMsgCallback = null;
	let connection = null;
	connection = {
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
			onMsgCallback('');
			onCloseCallback();
		}),
	};

	return connection;
});

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

const options = {
	translateText: {
		connection: 'sdk',
		region: 'us-west-2',
		sourceLanguage: 'en',
		targetLanguage: 'es',
	},
	speechGenerator: {
		connection: 'sdk',
		region: 'us-west-2',
		language: 'en',
		voiceId: 'Aditi',
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
	describe('translateText tests', () => {
		test('happy case credentials exist', () => {
			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			predictionsProvider.configure(options);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});
			return expect(
				predictionsProvider.convert(validTranslateTextInput)
			).resolves.toMatchObject({ language: 'es', text: 'translatedText' });
		});
		test('error case credentials do not exist', () => {
			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			predictionsProvider.configure(options);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return null;
			});
			return expect(
				predictionsProvider.convert(validTranslateTextInput)
			).rejects.toMatch('No credentials');
		});
		test('error case credentials exist but service fails', () => {
			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			predictionsProvider.configure(options);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});
			jest.spyOn(TranslateClient.prototype, 'send').mockImplementation(() => {
				return Promise.reject('error');
			});
			return expect(
				predictionsProvider.convert(validTranslateTextInput)
			).rejects.toMatch('error');
		});
	});

	describe('convertTextToSpeech tests', () => {
		test('happy case credentials exist', () => {
			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			predictionsProvider.configure(options);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});
			window.URL.createObjectURL = jest.fn();
			jest.spyOn(URL, 'createObjectURL').mockImplementation(blob => {
				return 'dummyURL';
			});
			return expect(
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
			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			predictionsProvider.configure(options);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return null;
			});
			return expect(
				predictionsProvider.convert(validTextToSpeechInput)
			).rejects.toMatch('No credentials');
		});
		test('error case credentials exist but service fails', () => {
			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			predictionsProvider.configure(options);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});
			jest.spyOn(PollyClient.prototype, 'send').mockImplementation(() => {
				return Promise.reject('error');
			});
			return expect(
				predictionsProvider.convert(validTextToSpeechInput)
			).rejects.toMatch('error');
		});
	});

	describe('speechToText tests', () => {
		test('Error region not configured', () => {
			AmazonAIConvertPredictionsProvider.serializeDataFromTranscribe = jest.fn(
				() => {
					return 'Hello how are you';
				}
			);

			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			predictionsProvider.configure(options);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			return expect(
				predictionsProvider.convert(validSpeechToTextInput)
			).rejects.toMatch('region not configured for transcription');
		});
		test('Error languageCode not configured ', () => {
			AmazonAIConvertPredictionsProvider.serializeDataFromTranscribe = jest.fn(
				() => {
					return 'Hello how are you';
				}
			);

			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			const speechGenOptions = {
				transcription: {
					region: 'us-west-2',
					proxy: false,
				},
			};
			predictionsProvider.configure(speechGenOptions);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			return expect(
				predictionsProvider.convert(validSpeechToTextInput)
			).rejects.toMatch(
				'languageCode not configured or provided for transcription'
			);
		});
		test('Happy case ', () => {
			AmazonAIConvertPredictionsProvider.serializeDataFromTranscribe = jest.fn(
				() => {
					return 'Hello, how are you?';
				}
			);

			const predictionsProvider = new AmazonAIConvertPredictionsProvider();
			const speechGenOptions = {
				transcription: {
					region: 'us-west-2',
					proxy: false,
					defaults: {
						language: 'en-US',
					},
				},
			};
			predictionsProvider.configure(speechGenOptions);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			return expect(
				predictionsProvider.convert(validSpeechToTextInput)
			).resolves.toMatchObject({
				transcription: {
					fullText: 'Hello, how are you?',
				},
			} as SpeechToTextOutput);
		});
		test('Downsized Happy case ', async () => {
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
			const speechGenOptions = {
				transcription: {
					region: 'us-west-2',
					proxy: false,
					defaults: {
						language: 'fr-FR',
					},
				},
			};
			predictionsProvider.configure(speechGenOptions);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			await predictionsProvider.convert(validSpeechToTextInput);
			expect(downsampleBufferSpyon).toBeCalledWith(
				expect.objectContaining({ outputSampleRate: 8000 })
			);
			downsampleBufferSpyon.mockClear();
		});
	});
});
