import { AbstractPredictionsProvider } from ".";

export abstract class AbstractInferPredictionsProvider extends AbstractPredictionsProvider {

    getCategory(): string {
        return "Predictions:Infer";
    }
}
