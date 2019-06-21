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

    translateText(input: TranslateTextInput): Promise<any> {
        return this.convertProvider.translateText(input);
    }

    convertTextToSpeech(input: TextToSpeechInput): Promise<any> {
        return this.convertProvider.convertTextToSpeech(input);
    }

    convertSpeechToText(input: SpeechToTextInput): Promise<any> {
        return this.convertProvider.convertSpeechToText(input);
    }

    orchestrateWithGraphQL(input: any): Promise<any> {
        return this.graphQLPredictionsProvider.orchestrateWithGraphQL(input);
    }
}
