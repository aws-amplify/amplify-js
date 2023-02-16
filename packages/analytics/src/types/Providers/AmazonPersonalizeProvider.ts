export interface PersonalizeAnalyticsEvent {
	eventType?: string;
	userId?: string;
	properties?: {
		[key: string]: string;
	};
}
