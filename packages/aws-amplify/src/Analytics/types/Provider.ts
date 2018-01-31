export interface AnalyticsProvider {
    configure(config: object): any;
    init(config?: object): any;
    putEvent(params: object): any;
    getCategory(): string;
}
