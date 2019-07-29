import { AbstractConvertPredictionsProvider } from "../types/Providers/AbstractConvertPredictionsProvider";
import * as Translate from 'aws-sdk/clients/translate';
import * as TextToSpeech from 'aws-sdk/clients/polly';
import * as SpeechToText from 'aws-sdk/clients/transcribeservice';
import Storage from '@aws-amplify/storage';
import { v4 as uuid } from 'uuid';
import {
    TranslateTextInput, TextToSpeechInput,
    SpeechToTextInput, isTranslateTextInput,
    isTextToSpeechInput, isSpeechToTextInput,
    TranslateTextOutput, TextToSpeechOutput,
    SpeechToTextOutput, isStorageSource,
    isFileSource, isBytesSource,
    BytesSource
} from "../types";
import { Credentials, ConsoleLogger as Logger, Signer } from '@aws-amplify/core';
import { GraphQLPredictionsProvider } from "..";
import { EventStreamMarshaller, MessageHeaderValue } from '@aws-sdk/eventstream-marshaller';
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-node';

const logger = new Logger('AmazonAIConvertPredictionsProvider');
const eventBuilder = new EventStreamMarshaller(toUtf8, fromUtf8);

export default class AmazonAIConvertPredictionsProvider extends AbstractConvertPredictionsProvider {

    private graphQLPredictionsProvider: GraphQLPredictionsProvider;
    private translate: Translate;
    private textToSpeech: TextToSpeech;
    private speechToText: SpeechToText;
    constructor() {
        super();
    }

    getProviderName() {
        return "AmazonAIConvertPredictionsProvider";
    }

    protected translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
        logger.debug("Starting translation");
        const { translateText: {
            defaults: { sourceLanguage = "", targetLanguage = "" } = {},
            region = "us-east-1" } = {}
        } = this._config;

        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) { return rej('No credentials'); }
            const sourceLanguageCode = input.translateText.source.language || sourceLanguage;
            const targetLanguageCode = input.translateText.targetLanguage || targetLanguage;
            if (!sourceLanguageCode || !targetLanguageCode) {
                throw new Error("Please provide both source and target language");
            }
            this.translate = new Translate({ region, credentials });
            this.translate.translateText({
                SourceLanguageCode: sourceLanguageCode,
                TargetLanguageCode: targetLanguageCode,
                Text: input.translateText.source.text
                // tslint:disable-next-line: align
            }, (err, data) => {
                logger.debug({ err, data });
                if (err) {
                    rej(err);
                } else {
                    res({ text: data.TranslatedText, language: data.TargetLanguageCode } as TranslateTextOutput);
                }
            });
        });
    }

    protected convertTextToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) { return rej('No credentials'); }
            const { speechGenerator: {
                defaults: { VoiceId = "Lotte", LanguageCode = "en-US" } = {},
                region = "us-east-1" } = {}
            } = this._config;
            const language = input.textToSpeech.source.language || LanguageCode;
            const voiceId = input.textToSpeech.voiceId || VoiceId;
            this.textToSpeech = new TextToSpeech({ region, credentials });
            this.textToSpeech.synthesizeSpeech({
                OutputFormat: 'mp3',
                Text: input.textToSpeech.source.text,
                VoiceId: voiceId,
                TextType: 'text',
                SampleRate: '8000'
                // tslint:disable-next-line: align
            }, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    const blob = new Blob([data.AudioStream as ArrayBuffer], { type: data.ContentType });
                    const url = URL.createObjectURL(blob);
                    res({
                        speech: { url },
                        audioStream: data.AudioStream as ArrayBuffer,
                        text: input.textToSpeech.source.text,
                        language: input.textToSpeech.source.language
                    } as TextToSpeechOutput);
                }
            });
        });
    }

    private sleep(m) { return new Promise(r => setTimeout(r, m)); }

    protected convertSpeechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
        return new Promise(async (res, rej) => {
            try {
                logger.debug('starting transcription..');
                const credentials = await Credentials.get();
                if (!credentials) { return rej('No credentials'); }
                const { transcription: {
                    defaults: { language: languageCode = "en-US" } = {},
                    region = "" } = {}
                } = this._config;
                if (!region) {
                    rej("region not configured for transcription");
                }
                const { transcription: { source, language = languageCode } } = input;
                if (isBytesSource(source)) {
                    const connection
                        = await this.openConnectionWithTranscribe({ credentials, region, languageCode: language });

                    const fullText = await this.sendDataToTranscribe({ connection, raw: source.bytes });
                    
                    return res({
                        transcription: {
                            fullText,
                            lines: [],
                            linesDetailed: []
                        }
                    });
                }

                rej("Not supported yet");
            } catch (err) {
                rej(err);
            }
        });
    }

    protected orchestrateWithGraphQL(input: any): Promise<any> {
        return this.graphQLPredictionsProvider.convert(input);
    }

    private sendDataToTranscribe({ connection, raw }): Promise<string> {
        return new Promise((res, rej) => {
            let fullText = "";
            connection.onmessage = (message) => {
                fullText += " ";
                const transcribeMessage = eventBuilder.unmarshall(Buffer.from(message.data));
                const transcribeMessageJson = JSON.parse(String.fromCharCode.apply(String, transcribeMessage.body));
                if (transcribeMessage.headers[":message-type"].value === "exception") {
                    logger.debug('exception', JSON.stringify(transcribeMessageJson.Message, null, 2));
                }
                else if (transcribeMessage.headers[":message-type"].value === "event") {
                    if (transcribeMessageJson.Transcript.Results.length > 0) {
                        if (transcribeMessageJson.Transcript.Results[0].Alternatives.length > 0) {
                            if (transcribeMessageJson.Transcript.Results[0].Alternatives[0].Transcript.length > 0) {
                                if (transcribeMessageJson.Transcript.Results[0].IsPartial === false) {
                                    fullText = fullText +
                                        transcribeMessageJson.Transcript.Results[0].Alternatives[0].Transcript + "\n";
                                    // sending end frame
                                    logger.debug({ fullText });
                                    // return res(fullText);
                                }
                            }
                        }
                    }
                }
            };

            connection.onerror = (errorEvent) => {
                logger.debug({ errorEvent });
                rej('failed to transcribe');
            };

            connection.onclose = (closeEvent) => {
                logger.debug({ closeEvent });
                return res(fullText);
            };


            // sending content
            logger.debug({ raw });
         
            if (Array.isArray(raw)) {
                for (let i = 0; i < raw.length - 1023; i += 1024) {
                    const data = raw.slice(i, i + 1024);
                    this.sendEncodedDataToTranscribe(connection, data);
                }
            }

            // sending end frame
            const endFrameEventMessage = this.getAudioEventMessage(Buffer.from([]));
            const endFrameBinary = eventBuilder.marshall(endFrameEventMessage);
            connection.send(endFrameBinary);


        });
    }

    private sendEncodedDataToTranscribe(connection, data) {
        const downsampledBuffer = this.downsampleBuffer({ buffer: data });
        const pcmEncodedBuffer = this.pcmEncode(downsampledBuffer);
        const audioEventMessage = this.getAudioEventMessage(Buffer.from(pcmEncodedBuffer));
        const binary = eventBuilder.marshall(audioEventMessage);
        connection.send(binary);
    }

    private getAudioEventMessage(buffer) {
        const audioEventMessage = {
            body: buffer as Uint8Array,
            headers: {
                ':message-type': {
                    type: 'string',
                    value: 'event'
                } as MessageHeaderValue,
                ':event-type': {
                    type: 'string',
                    value: 'AudioEvent'
                } as MessageHeaderValue
            },
        };

        return audioEventMessage;
    }

    private pcmEncode(input) {
        let offset = 0;
        const buffer = new ArrayBuffer(input.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < input.length; i++ , offset += 2) {
            const s = Math.max(-1, Math.min(1, input[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
        return buffer;
    }

    private inputSampleRate = 44100;
    private outputSampleRate = 16000;

    private downsampleBuffer({ buffer }) {

        if (this.outputSampleRate === this.inputSampleRate) {
            return buffer;
        }

        const sampleRateRatio = this.inputSampleRate / this.outputSampleRate;
        const newLength = Math.round(buffer.length / sampleRateRatio);
        const result = new Float32Array(newLength);
        let offsetResult = 0;
        let offsetBuffer = 0;
        while (offsetResult < result.length) {
            const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
            let accum = 0,
                count = 0;
            for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
                accum += buffer[i];
                count++;
            }
            result[offsetResult] = accum / count;
            offsetResult++;
            offsetBuffer = nextOffsetBuffer;
        }

        return result;
    }

    private openConnectionWithTranscribe({ credentials: userCredentials, region, languageCode }): Promise<WebSocket> {
        return new Promise(async (res, rej) => {
            const { accessKeyId: access_key,
                secretAccessKey: secret_key,
                sessionToken: session_token
            } = userCredentials;

            const credentials = {
                access_key,
                secret_key,
                session_token
            };

            const signedUrl = this.generateTranscribeUrl({ credentials, region, languageCode });

            logger.debug('connecting...');
            const connection = new WebSocket(signedUrl);

            connection.binaryType = "arraybuffer";
            connection.onopen = () => {
                logger.debug('connected');
                res(connection);
            };
        });
    }

    private generateTranscribeUrl({ credentials, region, languageCode }): string {
        // const url = ['wss://transcribestreaming.us-west-2.amazonaws.com:8443',
        //     '/stream-transcription-websocket?',
        //     'media-encoding=pcm&',
        //     'sample-rate=16000&',
        //     'language-code=en-US']
        //     .join('');
        const url = [`wss://transcribestreaming.${region}.amazonaws.com:8443`,
            '/stream-transcription-websocket?',
            `media-encoding=pcm&`,
            `sample-rate=16000&`,
        `language-code=${languageCode}`]
            .join('');

        const signedUrl = Signer.signUrl(url, credentials, { region, service: 'transcribe' }, 300);

        return signedUrl;
    }

    private waitingForTranscriptionJobDone(jobName: string): Promise<string> {
        return new Promise(async (res, rej) => {
            while (true) {
                console.log('waiting for this thing');
                await this.sleep(1000);
                try {

                    const {
                        TranscriptionJob: {
                            TranscriptionJobStatus, Transcript
                        }
                    } = await this.getTranscriptionJobPromise(jobName);

                    if (TranscriptionJobStatus === 'COMPLETED') {
                        return res(Transcript.TranscriptFileUri);
                    }

                    if (TranscriptionJobStatus === 'FAILED') {
                        return rej('FAILED');
                    }
                } catch (err) {
                    rej(err);
                }
            }
        });
    }

    private getTranscriptionJobPromise(jobName: string): Promise<any> {
        return new Promise((res, rej) => {
            this.speechToText.getTranscriptionJob({ TranscriptionJobName: jobName }, (err, response) => {
                if (err) {
                    return rej(err);
                }
                return res(response);
            });
        });
    }

    private startTranscriptionJobPromise(transcribeParams): Promise<any> {
        return new Promise((res, rej) => {
            this.speechToText.startTranscriptionJob(transcribeParams, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    res(data);
                }
            });
        });
    }

    private async fetchASRFromS3(uri: string): Promise<SpeechToTextOutput> {
        const data = await fetch(uri, {
            mode: "no-cors",
            headers: {
                'Access-Control-Allow-Origin': '*',
                'content-type': 'application/json'
            }
        });
        console.log(data);
        return this.serializeDataFromTranscribe(data);
    }

    private serializeDataFromTranscribe(data: any): SpeechToTextOutput {
        return {
            transcription: {
                fullText: "test",
                lines: [],
                linesDetailed: []
            }
        };
    }

    private createMediaFileUriFromSpeechToText(input: SpeechToTextInput, credentials: any)
        : Promise<string> {
        return new Promise(async (res, rej) => {
            const { transcription: { source = {} } = {} } = input;
            if (isStorageSource(source)) {
                const { key, level, identityId } = source;
                let opt = {};
                if (level) {
                    opt = { level };
                }
                if (identityId) {
                    opt = { ...opt, identityId };
                }
                return res(await this.getUnsignedS3Uri(key, opt));
            } else if (isFileSource(source)) {
                const key = await this.uploadFileToS3(source.file, credentials) as string;
                return res(await this.getUnsignedS3Uri(key));
            } else if (isBytesSource(source)) {
                const key = await this.uploadFileToS3(source.bytes, credentials) as string;
                return res(await this.getUnsignedS3Uri(key));
            }
            return rej("No valid source found");
        });
    }

    private uploadFileToS3(bytes: Object, credentials: any): Promise<string> {
        return new Promise(async (res, rej) => {
            const { authenticated, identityId } = credentials;
            const level = authenticated ? 'private' : 'public';
            const objectKey = authenticated ? `${identityId}/${uuid()}` : `${uuid()}`;
            Storage.put(objectKey, bytes, { level })
                .then(({ key }: any) => res(key as string))
                .catch(err => rej(err));

        });
    }

    private async getUnsignedS3Uri(key: string, opt?: any) {
        const signedUri = await Storage.get(key, opt) as string;
        const [uri,] = signedUri.split("?");
        return uri;
    }
}
