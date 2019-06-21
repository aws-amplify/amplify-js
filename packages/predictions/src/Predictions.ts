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
        let config = {};
        config = pluggable.configure(this._options[pluggable.getProviderName()]);
        return config;
    }

    /**
     * Get the plugin object
     * @param providerName - the name of the plugin
     */
    public getPluggable(providerName: string) {
        const pluggable = this.getAllProviders().find(pluggable => pluggable.getProviderName() === providerName);
        if (pluggable === undefined) {
            logger.debug('No convert plugin found with providerName', providerName);
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
        return;
    }

    configure(options: PredictionsOptions) {
        logger.debug('configure Predictions', { options });
        const predictionsConfig = options ? options.Predictions || options : {};
        this._options = { ...predictionsConfig, ...options };
        this.getAllProviders().forEach((pluggable) => {
            pluggable.configure(this._options[pluggable.getProviderName()]);
        });
    }

    /**
     * All convert methods' declaration followed by definition
     *
     * public convert(input: TranslateTextInput, options: ProviderOptions): Promise<any>;
     * public convert(input: TextToSpeechInput, options: ProviderOptions): Promise<any>;
     * public convert(input: SpeechToTextInput, options: ProviderOptions): Promise<any>;
     * public convert<T>(input: T, options: ProviderOptions): Promise<any>;
     *
     * We probably don't need method overloading if we are using generics
    **/
    public convert<T>(input: TranslateTextInput | TextToSpeechInput | SpeechToTextInput | T,
                      options: ProviderOptions): Promise<any> {
        const pluggableToExecute = this.getPluggableToExecute(this._convertPluggables, options);
        if (isTranslateTextInput(input)) {
            logger.debug("translateText");
            return pluggableToExecute.translateText(input);
        } else if (isTextToSpeechInput(input)) {
            logger.debug("textToSpeech");
            return pluggableToExecute.convertTextToSpeech(input);
        } else if (isSpeechToTextInput(input)) {
            logger.debug("textToSpeech");
            return pluggableToExecute.convertSpeechToText(input);
        } else {
            // Orchestration type request. Directly call graphql
            // return pluggableToExecute.resolveUsingGraphQL(input);
        }
    }

    private getPluggableToExecute(pluggables: any[], providerOptions: ProviderOptions) {
        // Give preference to provider name first since it is more specific to this call, even if 
        // there is only one provider configured to error out if the name provided is not the one matched.
        if (providerOptions && providerOptions.providerName) {
            return this.getPluggable(providerOptions.providerName);
        } else {
            if (pluggables.length === 1) {
                return pluggables[0];
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
        ...this._inferPluggables];
    }

    private isConvertPluggable(obj: any): obj is AbstractConvertPredictionsProvider {
        return obj && (obj.getCategory() === "Predictions:Convert" || obj.getCategory() === "Predictions");
    }

    private isIdentifyPluggable(obj: any): obj is AbstractIdentifyPredictionsProvider {
        return obj && (obj.getCategory() === "Predictions:Identify" || obj.getCategory() === "Predictions");
    }

    private isInterpretPluggable(obj: any): obj is AbstractInterpretPredictionsProvider {
        return obj && (obj.getCategory() === "Predictions:Interpret" || obj.getCategory() === "Predictions");
    }

    private isInferPluggable(obj: any): obj is AbstractInferPredictionsProvider {
        return obj && (obj.getCategory() === "Predictions:Infer" || obj.getCategory() === "Predictions");
    }

    private isGraphQLPluggable(obj: any): obj is GraphQLPredictionsProvider {
        return obj && obj.getCategory() === "Predictions:GraphQLResolver";
    }
}
