import { AbstractIdentifyPredictionsProvider, AbstractPredictionsProvider } from "../types/Providers";
import { AmazonAIConvertPredictionsProvider, GraphQLPredictionsProvider } from ".";
import {
    TranslateTextInput,
    TextToSpeechInput,
    PredictionsOptions,
    TranslateTextOutput,
    TextToSpeechOutput,
    isTranslateTextInput,
    SpeechToTextInput,
    SpeechToTextOutput,
    isTextToSpeechInput,
    isSpeechToTextInput
} from "../types";
import AmazonAIIdentifyPredictionsProvider from "./AmazonAIIdentifyPredictionsProvider";

export default class AmazonAIPredictionsProvider extends AbstractPredictionsProvider {

    private graphQLPredictionsProvider: GraphQLPredictionsProvider;
    private convertProvider: AmazonAIConvertPredictionsProvider;
    private identifyProvider: AmazonAIIdentifyPredictionsProvider;

    constructor() {
        super();
        this.convertProvider = new AmazonAIConvertPredictionsProvider();
        this.identifyProvider = new AmazonAIIdentifyPredictionsProvider();
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
        return config;
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
        } //else {
        //     // Orchestration type request. Directly call graphql
        //     return this.orchestrateWithGraphQL(input);
        // }
        Promise.reject();
    }

}
