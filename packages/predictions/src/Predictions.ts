import {
    PredictionsOptions, TranslateTextInput, TextToSpeechInput, SpeechToTextInput,
    isTranslateTextInput, isTextToSpeechInput, isSpeechToTextInput, ProviderOptions
} from "./types";
import {
    AbstractConvertPredictionsProvider, AbstractIdentifyPredictionsProvider,
    AbstractInterpretPredictionsProvider, AbstractInferPredictionsProvider, AbstractPredictionsProvider
} from "./types/Providers";
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { GraphQLPredictionsProvider } from ".";

const logger = new Logger('Predictions');

export default class Predictions {
    private _options: PredictionsOptions;

    private _convertPluggables: AbstractConvertPredictionsProvider[];
    private _identifyPluggables: AbstractIdentifyPredictionsProvider[];
    private _interpretPluggables: AbstractInterpretPredictionsProvider[];
    private _inferPluggables: AbstractInferPredictionsProvider[];
    private _graphQLPluggables: GraphQLPredictionsProvider[];

    /**
     * Initialize Predictions with AWS configurations
     * @param {PredictionsOptions} options - Configuration object for Predictions
     */
    constructor(options: PredictionsOptions) {
        this._options = options;
        logger.debug('Predictions Options', this._options);
        this._convertPluggables = [];
        this._identifyPluggables = [];
        this._interpretPluggables = [];
        this._inferPluggables = [];
        this._graphQLPluggables = [];
    }

    public getModuleName() {
        return 'Predictions';
    }

    /**
    * add plugin into category Predictions
    * @param {Object} pluggable - an instance of the plugin
    *
    * TODO: Add generic plugins in all pluggables
    */
    public addPluggable(pluggable: AbstractPredictionsProvider) {
        if (this.isConvertPluggable(pluggable)) this._convertPluggables.push(pluggable);
        else if (this.isIdentifyPluggable(pluggable)) this._identifyPluggables.push(pluggable);
        else if (this.isInterpretPluggable(pluggable)) this._interpretPluggables.push(pluggable);
        else if (this.isInferPluggable(pluggable)) this._inferPluggables.push(pluggable);
        else if (this.isGraphQLPluggable(pluggable)) this._graphQLPluggables.push(pluggable);
        else throw new Error("Pluggable being added is not one of the Predictions Category");
        const categoryConfig = Object.assign({}, this._options['Predictions'], this._options[pluggable.getCategory()]);
        return pluggable.configure(categoryConfig);
    }

    /**
     * Get the plugin object
     * @param providerName - the name of the plugin
     */
    public getPluggable(providerName: string): AbstractPredictionsProvider {
        const pluggable = this.getAllProviders().find(pluggable => pluggable.getProviderName() === providerName);
        if (pluggable === undefined) {
            logger.debug('No plugin found with providerName=>', providerName);
            return null;
        } else
            return pluggable;
    }

    /**
     * Remove the plugin object
     * @param providerName - the name of the plugin
     */
    public removePluggable(providerName: string) {
        this._convertPluggables =
            this._convertPluggables.filter(pluggable => pluggable.getProviderName() !== providerName);
        this._identifyPluggables =
            this._identifyPluggables.filter(pluggable => pluggable.getProviderName() !== providerName);
        this._interpretPluggables =
            this._interpretPluggables.filter(pluggable => pluggable.getProviderName() !== providerName);
        this._inferPluggables =
            this._inferPluggables.filter(pluggable => pluggable.getProviderName() !== providerName);
        this._graphQLPluggables =
            this._graphQLPluggables.filter(pluggable => pluggable.getProviderName() !== providerName);
        return;
    }

    configure(options: PredictionsOptions) {
        const predictionsConfig = options ? options.Predictions || options : {};
        this._options = { ...predictionsConfig, ...options };
        logger.debug('configure Predictions', this._options);
        this.getAllProviders().forEach((pluggable) => {
            const categoryConfig = Object.assign({}, this._options['Predictions'], this._options[pluggable.getCategory()]);
            pluggable.configure(categoryConfig);
        });
    }

    public convert<T>(
        input: TranslateTextInput | TextToSpeechInput | SpeechToTextInput | T,
        options: ProviderOptions
    ): Promise<any> {
        const pluggableToExecute = this.getPluggableToExecute(this._convertPluggables, options);
        return pluggableToExecute.convert(input);
    }

    private getPluggableToExecute<T extends AbstractPredictionsProvider>(
        pluggables: T[],
        providerOptions: ProviderOptions
    ): T | GraphQLPredictionsProvider {
        // Give preference to provider name first since it is more specific to this call, even if 
        // there is only one provider configured to error out if the name provided is not the one matched.
        if (providerOptions && providerOptions.providerName) {
            return [...pluggables, ...this._graphQLPluggables]
                .find(pluggable => pluggable.getProviderName() === providerOptions.providerName);
        } else {
            if (pluggables.length === 1) {
                return pluggables[0];
            } else if (pluggables.length === 0 && this._graphQLPluggables.length === 1 /* && should use graphQL */) {
                return this._graphQLPluggables[0];
            } else {
                // throw more meaningful exception here
                throw new Error("More than one or no providers are configured, " +
                    "Either specify a provider name or configure exactly one provider");
            }
        }
    }

    private getAllProviders() {
        return [...this._convertPluggables,
        ...this._identifyPluggables,
        ...this._interpretPluggables,
        ...this._inferPluggables,
        ...this._graphQLPluggables];
    }

    private isConvertPluggable(obj: any): obj is AbstractConvertPredictionsProvider {
        return obj && (obj.getCategory() === "Convert" || obj.getCategory() === "Predictions");
    }

    private isIdentifyPluggable(obj: any): obj is AbstractIdentifyPredictionsProvider {
        return obj && (obj.getCategory() === "Identify" || obj.getCategory() === "Predictions");
    }

    private isInterpretPluggable(obj: any): obj is AbstractInterpretPredictionsProvider {
        return obj && (obj.getCategory() === "Interpret" || obj.getCategory() === "Predictions");
    }

    private isInferPluggable(obj: any): obj is AbstractInferPredictionsProvider {
        return obj && (obj.getCategory() === "Infer" || obj.getCategory() === "Predictions");
    }

    private isGraphQLPluggable(obj: any): obj is GraphQLPredictionsProvider {
        return obj && obj.getCategory() === "GraphQLResolver";
    }
}
