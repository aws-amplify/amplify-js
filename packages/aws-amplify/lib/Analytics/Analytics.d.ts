import { AnalyticsOptions, EventAttributes, EventMetrics } from './types';
/**
* Provide mobile analytics client functions
*/
export default class AnalyticsClass {
    private _config;
    private amaClient;
    private pinpointClient;
    private _buffer;
    private mobileAnalytics;
    private _sessionId;
    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    constructor(config: AnalyticsOptions);
    /**
     * configure Analytics
     * @param {Object} config - Configuration of the Analytics
     */
    configure(config: any): any;
    /**
     * Record Session start
     * @return - A promise which resolves if event record successfully
     */
    startSession(): Promise<any>;
    /**
     * Record Session stop
     * @return - A promise which resolves if event record successfully
     */
    stopSession(): Promise<any>;
    /**
     * @async
     * Restart Analytics client and record session stop
     * @return - A promise ehich resolves to be true if current credential exists
     */
    restart(): Promise<void>;
    /**
    * Record one analytic event and send it to Pinpoint
    * @param {String} name - The name of the event
    * @param {Object} [attributs] - Attributes of the event
    * @param {Object} [metrics] - Event metrics
    * @return - A promise which resolves if event record successfully
    */
    record(name: string, attributes?: EventAttributes, metrics?: EventMetrics): Promise<any>;
    /**
    * Receive a capsule from Hub
    * @param {any} capsuak - The message from hub
    */
    onHubCapsule(capsule: any): void;
    /**
    * Record one analytic event
    * @param {String} name - Event name
    * @param {Object} [attributes] - Attributes of the event
    * @param {Object} [metrics] - Event metrics
    */
    /**
     * @private
     * generate client context with endpoint Id and app Id provided
     */
    _generateClientContext(): string;
    /**
     * generate random string
     */
    generateRandomString(): string;
    /**
     * @private
     * check if app Id exists
     */
    _checkConfig(): boolean;
    /**
     * @private
     * check if current crednetials exists
     */
    _ensureCredentials(): Promise<boolean>;
    /**
     * @private
     * @async
     * init clients for Anlytics including mobile analytics and pinpoint
     * @return - True if initilization succeeds
     */
    _initClients(): Promise<boolean>;
    /**
     * @private
     * Init mobile analytics and clear buffer
     */
    _initMobileAnalytics(): void;
    /**
     * @private
     * Init Pinpoint with configuration and update pinpoint client endpoint
     * @return - A promise resolves if endpoint updated successfully
     */
    _initPinpoint(): Promise<{}>;
    updateEndpoint(config: any): Promise<{}>;
    /**
     * EndPoint request
     * @return {Object} - The request of updating endpoint
     */
    _endpointRequest(): {
        Address: any;
        ChannelType: string;
        Demographic: {
            AppVersion: any;
            Make: any;
            Model: any;
            ModelVersion: any;
            Platform: any;
        };
        OptOut: any;
        RequestId: any;
        EffectiveDate: string;
        User: {
            UserId: any;
            UserAttributes: {
                CognitoIdentityPool: any[];
            };
        };
    };
}
