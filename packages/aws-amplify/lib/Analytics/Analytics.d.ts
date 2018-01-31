import { EventAttributes, EventMetrics } from './types';
/**
* Provide mobile analytics client functions
*/
export default class AnalyticsClass {
    private _config;
    private _buffer;
    private _provider;
    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    constructor();
    /**
     * configure Analytics
     * @param {Object} config - Configuration of the Analytics
     */
    configure(config: any): object & {};
    /**
     * @async
     * init clients for Anlytics including mobile analytics and pinpoint
     * @return - True if initilization succeeds
     */
    init(): Promise<any>;
    /**
 * set the Analytics client
 * @param provider
 */
    setProvider(provider: any): void;
    /**
     * Record Session start
     * @return - A promise which resolves if event record successfully
     */
    startSession(): any;
    /**
     * Record Session stop
     * @return - A promise which resolves if event record successfully
     */
    stopSession(): any;
    /**
     * Record one analytic event and send it to Pinpoint
     * @param {String} name - The name of the event
     * @param {Object} [attributs] - Attributes of the event
     * @param {Object} [metrics] - Event metrics
     * @return - A promise which resolves if event record successfully
     */
    record(eventName: string, attributes?: EventAttributes, metrics?: EventMetrics): any;
    /**
     * @async
     * Restart Analytics client and record session stop
     * @return - A promise ehich resolves to be true if current credential exists
     */
    restart(): Promise<any>;
    /**
     * @private
     * check if current crednetials exists
     */
    private _ensureCredentials();
}
