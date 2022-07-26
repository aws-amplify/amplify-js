export interface PersonalizeAnalyticsEvent {
	eventType?: 'Identify' | 'MediaAutoTrack';
	userId?: string;
	properties?: {
		[key: string]: string;
	};
}
