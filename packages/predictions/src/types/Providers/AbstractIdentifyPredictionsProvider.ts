import { AbstractPredictionsProvider } from ".";

export abstract class AbstractIdentifyPredictionsProvider extends AbstractPredictionsProvider {

    getCategory(): string {
        return "Predictions:Identify";
    }
}
