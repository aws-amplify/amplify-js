import { Credentials } from '@aws-amplify/core';
import { AbstractIdentifyPredictionsProvider } from "../types/Providers";
import { GraphQLPredictionsProvider } from '.';

export default class AmazonAIIdentifyPredictionsProvider extends AbstractIdentifyPredictionsProvider {

    private graphQLPredictionsProvider: GraphQLPredictionsProvider;

    constructor() {
        super();
    }

    getProviderName() {
        return "AmazonAIIdentifyPredictionsProvider";
    }

    protected orchestrateWithGraphQL(input: any): Promise<any> {
        return this.graphQLPredictionsProvider.identify(input);
    }
}
