import * as Observable from 'zen-observable';
import { PubSubProvider, ProvidertOptions } from '../types';
export declare abstract class AbstractPubSubProvider implements PubSubProvider {
	private _config;
	constructor(options?: ProvidertOptions);
	configure(config?: ProvidertOptions): ProvidertOptions;
	getCategory(): string;
	abstract getProviderName(): string;
	protected readonly options: ProvidertOptions;
	abstract newClient(clientOptions: ProvidertOptions): Promise<any>;
	abstract publish(
		topics: string[] | string,
		msg: any,
		options?: ProvidertOptions
	): void;
	abstract subscribe(
		topics: string[] | string,
		options?: ProvidertOptions
	): Observable<any>;
}
