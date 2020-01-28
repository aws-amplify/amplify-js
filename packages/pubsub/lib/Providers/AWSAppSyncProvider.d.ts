import * as Observable from 'zen-observable';
import { MqttOverWSProvider } from './MqttOverWSProvider';
export declare class AWSAppSyncProvider extends MqttOverWSProvider {
	protected readonly endpoint: void;
	getProviderName(): string;
	publish(topics: string[] | string, msg: any, options?: any): Promise<void>;
	private _cleanUp;
	private _cleanUpForTopic;
	onDisconnect({
		clientId,
		errorCode,
		...args
	}: {
		[x: string]: any;
		clientId: any;
		errorCode: any;
	}): void;
	private _topicClient;
	private _topicAlias;
	protected disconnect(clientId: string): Promise<void>;
	subscribe(topics: string[] | string, options?: any): Observable<any>;
}
