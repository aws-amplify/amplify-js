import * as Observable from 'zen-observable';
import { AbstractPubSubProvider } from './PubSubProvider';
import { ProvidertOptions, SubscriptionObserver } from '../types';
export declare function mqttTopicMatch(filter: string, topic: string): boolean;
export interface MqttProvidertOptions extends ProvidertOptions {
	clientId?: string;
	url?: string;
}
declare class ClientsQueue {
	private promises;
	get(
		clientId: string,
		clientFactory: (string: any) => Promise<any>
	): Promise<any>;
	readonly allClients: string[];
	remove(clientId: any): void;
}
export declare class MqttOverWSProvider extends AbstractPubSubProvider {
	private _clientsQueue;
	constructor(options?: MqttProvidertOptions);
	protected readonly clientId: any;
	protected readonly endpoint: any;
	protected readonly clientsQueue: ClientsQueue;
	protected readonly isSSLEnabled: boolean;
	protected getTopicForValue(value: any): any;
	getProviderName(): string;
	onDisconnect({
		clientId,
		errorCode,
		...args
	}: {
		[x: string]: any;
		clientId: any;
		errorCode: any;
	}): void;
	newClient({ url, clientId }: MqttProvidertOptions): Promise<any>;
	protected connect(
		clientId: string,
		options?: MqttProvidertOptions
	): Promise<any>;
	protected disconnect(clientId: string): Promise<void>;
	publish(topics: string[] | string, msg: any): Promise<void>;
	protected _topicObservers: Map<string, Set<SubscriptionObserver<any>>>;
	protected _clientIdObservers: Map<string, Set<SubscriptionObserver<any>>>;
	private _onMessage;
	subscribe(
		topics: string[] | string,
		options?: MqttProvidertOptions
	): Observable<any>;
}
export {};
