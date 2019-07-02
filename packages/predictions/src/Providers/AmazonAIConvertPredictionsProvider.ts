import { AbstractConvertPredictionsProvider } from "../types/Providers/AbstractConvertPredictionsProvider";
import * as Translate from 'aws-sdk/clients/translate';
import * as TextToSpeech from 'aws-sdk/clients/polly';
import * as SpeechToText from 'aws-sdk/clients/transcribeservice';
import {
    TranslateTextInput, TextToSpeechInput,
    SpeechToTextInput, isTranslateTextInput,
    isTextToSpeechInput, isSpeechToTextInput
} from "../types";
import { Credentials } from '@aws-amplify/core';
import { GraphQLPredictionsProvider } from "..";

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

    protected translateText(input: TranslateTextInput) {
        console.log("Starting translation");
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) { return rej('No credentials'); }
            const sourceLanguageCode = input.translateText.source.language || this._config.translateText.sourceLanguage;
            const targetLanguageCode = input.translateText.targetLanguage || this._config.translateText.targetLanguage;
            if (!sourceLanguageCode || !targetLanguageCode) {
                throw new Error("Please provide both source and target language");
            }
            this.translate = new Translate({ region: this._config.translateText.region, credentials });
            this.translate.translateText({
                SourceLanguageCode: sourceLanguageCode,
                TargetLanguageCode: targetLanguageCode,
                Text: input.translateText.source.text
                // tslint:disable-next-line: align
            }, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    res({ text: data.TranslatedText, language: data.TargetLanguageCode });
                }
            });
        });
    }

    protected convertTextToSpeech(input: TextToSpeechInput) {
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) { return rej('No credentials'); }
            const language = input.textToSpeech.source.language || this._config.textToSpeech.language;
            const voiceId = input.textToSpeech.voiceId || this._config.textToSpeech.voiceId;
            this.textToSpeech = new TextToSpeech({ region: this._config.textToSpeech.region, credentials });
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
                    });
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

    // TODO: Experimental code, not to be merged.
    protected convertSpeechToText(input: SpeechToTextInput) {
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) { return rej('No credentials'); }

            // Create WebSocket connection.
            // tslint:disable-next-line: max-line-length
            const socket = new WebSocket('wss://transcribestreaming.us-west-2.amazonaws.com:8443/stream-transcription-websocket');

            // Connection opened
            socket.addEventListener('open', function(event) {
                socket.send('Hello Server!');
            });

            // Listen for messages
            socket.addEventListener('message', function(event) {
                console.log('Message from server ', event.data);
            });

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
