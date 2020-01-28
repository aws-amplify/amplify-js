import { MqttOverWSProvider } from './MqttOverWSProvider';
export declare class AWSIoTProvider extends MqttOverWSProvider {
	protected readonly region: any;
	getProviderName(): string;
	protected readonly endpoint: Promise<string>;
}
