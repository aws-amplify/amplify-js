import { AnalyticsOptions, EventAttributes, EventMetrics } from './types';
/**
* Provide mobile analytics client functions
*/
export default class AnalyticsClass {
    private _config;
    private amaClient;
    private pinpointClient;
    private _buffer;
    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    constructor(config: AnalyticsOptions);
    configure(config: any): any;
    /**
     * Record Session start
     */
    startSession(): Promise<void>;
    /**
     * Record Session stop
     */
    stopSession(): Promise<void>;
    /**
     * Restart Analytics client with credentials provided
     * @param {Object} credentials - Cognito Credentials
     */
    restart(): void;
    /**
    * Record one analytic event and send it to Pinpoint
    * @param {String} name - The name of the event
    * @param {Object} [attributs] - Attributes of the event
    * @param {Object} [metrics] - Event metrics
    */
    record(name: string, attributes?: EventAttributes, metrics?: EventMetrics): Promise<void>;
    /**
    * Record one analytic event
    * @param {String} name - Event name
    * @param {Object} [attributes] - Attributes of the event
    * @param {Object} [metrics] - Event metrics
    */
    recordMonetization(name: any, attributes?: EventAttributes, metrics?: EventMetrics): Promise<void>;
    _checkConfig(): boolean;
    _ensureCredentials(): any;
    _initClients(): Promise<boolean>;
    /**
     * Init AMA client with configuration
     */
    _initAMA(): void;
    /**
     * Init Pinpoint with configuration and update pinpoint client endpoint
     */
    _initPinpoint(): void;
    /**
     * EndPoint request
     * @return {Object} - The request of updating endpoint
     */
    _endpointRequest(): {
        Demographic: {
            AppVersion: any;
            Make: any;
            Model: any;
            ModelVersion: any;
            Platform: any;
        };
        User: {
            UserId: any;
        };
    };
}
