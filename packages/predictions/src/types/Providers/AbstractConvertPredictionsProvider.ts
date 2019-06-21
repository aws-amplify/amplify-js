import { TranslateTextInput, TextToSpeechInput, SpeechToTextInput } from "../Predictions";
import { AbstractPredictionsProvider } from ".";

export abstract class AbstractConvertPredictionsProvider extends AbstractPredictionsProvider{

    getCategory(): string {
        return "Predictions:Convert";
    }

    translateText(translateTextInput: TranslateTextInput): Promise<any> {
        throw new Error("convertText is not implemented by this provider");
    }

    convertTextToSpeech(textToSpeechInput: TextToSpeechInput): Promise<any> {
        throw new Error("convertTextToSpeech is not implemented by this provider");
    }

    convertSpeechToText(speechToTextInput: SpeechToTextInput): Promise<any> {
        throw new Error("convertSpeechToText is not implemented by this provider");
    }
}
