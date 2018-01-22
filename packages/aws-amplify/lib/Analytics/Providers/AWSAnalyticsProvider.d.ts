export declare class AWSAnalyticsProvider {
    private _config;
    private mobileAnalytics;
    private pinpointClient;
    private _sessionId;
    constructor();
    configure(config: any): any;
    initClients(config: any): Promise<boolean>;
    putEvent(params: any): void;
    private _startSession(params);
    private _stopSession(params);
    private _recordCustomEvent(params);
    /**
     * @private
     * check if app Id exists
     */
    private _checkConfig();
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
declare const instance: AWSAnalyticsProvider;
export default instance;
