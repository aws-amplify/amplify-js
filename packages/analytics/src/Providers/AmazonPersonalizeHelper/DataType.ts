import { AWS } from '@aws-amplify/core';

interface BasePayload {
    userId: string;
    trackingId: string;
    sessionId: string;
}

export interface RequestParams {
    eventData: EventData;
    sessionInfo: SessionInfo;
    config: any;
    sentAt: number;
    credentials: AWS.Credentials & AWS.CognitoIdentityCredentials;
}

export interface EventData {
    eventType: string;
    properties: any;
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
    properties?: any;
}

export interface RecordEventListPayload extends BasePayload {
    eventList: RecordEventPayload[];
    config?: any;
    credentials?: AWS.Credentials & AWS.CognitoIdentityCredentials;
}
