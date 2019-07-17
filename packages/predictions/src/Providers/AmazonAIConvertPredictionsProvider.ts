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
import { Credentials, ConsoleLogger as Logger, AWS } from '@aws-amplify/core';
import { GraphQLPredictionsProvider } from "..";

const logger = new Logger('AmazonAIConvertPredictionsProvider');
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
                    const blob = new Blob([data.AudioStream as ArrayBuffer], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    res({
                        speech: { url },
                        audioStream: data.AudioStream,
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
                console.log('starting transcription..');
                const credentials = await Credentials.get();
                if (!credentials) { return rej('No credentials'); }

                const MediaFileUri = await this.createMediaFileUriFromSpeechToText(input, credentials);

                this.speechToText = new SpeechToText({ region: 'us-west-2', credentials });
                const jobName = `predictions-${uuid()}`;

                await this.startTranscriptionJobPromise({
                    LanguageCode: "en-US",
                    Media: {
                        MediaFileUri
                    },
                    MediaFormat: "mp3",
                    TranscriptionJobName: jobName,
                });

                const uri = await this.waitingForTranscriptionJobDone(jobName);

                res(await this.fetchASRFromS3(uri));

            } catch (err) {
                rej(err);
            }
        });
    }

    protected orchestrateWithGraphQL(input: any): Promise<any> {
        return this.graphQLPredictionsProvider.convert(input);
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
