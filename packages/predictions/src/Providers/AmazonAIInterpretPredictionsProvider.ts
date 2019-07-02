import { Credentials } from '@aws-amplify/core';
import { AbstractInterpretPredictionsProvider } from "../types/Providers";
import { GraphQLPredictionsProvider } from '.';

export default class AmazonAIInterpretPredictionsProvider extends AbstractInterpretPredictionsProvider {

    private graphQLPredictionsProvider: GraphQLPredictionsProvider;

    constructor() {
        super();
    }

    getProviderName() {
        return "AmazonAIInterpretPredictionsProvider";
    }

    protected orchestrateWithGraphQL(input: any): Promise<any> {
        return this.graphQLPredictionsProvider.interpret(input);
    }
}
