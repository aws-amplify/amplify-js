import { AbstractConvertPredictionsProvider } from "../types/Providers/AbstractConvertPredictionsProvider";
import * as Translate from 'aws-sdk/clients/translate';
import * as TextToSpeech from 'aws-sdk/clients/polly';
import * as SpeechToText from 'aws-sdk/clients/transcribeservice';
import {
    TranslateTextInput, TextToSpeechInput,
    SpeechToTextInput, isTranslateTextInput,
    isTextToSpeechInput, isSpeechToTextInput, TranslateTextOutput, TextToSpeechOutput
} from "../types";
import { Credentials, ConsoleLogger as Logger } from '@aws-amplify/core';
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
                defaults: { VoiceId = "Lotte", LanguageCode = "en-US"} = {},
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

    // TODO: Experimental code, not to be merged.
    protected convertSpeechToText2(input: SpeechToTextInput) {
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) { return rej('No credentials'); }
            this.speechToText = new SpeechToText({ region: this._config.region, credentials });
            this.speechToText.startTranscriptionJob({
                LanguageCode: "en-US",
                Media: { MediaFileUri: input.transcription.source.file },
                MediaFormat: "mp3",
                TranscriptionJobName: "testJob" + Date.now(),
                OutputBucketName: input.transcription.source.outputBucketName
                // tslint:disable-next-line: align
            }, (err, data) => {
                if (err) {
                    console.log(err);
                    rej(err);
                } else {
                    console.log(data);
                    res({
                        s3file: data.TranscriptionJob.Transcript.TranscriptFileUri // TODO: This does not work
                    });
                }
            });
        });
    }

    protected orchestrateWithGraphQL(input: any): Promise<any> {
        return this.graphQLPredictionsProvider.convert(input);
    }
}
