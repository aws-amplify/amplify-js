import { PromiseHandlers } from '../Provider';

export type Event = {
	eventId: string;
	name: string;
	attributes: string;
	metrics: string;
	session: {};
};

export type EventConfig = {
	appId: string;
	endpointId: string;
	region: string;
};

export type EventParams = {
	event: Event;
	timestamp: string;
	config: EventConfig;
	credentials: {};
};

export type EventMap = {
	[key: string]: {
		params: EventParams;
		handlers: PromiseHandlers;
	};
};

export type EventBuffer = Array<EventMap>;

export interface PutEventsResponse {
	EventsResponse: {
		Results: {
			[endpointId: string]: {
				EventsItemResponse: {
					[eventId: string]: {
						StatusCode: number;
						Message: string;
					};
				};
			};
		};
	};
}
