import { AnalyticsProvider } from '../types';
export default class AWSAnalyticsProvider implements AnalyticsProvider {
    private _config;
    private mobileAnalytics;
    private pinpointClient;
    private _sessionId;
    constructor(config?: any);
    getCategory(): string;
    configure(config: any): any;
    init(config: any): Promise<boolean>;
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
