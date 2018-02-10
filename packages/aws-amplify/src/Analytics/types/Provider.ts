export interface AnalyticsProvider {
    configure(config: object): object;
    record(params: object): Promise<boolean>;
    getCategory(): string;
    getProviderName(): string;
}
