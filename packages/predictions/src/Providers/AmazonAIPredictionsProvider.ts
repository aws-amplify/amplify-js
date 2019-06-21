import { AbstractIdentifyPredictionsProvider, AbstractPredictionsProvider } from "../types/Providers";
import { AmazonAIConvertPredictionsProvider, GraphQLPredictionsProvider } from ".";
import { TranslateTextInput, TextToSpeechInput, SpeechToTextInput, PredictionsOptions } from "../types";
import AmazonAIIdentifyPredictionsProvider from "./AmazonAIIdentifyPredictionsProvider";

export default class AmazonAIPredictionsProvider extends AbstractPredictionsProvider {
    
    private graphQLPredictionsProvider: GraphQLPredictionsProvider;

    constructor() {
        super();
    }

    getCategory(): string {
        return "Predictions";
    }

    getProviderName() {
        return "AmazonAIPredictionsProvider";
    }

    convertProvider = new AmazonAIConvertPredictionsProvider();
    identifyProvider = new AmazonAIIdentifyPredictionsProvider();

    configure(config: PredictionsOptions) {
        this.convertProvider.configure(config);
        this.identifyProvider.configure(config);
        super.configure(config);
        return config;
    }

    convert(input: TranslateTextInput): Promise<any> {
        return this.convertProvider.convert(input);
    }

}
