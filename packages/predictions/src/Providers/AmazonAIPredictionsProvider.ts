import { AbstractIdentifyPredictionsProvider, AbstractPredictionsProvider } from "../types/Providers";
import { AmazonAIConvertPredictionsProvider, GraphQLPredictionsProvider } from ".";
import { TranslateTextInput, TextToSpeechInput, SpeechToTextInput, PredictionsOptions, IdentifyTextInput, 
    IdentifyTextOutput, IdentifyEntityInput, IdentifyEntityOutput, IdentifyFacesInput, IdentifyFacesOutput, 
    isIdentifyTextInput, isIdentifyEntityInput, isIdentifyFacesInput, TranslateTextOutput,
    TextToSpeechOutput, isTranslateTextInput, SpeechToTextOutput, isTextToSpeechInput, isSpeechToTextInput
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

    identify(input: IdentifyTextInput): Promise<IdentifyTextOutput>;
    identify(input: IdentifyEntityInput): Promise<IdentifyEntityOutput>;
    identify(input: IdentifyFacesInput): Promise<IdentifyFacesOutput>;
    identify(input: IdentifyTextInput | IdentifyEntityInput | IdentifyFacesInput)
        : Promise<IdentifyTextOutput | IdentifyEntityOutput | IdentifyFacesOutput> {
        if (isIdentifyTextInput(input)) {
            return this.identifyProvider.identify(input);
        } else if (isIdentifyEntityInput(input)) {
            return this.identifyProvider.identify(input);
        } else if (isIdentifyFacesInput(input)) {
            return this.identifyProvider.identify(input);
        }
        // else {
        //     return this.orchestrateWithGraphQL(input);
        // }
    }

}
