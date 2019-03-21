interface BasePayload {
    userId: string;
    trackingId: string;
    sessionId: string;
}

export interface RequestParams {
    eventData: any;
    sessionInfo: SessionInfo;
    config: any;
    sentAt: number;
    credentials: any;
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
    credentials?: any;
}
