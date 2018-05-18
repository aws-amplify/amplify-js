import { AnalyticsProvider } from '../types';
export default class AWSAnalyticsProvider implements AnalyticsProvider {
    private _config;
    private mobileAnalytics;
    private pinpointClient;
    private _sessionId;
    private _buffer;
    private _clientInfo;
    constructor(config?: any);
    /**
     * @private
     * @param params - params for the event recording
     * Put events into buffer
     */
    private _putToBuffer(params);
    private _sendFromBuffer(params);
    /**
     * get the category of the plugin
     */
    getCategory(): string;
    /**
     * get provider name of the plugin
     */
    getProviderName(): string;
    /**
     * configure the plugin
     * @param {Object} config - configuration
     */
    configure(config: any): object;
    /**
     * record an event
     * @param {Object} params - the params of an event
     */
    record(params: any): Promise<boolean>;
    /**
     * @private
     * @param params
     */
    private _startSession(params);
    /**
     * @private
     * @param params
     */
    private _stopSession(params);
    private _updateEndpoint(params);
    /**
     * @private
     * @param params
     */
    private _recordCustomEvent(params);
    /**
     * @private
     * @param config
     * Init the clients
     */
    private _initClients(config, credentials);
    private _getEndpointId(cacheKey);
    /**
     * EndPoint request
     * @return {Object} - The request of updating endpoint
     */
    private _endpointRequest(config, event);
    /**
     * @private
     * generate client context with endpoint Id and app Id provided
     */
    private _generateClientContext(config);
    /**
     * @private
     * check if current credentials exists
     */
    private _getCredentials();
}
