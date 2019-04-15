import { AbstractMLProvider } from "./ML";
import * as Translate from 'aws-sdk/clients/translate';
import { TranslateTextOptions } from "../types";
import { Credentials, AWS } from '@aws-amplify/core';

export default class AmazonTranslate extends AbstractMLProvider {
    private translate: Translate;
    constructor() {
        super();
    }

    getProviderName() {
        return "AmazonTranslate";
    }

    execute = {
        translate: (translateOptions: TranslateTextOptions) => {
            return new Promise(async (res, rej) => {
                const credentials = await Credentials.get();
                if (!credentials) { return rej('No credentials'); }
                this.translate = new Translate({ region: this._config.region, credentials });
                this.translate.translateText({
                    SourceLanguageCode: translateOptions.sourceLanguage,
                    TargetLanguageCode: translateOptions.destinationLanguage,
                    Text: translateOptions.text
                }, (err, data) => {
                    if (err) {
                        rej(err)
                    } else {
                        res({ translatedText: data.TranslatedText });
                    }
                })
            });
        }
    }
}