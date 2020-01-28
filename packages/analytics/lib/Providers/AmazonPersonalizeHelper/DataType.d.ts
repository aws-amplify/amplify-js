import { AWS } from '@aws-amplify/core';
interface BasePayload {
	userId: string;
	trackingId: string;
	sessionId: string;
}
declare type Config = {
	[key: string]: string | number;
};
declare type Properties = {
	[key: string]: any;
};
export interface RequestParams {
	eventData: EventData;
	sessionInfo: SessionInfo;
	config: Config;
	sentAt: number;
	credentials: AWS.Credentials & AWS.CognitoIdentityCredentials;
}
export interface EventData {
	eventType: string;
	properties: Properties;
}
export interface SessionInfo {
	userId: string;
	trackingId: string;
	sessionId: string;
}
export interface RecordEventPayload {
	eventId: string;
	eventType: string;
	sentAt: number;
	properties?: Properties;
}
export interface RecordEventListPayload extends BasePayload {
	eventList: RecordEventPayload[];
	config?: Config;
	credentials?: AWS.Credentials & AWS.CognitoIdentityCredentials;
}
export {};
