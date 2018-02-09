export default class AWSAnalyticsProvider {
    private _config;
    private mobileAnalytics;
    private pinpointClient;
    private _sessionId;
    constructor(config?: any);
    getCategory(): string;
    configure(config: any): any;
    private _init(config);
    record(params: any): Promise<any>;
    private _startSession(params);
    private _stopSession(params);
    private _recordCustomEvent(params);
    private _initMobileAnalytics();
    /**
     * @private
     * Init Pinpoint with configuration and update pinpoint client endpoint
     * @return - A promise resolves if endpoint updated successfully
     */
    private _initPinpoint();
    /**
     * EndPoint request
     * @return {Object} - The request of updating endpoint
     */
    private _endpointRequest();
    /**
     * @private
     * generate client context with endpoint Id and app Id provided
     */
    private _generateClientContext();
}
