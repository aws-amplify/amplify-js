import { Credentials } from '@aws-amplify/core';
import { AbstractIdentifyPredictionsProvider } from "../types/Providers";

export default class AmazonAIIdentifyPredictionsProvider extends AbstractIdentifyPredictionsProvider {
    constructor() {
        super();
    }

    getProviderName() {
        return "AmazonAIIdentifyPredictionsProvider";
    }

}
