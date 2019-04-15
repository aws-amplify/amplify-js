import { MLProvider, MLExecutionList } from "../types/Provider";
import { MLOptions } from "../types";

export abstract class AbstractMLProvider implements MLProvider {
    protected _config: MLOptions;
    configure(config: MLOptions) {
        this._config = config;
        return config;
    } 

    getCategory() {
        return "ML";
    }

    abstract getProviderName(): string;

    abstract execute: MLExecutionList;

}