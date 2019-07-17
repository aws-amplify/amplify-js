import { AbstractPredictionsProvider } from "../types/Providers";
import {
    TranslateTextInput, TextToSpeechInput, SpeechToTextInput, IdentifyEntityInput, IdentifyFacesInput, 
    IdentifyTextInput, IdentifyTextOutput, IdentifyEntityOutput, IdentifyFacesOutput,
    TextToSpeechOutput, TranslateTextOutput,  SpeechToTextOutput} from '../types';

export default class GraphQLPredictionsProvider extends AbstractPredictionsProvider {

    constructor() {
        super();
    }

    getProviderName(): string {
        return "GraphQLPredictionsProvider";
    }

    getCategory(): string {
        return "GraphQLResolver";
    }

    convert(input: TranslateTextInput): Promise<TranslateTextOutput>;
    convert(input: TextToSpeechInput): Promise<TextToSpeechOutput>;
    convert(input: SpeechToTextInput): Promise<SpeechToTextOutput>;
    convert(input: TranslateTextInput | TextToSpeechInput | SpeechToTextInput):
        Promise<TranslateTextOutput | TextToSpeechOutput | SpeechToTextOutput> {
        return this.orchestrateWithGraphQL(input);
    }
    identify(input: IdentifyTextInput): Promise<IdentifyTextOutput>;
    identify(input: IdentifyEntityInput): Promise<IdentifyEntityOutput>;
    identify(input: IdentifyFacesInput): Promise<IdentifyFacesOutput>;
    identify(input: IdentifyTextInput | IdentifyEntityInput | IdentifyFacesInput)
        : Promise<IdentifyTextOutput | IdentifyEntityOutput | IdentifyFacesOutput> {
        return this.orchestrateWithGraphQL(input);
    }

    interpret(input: any): Promise<any> {
        return this.orchestrateWithGraphQL(input);
    }

    infer(input: any): Promise<any> {
        return this.orchestrateWithGraphQL(input);
    }

    /**
     * Call graphQL endpoint with the provided input and return the promise with results.
     * This provides a generic implementation which should suffice in most cases. A particular 
     * predictions category can choose to override and provide different implementation(s) based
     * on the provided input and provider options.
     * @param input is of generated type from Amplify CLI for orchestrating multiple ML services
     */
    protected orchestrateWithGraphQL(input: any): Promise<any> {
        throw new Error("orchestrateWithGraphQL is not implemented by this provider");
    }
}
