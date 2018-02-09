import { EventAttributes, EventMetrics } from './types';
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
    addPluggable(pluggable: any): void;
    /**
     * Record Session start
     * @return - A promise which resolves if event record successfully
     */
    startSession(): Promise<boolean | void>;
    /**
     * Record Session stop
     * @return - A promise which resolves if event record successfully
     */
    stopSession(): Promise<boolean | void>;
    /**
     * Record one analytic event and send it to Pinpoint
     * @param {String} name - The name of the event
     * @param {Object} [attributs] - Attributes of the event
     * @param {Object} [metrics] - Event metrics
     * @return - A promise which resolves if event record successfully
     */
    record(eventName: string, attributes?: EventAttributes, metrics?: EventMetrics): Promise<boolean | void>;
    private _sendFromBuffer(params);
    private _putToCache(params);
    /**
     * @private
     * check if current crednetials exists
     */
    private _getCredentials();
}
