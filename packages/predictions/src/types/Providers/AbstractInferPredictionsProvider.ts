import { AbstractPredictionsProvider } from "./AbstractPredictionsProvider";

export abstract class AbstractInferPredictionsProvider extends AbstractPredictionsProvider {

    getCategory(): string {
        return "Predictions:Infer";
    }
}
