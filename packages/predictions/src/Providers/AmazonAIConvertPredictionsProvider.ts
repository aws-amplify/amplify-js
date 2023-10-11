// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	TranslateClient,
	TranslateTextCommand,
} from '@aws-sdk/client-translate';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import {
	TranslateTextInput,
	TextToSpeechInput,
	SpeechToTextInput,
	TranslateTextOutput,
	TextToSpeechOutput,
	SpeechToTextOutput,
	isBytesSource,
	isTranslateTextInput,
	isTextToSpeechInput,
	isSpeechToTextInput,
} from '../types';
import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	ConsoleLogger as Logger,
	Signer,
	getAmplifyUserAgentObject,
	Category,
	PredictionsAction,
} from '@aws-amplify/core/internals/utils';

import {
	EventStreamCodec,
	MessageHeaderValue,
} from '@smithy/eventstream-codec';
import { fromUtf8, toUtf8 } from '@smithy/util-utf8';
import { Buffer } from 'buffer';
import { assertValidationError } from '../errors/utils/assertValidationError';
import { PredictionsValidationErrorCode } from '../errors/types/validation';

const logger = new Logger('AmazonAIConvertPredictionsProvider');
const eventBuilder = new EventStreamCodec(toUtf8, fromUtf8);

const LANGUAGES_CODE_IN_8KHZ = ['fr-FR', 'en-AU', 'en-GB', 'fr-CA'];

export class AmazonAIConvertPredictionsProvider {
	private translateClient: TranslateClient;
	private pollyClient: PollyClient;

	getCategory(): string {
		return 'Convert';
	}

	getProviderName() {
		return 'AmazonAIConvertPredictionsProvider';
	}

	convert(
		input: TranslateTextInput | TextToSpeechInput | SpeechToTextInput
	): Promise<TextToSpeechOutput | TranslateTextOutput | SpeechToTextOutput> {
		if (isTranslateTextInput(input)) {
			logger.debug('translateText');
			return this.translateText(input);
		} else if (isTextToSpeechInput(input)) {
			logger.debug('textToSpeech');
			return this.convertTextToSpeech(input);
		} else if (isSpeechToTextInput(input)) {
			logger.debug('textToSpeech');
			return this.convertSpeechToText(input);
		}
	}

	protected async translateText(
		input: TranslateTextInput
	): Promise<TranslateTextOutput> {
		logger.debug('Starting translation');

		const { translateText = {} } =
			Amplify.getConfig().Predictions?.convert ?? {};
		assertValidationError(
			!!translateText.region,
			PredictionsValidationErrorCode.NoRegion
		);
		const { defaults = {}, region } = translateText;

		const { credentials } = await fetchAuthSession();
		assertValidationError(
			!!credentials,
			PredictionsValidationErrorCode.NoCredentials
		);

		const { sourceLanguage, targetLanguage } = defaults;
		const sourceLanguageCode =
			input.translateText?.source?.language ?? sourceLanguage;
		const targetLanguageCode =
			input.translateText?.targetLanguage ?? targetLanguage;
		assertValidationError(
			!!sourceLanguageCode,
			PredictionsValidationErrorCode.NoSourceLanguage
		);
		assertValidationError(
			!!targetLanguageCode,
			PredictionsValidationErrorCode.NoTargetLanguage
		);

		this.translateClient = new TranslateClient({
			region,
			credentials,
			customUserAgent: getAmplifyUserAgentObject({
				category: Category.Predictions,
				action: PredictionsAction.Convert,
			}),
		});
		const translateTextCommand = new TranslateTextCommand({
			SourceLanguageCode: sourceLanguageCode,
			TargetLanguageCode: targetLanguageCode,
			Text: input.translateText?.source?.text,
		});
		const data = await this.translateClient.send(translateTextCommand);
		return {
			text: data.TranslatedText,
			language: data.TargetLanguageCode,
		} as TranslateTextOutput;
	}

	protected async convertTextToSpeech(
		input: TextToSpeechInput
	): Promise<TextToSpeechOutput> {
		const { credentials } = await fetchAuthSession();
		assertValidationError(
			!!credentials,
			PredictionsValidationErrorCode.NoCredentials
		);
		assertValidationError(
			!!input.textToSpeech?.source,
			PredictionsValidationErrorCode.NoSource
		);

		const { speechGenerator } = Amplify.getConfig().Predictions?.convert ?? {};
		assertValidationError(
			!!speechGenerator?.region,
			PredictionsValidationErrorCode.NoRegion
		);

		const { defaults = {}, region } = speechGenerator;

		const { voiceId: defaultVoiceId } = defaults;
		const voiceId = input.textToSpeech?.voiceId ?? defaultVoiceId;
		assertValidationError(!!voiceId, PredictionsValidationErrorCode.NoVoiceId);

		this.pollyClient = new PollyClient({
			region,
			credentials,
			customUserAgent: getAmplifyUserAgentObject({
				category: Category.Predictions,
				action: PredictionsAction.Convert,
			}),
		});
		const synthesizeSpeechCommand = new SynthesizeSpeechCommand({
			OutputFormat: 'mp3',
			Text: input.textToSpeech?.source?.text,
			VoiceId: voiceId,
			TextType: 'text',
			SampleRate: '24000',
			// tslint:disable-next-line: align
		});
		const data = await this.pollyClient.send(synthesizeSpeechCommand);
		const response = new Response(data.AudioStream as ReadableStream);
		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer], {
			type: data.ContentType,
		});
		const url = URL.createObjectURL(blob);
		return {
			speech: { url },
			audioStream: arrayBuffer,
			text: input.textToSpeech?.source?.text,
		} as TextToSpeechOutput;
	}

	protected async convertSpeechToText(
		input: SpeechToTextInput
	): Promise<SpeechToTextOutput> {
		logger.debug('starting transcription..');
		const { credentials } = await fetchAuthSession();
		assertValidationError(
			!!credentials,
			PredictionsValidationErrorCode.NoCredentials
		);

		const { transcription } = Amplify.getConfig().Predictions?.convert ?? {};
		assertValidationError(
			!!transcription?.region,
			PredictionsValidationErrorCode.NoRegion
		);

		const { defaults, region } = transcription;
		const language = input.transcription?.language ?? defaults?.language;

		assertValidationError(
			!!language,
			PredictionsValidationErrorCode.NoLanguage
		);

		const source = input.transcription?.source;
		assertValidationError(
			isBytesSource(source),
			PredictionsValidationErrorCode.InvalidSource
		);

		const connection = await this.openConnectionWithTranscribe({
			credentials,
			region,
			languageCode: language,
		});

		const fullText = await this.sendDataToTranscribe({
			connection,
			raw: source.bytes,
			languageCode: language,
		});
		return {
			transcription: {
				fullText,
			},
		};
	}

	public static serializeDataFromTranscribe(message) {
		let decodedMessage = '';
		const transcribeMessage = eventBuilder.decode(Buffer.from(message.data));
		const transcribeMessageJson = JSON.parse(toUtf8(transcribeMessage.body));
		if (transcribeMessage.headers[':message-type'].value === 'exception') {
			logger.debug(
				'exception',
				JSON.stringify(transcribeMessageJson.Message, null, 2)
			);
			throw new Error(transcribeMessageJson.Message);
		} else if (transcribeMessage.headers[':message-type'].value === 'event') {
			if (transcribeMessageJson.Transcript.Results.length > 0) {
				if (
					transcribeMessageJson.Transcript.Results[0].Alternatives.length > 0
				) {
					if (
						transcribeMessageJson.Transcript.Results[0].Alternatives[0]
							.Transcript.length > 0
					) {
						if (
							transcribeMessageJson.Transcript.Results[0].IsPartial === false
						) {
							decodedMessage =
								transcribeMessageJson.Transcript.Results[0].Alternatives[0]
									.Transcript + '\n';
							logger.debug({ decodedMessage });
						} else {
							logger.debug({
								transcript:
									transcribeMessageJson.Transcript.Results[0].Alternatives[0],
							});
						}
					}
				}
			}
		}
		return decodedMessage;
	}

	private sendDataToTranscribe({
		connection,
		raw,
		languageCode,
	}): Promise<string> {
		return new Promise((res, rej) => {
			let fullText = '';
			connection.onmessage = message => {
				try {
					const decodedMessage =
						AmazonAIConvertPredictionsProvider.serializeDataFromTranscribe(
							message
						);
					if (decodedMessage) {
						fullText += decodedMessage + ' ';
					}
				} catch (err) {
					logger.debug(err);
					rej(err.message);
				}
			};

			connection.onerror = errorEvent => {
				logger.debug({ errorEvent });
				rej('failed to transcribe, network error');
			};

			connection.onclose = closeEvent => {
				logger.debug({ closeEvent });
				return res(fullText.trim());
			};

			logger.debug({ raw });

			if (Array.isArray(raw)) {
				for (let i = 0; i < raw.length - 1023; i += 1024) {
					const data = raw.slice(i, i + 1024);
					this.sendEncodedDataToTranscribe(connection, data, languageCode);
				}
			} else {
				// If Buffer
				this.sendEncodedDataToTranscribe(connection, raw, languageCode);
			}

			// sending end frame
			const endFrameEventMessage = this.getAudioEventMessage(Buffer.from([]));
			const endFrameBinary = eventBuilder.encode(endFrameEventMessage);
			connection.send(endFrameBinary);
		});
	}

	private sendEncodedDataToTranscribe(connection, data, languageCode) {
		const downsampledBuffer = this.downsampleBuffer({
			buffer: data,
			outputSampleRate: LANGUAGES_CODE_IN_8KHZ.includes(languageCode)
				? 8000
				: 16000,
		});
		const pcmEncodedBuffer = this.pcmEncode(downsampledBuffer);
		const audioEventMessage = this.getAudioEventMessage(
			Buffer.from(pcmEncodedBuffer)
		);
		const binary = eventBuilder.encode(audioEventMessage);
		connection.send(binary);
	}

	private getAudioEventMessage(buffer) {
		const audioEventMessage = {
			body: buffer as Uint8Array,
			headers: {
				':message-type': {
					type: 'string',
					value: 'event',
				} as MessageHeaderValue,
				':event-type': {
					type: 'string',
					value: 'AudioEvent',
				} as MessageHeaderValue,
			},
		};

		return audioEventMessage;
	}

	private pcmEncode(input) {
		let offset = 0;
		const buffer = new ArrayBuffer(input.length * 2);
		const view = new DataView(buffer);
		for (let i = 0; i < input.length; i++, offset += 2) {
			const s = Math.max(-1, Math.min(1, input[i]));
			view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
		}
		return buffer;
	}

	private inputSampleRate = 44100;

	private downsampleBuffer({ buffer, outputSampleRate = 16000 }) {
		if (outputSampleRate === this.inputSampleRate) {
			return buffer;
		}

		const sampleRateRatio = this.inputSampleRate / outputSampleRate;
		const newLength = Math.round(buffer.length / sampleRateRatio);
		const result = new Float32Array(newLength);
		let offsetResult = 0;
		let offsetBuffer = 0;
		while (offsetResult < result.length) {
			const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
			let accum = 0,
				count = 0;
			for (
				let i = offsetBuffer;
				i < nextOffsetBuffer && i < buffer.length;
				i++
			) {
				accum += buffer[i];
				count++;
			}
			result[offsetResult] = accum / count;
			offsetResult++;
			offsetBuffer = nextOffsetBuffer;
		}

		return result;
	}

	private openConnectionWithTranscribe({
		credentials: userCredentials,
		region,
		languageCode,
	}): Promise<WebSocket> {
		return new Promise(async (res, rej) => {
			const {
				accessKeyId: access_key,
				secretAccessKey: secret_key,
				sessionToken: session_token,
			} = userCredentials;

			const credentials = {
				access_key,
				secret_key,
				session_token,
			};

			const signedUrl = this.generateTranscribeUrl({
				credentials,
				region,
				languageCode,
			});

			logger.debug('connecting...');
			const connection = new WebSocket(signedUrl);

			connection.binaryType = 'arraybuffer';
			connection.onopen = () => {
				logger.debug('connected');
				res(connection);
			};
		});
	}

	private generateTranscribeUrl({ credentials, region, languageCode }): string {
		const url = [
			`wss://transcribestreaming.${region}.amazonaws.com:8443`,
			'/stream-transcription-websocket?',
			`media-encoding=pcm&`,
			`sample-rate=${
				LANGUAGES_CODE_IN_8KHZ.includes(languageCode) ? '8000' : '16000'
			}&`,
			`language-code=${languageCode}`,
		].join('');

		const signedUrl = Signer.signUrl(
			url,
			credentials,
			{ region, service: 'transcribe' },
			300
		);

		return signedUrl;
	}
}
