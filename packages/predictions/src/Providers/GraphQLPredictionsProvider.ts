import { Credentials } from '@aws-amplify/core';
import { AbstractPredictionsProvider } from "../types/Providers";
import {
    TranslateTextInput, TextToSpeechInput, SpeechToTextInput,
    IdentifyEntityInput, IdentifyFacesInput
} from '../types';

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

    convert(input: TranslateTextInput | TextToSpeechInput | SpeechToTextInput): Promise<any> {
        return this.orchestrateWithGraphQL(input);
    }

    identify(input: IdentifyEntityInput | IdentifyFacesInput): Promise<any> {
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
