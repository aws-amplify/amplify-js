import { AbstractConvertPredictionsProvider } from "../types/Providers/AbstractConvertPredictionsProvider";
import { GraphQLPredictionsProvider } from '.';
import * as Translate from 'aws-sdk/clients/translate';
import * as TextToSpeech from 'aws-sdk/clients/polly';
import * as SpeechToText from 'aws-sdk/clients/transcribeservice';
import { TranslateTextInput, TextToSpeechInput, SpeechToTextInput } from "../types";
import { Credentials } from '@aws-amplify/core';

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

    translateText(input: TranslateTextInput) {
        console.log("Starting translation");
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) { return rej('No credentials'); }
            this.translate = new Translate({ region: this._config.region, credentials });
            this.translate.translateText({
                SourceLanguageCode: input.translateText.source.language,
                TargetLanguageCode: input.translateText.targetLanguage,
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

    convertTextToSpeech(input: TextToSpeechInput) {
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) { return rej('No credentials'); }
            this.textToSpeech = new TextToSpeech({ region: this._config.region, credentials });
            this.textToSpeech.synthesizeSpeech({
                OutputFormat: 'mp3',
                Text: input.textToSpeech.source.text,
                VoiceId: input.textToSpeech.voiceId,
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
    convertSpeechToText(input: SpeechToTextInput) {
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

    orchestrateWithGraphQL(input: any): Promise<any> {
        return this.graphQLPredictionsProvider.orchestrateWithGraphQL(input);
    }
}
