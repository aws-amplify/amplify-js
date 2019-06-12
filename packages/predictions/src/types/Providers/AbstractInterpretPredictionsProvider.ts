import { AbstractPredictionsProvider } from "./AbstractPredictionsProvider";

export abstract class AbstractInterpretPredictionsProvider extends AbstractPredictionsProvider {

    getCategory(): string {
        return "Predictions:Interpret";
    }
}
