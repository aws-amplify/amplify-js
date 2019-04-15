export interface MLProvider {
    configure(config: object): object;

    getCategory(): string;

    getProviderName(): string;

    execute: MLExecutionList;
}

export interface MLExecutionList {
    [key: string]: Function;
}