import { Credentials } from '@aws-amplify/core';
import { AbstractInferPredictionsProvider } from "../types/Providers";
import { GraphQLPredictionsProvider } from '.';

export default class AmazonAIInferPredictionsProvider extends AbstractInferPredictionsProvider {

    private graphQLPredictionsProvider: GraphQLPredictionsProvider;

    constructor() {
        super();
    }

    getProviderName() {
        return "AmazonAIInferPredictionsProvider";
    }

    protected orchestrateWithGraphQL(input: any): Promise<any> {
        return this.graphQLPredictionsProvider.infer(input);
    }
}
