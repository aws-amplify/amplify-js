import { AbstractIdentifyPredictionsProvider, AbstractPredictionsProvider } from "../types/Providers";
import { AmazonAIConvertPredictionsProvider, GraphQLPredictionsProvider } from ".";
import { TranslateTextInput, TextToSpeechInput, SpeechToTextInput, PredictionsOptions } from "../types";
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

    getProviderName() {
        return "AmazonAIPredictionsProvider";
    }

    configure(config: PredictionsOptions) {
        this.convertProvider.configure(config.Convert);
        this.identifyProvider.configure(config.Identify);
        return config;
    }

    convert(input: TranslateTextInput): Promise<any> {
        return this.convertProvider.convert(input);
    }

}
