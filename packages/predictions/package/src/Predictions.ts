import {
    PredictionsOptions,
    TranslateTextInput,
    TranslateTextOutput,
    TextToSpeechInput,
    ProviderOptions,
    isTranslateTextInput,
    TextToSpeechOutput,
    SpeechToTextInput,
    SpeechToTextOutput,
    isTextToSpeechInput,
    isSpeechToTextInput,
    IdentifyTextInput,
    IdentifyTextOutput,
    IdentifyLabelsOutput,
    IdentifyLabelsInput,
    IdentifyEntitiesInput,
    IdentifyEntitiesOutput,
    isIdentifyTextInput,
    isIdentifyLabelsInput,
    isIdentifyEntitiesInput,
    InterpretTextOutput,
    InterpretTextInput,
    isInterpretTextInput
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
    * add plugin/pluggable into Predictions category
    * @param {Object} pluggable - an instance of the plugin/pluggable
    **/
    public addPluggable(pluggable: AbstractPredictionsProvider) {
        if (this.getPluggable(pluggable.getProviderName())) {
            throw new Error(`Pluggable with name ${pluggable.getProviderName()} has already been added`);
        }
        if (this.isConvertPluggable(pluggable)) this._convertPluggables.push(pluggable);
        else if (this.isIdentifyPluggable(pluggable)) this._identifyPluggables.push(pluggable);
        else if (this.isInterpretPluggable(pluggable)) this._interpretPluggables.push(pluggable);
        else if (this.isInferPluggable(pluggable)) this._inferPluggables.push(pluggable);
        else if (this.isGraphQLPluggable(pluggable)) this._graphQLPluggables.push(pluggable);
        else if (this.isTopLevelPredictionsPluggable(pluggable)) {
            this._convertPluggables.push(pluggable);
            this._identifyPluggables.push(pluggable);
            this._interpretPluggables.push(pluggable);
            this._inferPluggables.push(pluggable);
        }
        else throw new Error("Pluggable being added is not one of the Predictions Category");
        this.configurePluggable(pluggable);
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

    /**
     * To make both top level providers and category level providers work with same interface and configuration
     * this method duplicates Predictions config into parent level config (for top level provider) and 
     * category level config (such as convert, identify etc) and pass both to each provider.
     */
    configure(options: PredictionsOptions) {
        let predictionsConfig = options ? options.predictions || options : {};
        predictionsConfig = { ...predictionsConfig, ...options };
        this._options = Object.assign({}, this._options, predictionsConfig);
        logger.debug('configure Predictions', this._options);
        this.getAllProviders().forEach(pluggable => this.configurePluggable(pluggable));
    }

    public interpret(input: InterpretTextInput, options?: ProviderOptions): Promise<InterpretTextOutput>;
    public interpret(input: InterpretTextInput, options?: ProviderOptions): Promise<InterpretTextOutput> {
        const pluggableToExecute = this.getPluggableToExecute(this._interpretPluggables, options);
        if (isInterpretTextInput(input)) {
            return pluggableToExecute.interpret(input);
        }
    }

    public convert(input: TranslateTextInput, options?: ProviderOptions): Promise<TranslateTextOutput>;
    public convert(input: TextToSpeechInput, options?: ProviderOptions): Promise<TextToSpeechOutput>;
    public convert(input: SpeechToTextInput, options?: ProviderOptions): Promise<SpeechToTextOutput>;
    public convert(input: TranslateTextInput | TextToSpeechInput | SpeechToTextInput, options?: ProviderOptions):
        Promise<TranslateTextOutput | TextToSpeechOutput | SpeechToTextOutput> {
        const pluggableToExecute = this.getPluggableToExecute(this._convertPluggables, options);
        if (isTranslateTextInput(input)) {
            return pluggableToExecute.convert(input);
        } else if (isTextToSpeechInput(input)) {
            return pluggableToExecute.convert(input);
        } else if (isSpeechToTextInput(input)) {
            return pluggableToExecute.convert(input);
        }
    }

    public identify(input: IdentifyTextInput, options: ProviderOptions): Promise<IdentifyTextOutput>;
    public identify(input: IdentifyLabelsInput, options: ProviderOptions): Promise<IdentifyLabelsOutput>;
    public identify(input: IdentifyEntitiesInput, options: ProviderOptions): Promise<IdentifyEntitiesOutput>;
    public identify(input: IdentifyTextInput | IdentifyLabelsInput | IdentifyEntitiesInput, options: ProviderOptions)
        : Promise<IdentifyTextOutput | IdentifyLabelsOutput | IdentifyEntitiesOutput> {
        const pluggableToExecute = this.getPluggableToExecute(this._identifyPluggables, options);
        if (isIdentifyTextInput(input)) {
            return pluggableToExecute.identify(input);
        } else if (isIdentifyLabelsInput(input)) {
            return pluggableToExecute.identify(input);
        } else if (isIdentifyEntitiesInput(input)) {
            return pluggableToExecute.identify(input);
        }
        return pluggableToExecute.identify(input);
    }

    // tslint:disable-next-line: max-line-length
    private getPluggableToExecute<T extends AbstractPredictionsProvider>(pluggables: T[], providerOptions: ProviderOptions): T | GraphQLPredictionsProvider {
        // Give preference to provider name first since it is more specific to this call, even if 
        // there is only one provider configured to error out if the name provided is not the one matched.
        if (providerOptions && providerOptions.providerName) {
            return [...pluggables, ...this._graphQLPluggables]
                .find(pluggable => pluggable.getProviderName() === providerOptions.providerName);
        } else {
            if (pluggables.length === 1) {
                return pluggables[0];
            } else if (pluggables.length === 0 && this._graphQLPluggables.length === 1) {
                return this._graphQLPluggables[0];
            } else {
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

    private configurePluggable(pluggable: AbstractPredictionsProvider) {
        const categoryConfig = Object.assign(
            {},
            this._options['predictions'], // Parent predictions config for the top level provider
            // this._options[pluggable.getCategory()] // Actual category level config
        );
        pluggable.configure(categoryConfig);
    }

    private isConvertPluggable(obj: any): obj is AbstractConvertPredictionsProvider {
        return obj && (obj.getCategory() === "Convert");
    }

    private isIdentifyPluggable(obj: any): obj is AbstractIdentifyPredictionsProvider {
        return obj && (obj.getCategory() === "Identify");
    }

    private isInterpretPluggable(obj: any): obj is AbstractInterpretPredictionsProvider {
        return obj && (obj.getCategory() === "interpret");
    }

    private isInferPluggable(obj: any): obj is AbstractInferPredictionsProvider {
        return obj && (obj.getCategory() === "Infer");
    }

    private isGraphQLPluggable(obj: any): obj is GraphQLPredictionsProvider {
        return obj && obj.getCategory() === "GraphQLResolver";
    }

    private isTopLevelPredictionsPluggable(obj: any): obj is GraphQLPredictionsProvider {
        return obj && obj.getCategory() === "Predictions";
    }
}
