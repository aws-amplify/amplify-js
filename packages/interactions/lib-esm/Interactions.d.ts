import { InteractionsOptions, InteractionsProvider } from './types';
export default class Interactions {
	private _options;
	private _pluggables;
	/**
	 * Initialize PubSub with AWS configurations
	 *
	 * @param {InteractionsOptions} options - Configuration object for Interactions
	 */
	constructor(options: InteractionsOptions);
	getModuleName(): string;
	/**
	 *
	 * @param {InteractionsOptions} options - Configuration object for Interactions
	 * @return {Object} - The current configuration
	 */
	configure(options: InteractionsOptions): InteractionsOptions;
	addPluggable(pluggable: InteractionsProvider): void;
	send(botname: string, message: string | Object): Promise<object>;
	onComplete(
		botname: string,
		callback: (err: any, confirmation: any) => void
	): void;
}
