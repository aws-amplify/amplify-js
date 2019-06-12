import { AbstractConvertPredictionsProvider } from "../types/Providers/AbstractConvertPredictionsProvider";
import * as Translate from 'aws-sdk/clients/translate';
import { TranslateTextInput, TextToSpeechInput } from "../types";
import { Credentials, AWS } from '@aws-amplify/core';

export default class AmazonAIConvertPredictionsProvider extends AbstractConvertPredictionsProvider {
    private translate: Translate;
    constructor() {
        super();
    }

    getProviderName() {
        return "AmazonAIConvertPredictionsProvider";
    }

    translateText(input: TranslateTextInput) {
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) { return rej('No credentials'); }
            this.translate = new Translate({ region: this._config.region, credentials });
            this.translate.translateText({
                SourceLanguageCode: input.translateText.source.language,
                TargetLanguageCode: input.translateText.providerOptions.targetLanguage,
                Text: input.translateText.source.text
            }, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    res({ translatedText: data.TranslatedText });
                }
            });
        });
    }
}
