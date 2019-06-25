import { AbstractPredictionsProvider } from ".";

export abstract class AbstractInterpretPredictionsProvider extends AbstractPredictionsProvider {

    getCategory(): string {
        return "Interpret";
    }
}
