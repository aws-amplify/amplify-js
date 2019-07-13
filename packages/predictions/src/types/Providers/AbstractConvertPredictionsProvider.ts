import {
    TranslateTextInput, TextToSpeechInput,
    SpeechToTextInput, isTranslateTextInput,
    isTextToSpeechInput, isSpeechToTextInput, TranslateTextOutput, TextToSpeechOutput
} from "../Predictions";
import { AbstractPredictionsProvider } from ".";
import { ConsoleLogger as Logger } from '@aws-amplify/core';
const logger = new Logger('AbstractConvertPredictionsProvider');

export abstract class AbstractConvertPredictionsProvider extends AbstractPredictionsProvider {

    getCategory(): string {
        return "Convert";
    }

    convert(input: TranslateTextInput): Promise<TranslateTextOutput>;
    convert(input: TextToSpeechInput): Promise<TextToSpeechOutput>;
    convert(input: TranslateTextInput | TextToSpeechInput): Promise<TextToSpeechOutput | TranslateTextOutput> {
        if (isTranslateTextInput(input)) {
            logger.debug("translateText");
            return this.translateText(input);
            // } else if (isTextToSpeechInput(input)) {
        } else {
            logger.debug("textToSpeech");
            return this.convertTextToSpeech(input);
            // } else if (isSpeechToTextInput(input)) {
            //     logger.debug("textToSpeech");
            //     return this.convertSpeechToText(input);
            // } else {
            //     // Orchestration type request. Directly call graphql
            //     return this.orchestrateWithGraphQL(input);
        }
    }

    protected translateText(translateTextInput: TranslateTextInput): Promise<TranslateTextOutput> {
        throw new Error("convertText is not implemented by this provider");
    }

    protected convertTextToSpeech(textToSpeechInput: TextToSpeechInput): Promise<TextToSpeechOutput> {
        throw new Error("convertTextToSpeech is not implemented by this provider");
    }

    protected convertSpeechToText(speechToTextInput: SpeechToTextInput): Promise<any> {
        throw new Error("convertSpeechToText is not implemented by this provider");
    }
}
