import { Credentials } from '@aws-amplify/core';
import { AbstractPredictionsProvider } from "../types/Providers";
import { TranslateTextInput, TextToSpeechInput, SpeechToTextInput } from '../types';

export default class GraphQLPredictionsProvider extends AbstractPredictionsProvider {

    getProviderName(): string {
        return "GraphQLPredictionsProvider";
    }
    
    getCategory(): string {
        return "Predictions:GraphQLResolver";
    }

    convert<T>(input: TranslateTextInput | TextToSpeechInput | SpeechToTextInput | T): Promise<any> {
        return this.orchestrateWithGraphQL(input);
    }

    identify(input: any): Promise<any> {
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
