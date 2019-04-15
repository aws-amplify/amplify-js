import { MLOptions, TranslateTextOptions } from "./types";
import { MLProvider } from "./types/Provider";

import { ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('ML');

export default class ML {
    private _options: MLOptions;

    private _pluggables: MLProvider[];

    /**
     * Initialize PubSub with AWS configurations
     * 
     * @param {PubSubOptions} options - Configuration object for PubSub
     */
    constructor(options: MLOptions) {
        this._options = options;
        logger.debug('ML Options', this._options);
        this._pluggables = [];
    }

    public getModuleName() {
        return 'ML';
    }

     /**
     * add plugin into Storage category
     * @param {Object} pluggable - an instance of the plugin
     */
    public addPluggable(pluggable: MLProvider) {
        if (pluggable && pluggable.getCategory() === 'ML') {
            this._pluggables.push(pluggable);
            let config = {};
            
            config = pluggable.configure(this._options[pluggable.getProviderName()]);
            
            return config;
        }
    }

    /**
     * Get the plugin object
     * @param providerName - the name of the plugin
     */
    public getPluggable(providerName: string) {
        const pluggable = this._pluggables.find(pluggable => pluggable.getProviderName() === providerName);
        if (pluggable === undefined) {
            logger.debug('No plugin found with providerName', providerName);
            return null;
        } else
            return pluggable;
    }

    /**
     * Remove the plugin object
     * @param providerName - the name of the plugin
     */
    public removePluggable(providerName: string) {
        this._pluggables = this._pluggables.filter(pluggable => pluggable.getProviderName() !== providerName);
        return;
    }

    configure(options: MLOptions) {
        const mlConfig = options ? options.ML || options : {};
        this._options = { ...mlConfig, ...options };
        this._pluggables.forEach((pluggable) => {
            pluggable.configure(this._options[pluggable.getProviderName()]);
        });
    }

    translate(options: TranslateTextOptions): Promise<any> {
        const translateProvider = this._pluggables.find(plugin => typeof plugin.execute.translate === "function")
        if (translateProvider) {
            return translateProvider.execute.translate(options);
        }

        throw new Error("Translator not found, did you added a pluggin that supports text translation?");
    }

    imageRecognition(options: object) {
        const imageRecognitionProvider = this._pluggables.find(plugin => typeof plugin.execute.imageRecognition === "function")
        if (imageRecognitionProvider) {
            return imageRecognitionProvider.execute.imageRecognition()
        }

        throw new Error("Image recognizer not found, did you added a pluggin that supports image recongnition?");
    }
}
