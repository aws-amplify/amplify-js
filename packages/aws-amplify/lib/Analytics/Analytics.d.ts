import { AnalyticsProvider, EventAttributes, EventMetrics } from './types';
/**
* Provide mobile analytics client functions
*/
export default class AnalyticsClass {
    private _config;
    private _buffer;
    private _provider;
    private _pluggables;
    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    constructor();
    /**
     * configure Analytics
     * @param {Object} config - Configuration of the Analytics
     */
    configure(config: any): any;
    /**
     * add plugin into Analytics category
     * @param {Object} pluggable - an instance of the plugin
     */
    addPluggable(pluggable: AnalyticsProvider): void;
    /**
     * Record Session start
     * @return - A promise which resolves if buffer doesn't overflow
     */
    startSession(): Promise<boolean | void>;
    /**
    * Receive a capsule from Hub
    * @param {any} capsuak - The message from hub
    */
<<<<<<< HEAD
    onHubCapsule(capsule: any): void;
=======
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
>>>>>>> upstream/master
    /**
     * Record Session stop
     * @return - A promise which resolves if buffer doesn't overflow
     */
    stopSession(): Promise<boolean | void>;
    /**
     * Record one analytic event and send it to Pinpoint
     * @param {String} name - The name of the event
     * @param {Object} [attributs] - Attributes of the event
     * @param {Object} [metrics] - Event metrics
     * @return - A promise which resolves if buffer doesn't overflow
     */
    record(eventName: string, attributes?: EventAttributes, metrics?: EventMetrics): Promise<boolean | void>;
    /**
     * @private
     * @param {Object} params - params for the event recording
     * Send events from buffer
     */
<<<<<<< HEAD
    private _sendFromBuffer(params);
=======
    _ensureCredentials(): Promise<boolean>;
>>>>>>> upstream/master
    /**
     * @private
     * @param params - params for the event recording
     * Put events into buffer
     */
    private _putToBuffer(params);
    /**
     * @private
<<<<<<< HEAD
     * check if current crednetials exists
     */
    private _getCredentials();
=======
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
>>>>>>> upstream/master
}
