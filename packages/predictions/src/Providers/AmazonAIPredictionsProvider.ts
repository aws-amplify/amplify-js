import { AbstractPredictionsProvider } from "../types/Providers";
import {
    AmazonAIConvertPredictionsProvider,
    AmazonAIInterpretPredictionsProvider,
    AmazonAIIdentifyPredictionsProvider
} from ".";
import { TranslateTextInput, TextToSpeechInput, SpeechToTextInput, PredictionsOptions, IdentifyTextInput, 
    IdentifyTextOutput, IdentifyLabelsInput, IdentifyLabelsOutput, IdentifyEntitiesInput, IdentifyEntitiesOutput, 
    isIdentifyTextInput, isIdentifyLabelsInput, isIdentifyEntitiesInput, TranslateTextOutput,
    TextToSpeechOutput, isTranslateTextInput, SpeechToTextOutput, isTextToSpeechInput, isSpeechToTextInput,
    InterpretTextInput, InterpretTextOutput, isInterpretTextInput
 } from "../types";

export default class AmazonAIPredictionsProvider extends AbstractPredictionsProvider {

    private convertProvider: AmazonAIConvertPredictionsProvider;
    private identifyProvider: AmazonAIIdentifyPredictionsProvider;
    private interpretProvider: AmazonAIInterpretPredictionsProvider;

    constructor() {
        super();
        this.convertProvider = new AmazonAIConvertPredictionsProvider();
        this.identifyProvider = new AmazonAIIdentifyPredictionsProvider();
        this.interpretProvider = new AmazonAIInterpretPredictionsProvider();
    }

    getCategory(): string {
        return "Predictions";
    }

    getProviderName(): string {
        return "AmazonAIPredictionsProvider";
    }

    configure(config: PredictionsOptions) {
        this.convertProvider.configure(config.convert);
        this.identifyProvider.configure(config.identify);
        this.interpretProvider.configure(config.interpret);
        return config;
    }

    interpret(input: InterpretTextInput): Promise<InterpretTextOutput> {
        if (isInterpretTextInput(input)) {
            return this.interpretProvider.interpret(input);
        }
    }

    convert(input: TranslateTextInput): Promise<TranslateTextOutput>;
    convert(input: TextToSpeechInput): Promise<TextToSpeechOutput>;
    convert(input: SpeechToTextInput): Promise<SpeechToTextOutput>;
    convert(input: TranslateTextInput | TextToSpeechInput | SpeechToTextInput)
        : Promise<TextToSpeechOutput | TranslateTextOutput | SpeechToTextOutput> {
        if (isTranslateTextInput(input)) {
            return this.convertProvider.convert(input);
            // } else if (isTextToSpeechInput(input)) {
        } else if (isTextToSpeechInput(input)) {
            return this.convertProvider.convert(input);
        } else if (isSpeechToTextInput(input)) {
            return this.convertProvider.convert(input);
        }
        Promise.reject();
    }

    identify(input: IdentifyTextInput): Promise<IdentifyTextOutput>;
    identify(input: IdentifyLabelsInput): Promise<IdentifyLabelsOutput>;
    identify(input: IdentifyEntitiesInput): Promise<IdentifyEntitiesOutput>;
    identify(input: IdentifyTextInput | IdentifyLabelsInput | IdentifyEntitiesInput)
        : Promise<IdentifyTextOutput | IdentifyLabelsOutput | IdentifyEntitiesOutput> {
        if (isIdentifyTextInput(input)) {
            return this.identifyProvider.identify(input);
        } else if (isIdentifyLabelsInput(input)) {
            return this.identifyProvider.identify(input);
        } else if (isIdentifyEntitiesInput(input)) {
            return this.identifyProvider.identify(input);
        }
    }

}
