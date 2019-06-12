import { AbstractPredictionsProvider } from "./AbstractPredictionsProvider";

export abstract class AbstractIdentifyPredictionsProvider extends AbstractPredictionsProvider {

    getCategory(): string {
        return "Predictions:Identify";
    }
}
