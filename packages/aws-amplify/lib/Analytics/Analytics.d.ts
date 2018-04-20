import { AnalyticsProvider, EventAttributes, EventMetrics } from './types';
/**
* Provide mobile analytics client functions
*/
export default class AnalyticsClass {
    private _config;
    private _buffer;
    private _provider;
    private _pluggables;
    private _disabled;
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
    addPluggable(pluggable: AnalyticsProvider): Promise<boolean | object>;
    /**
     * stop sending events
     */
    disable(): void;
    /**
     * start sending events
     */
    enable(): void;
    /**
     * Record Session start
     * @return - A promise which resolves if buffer doesn't overflow
     */
    startSession(): Promise<boolean | void>;
    /**
    * Receive a capsule from Hub
    * @param {any} capsuak - The message from hub
    */
    onHubCapsule(capsule: any): void;
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
    updateEndpoint(config: any): Promise<boolean | void>;
    /**
     * @private
     * @param {Object} params - params for the event recording
     * Send events from buffer
     */
    private _sendFromBuffer(params);
    /**
     * @private
     * @param params - params for the event recording
     * Put events into buffer
     */
    private _putToBuffer(params);
    /**
     * @private
     * check if current credentials exists
     */
    private _getCredentials();
}
