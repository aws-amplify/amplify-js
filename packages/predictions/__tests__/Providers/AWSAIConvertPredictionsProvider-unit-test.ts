import {
	AWS,
	ClientDevice,
	Parser,
	ConsoleLogger as Logger,
	Credentials,
} from '@aws-amplify/core';
import {
	TranslateTextInput,
	TextToSpeechInput,
	SpeechToTextInput,
	SpeechToTextOutput,
} from '../../src/types';
import { AmazonAIConvertPredictionsProvider } from '../../src/Providers';
import * as Translate from 'aws-sdk/clients/translate';
import * as TextToSpeech from 'aws-sdk/clients/polly';

jest.mock('aws-sdk/clients/translate', () => {
	const Translate = () => {
		return;
	};
	const result = { TranslatedText: 'translatedText', TargetLanguageCode: 'es' };
	Translate.prototype.translateText = (params, callback) => {
		callback(null, result);
	};

	return Translate;
});

jest.mock('aws-sdk/clients/polly', () => {
	const TextToSpeech = () => {
		return;
	};
	const result = {
		AudioStream: {
			buffer: 'dummyStream',
		},
	};
	TextToSpeech.prototype.synthesizeSpeech = (params, callback) => {
		callback(null, result);
	};
	return TextToSpeech;
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

const clientInfo = {
	appVersion: '1.0',
	make: 'make',
	model: 'model',
	version: '1.0.0',
	platform: 'platform',
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
			const translateSpy = jest
				.spyOn(Translate.prototype, 'translateText')
				.mockImplementation((input, callback) => {
					callback('error', null);
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
			const urlSpyOn = jest
				.spyOn(URL, 'createObjectURL')
				.mockImplementation(blob => {
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
			const textToSpeechSpy = jest
				.spyOn(TextToSpeech.prototype, 'synthesizeSpeech')
				.mockImplementation((input, callback) => {
					callback('error', null);
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
	});
});
