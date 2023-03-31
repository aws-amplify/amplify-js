export interface KinesisAnalyticsEvent {
	data: object | string;
	streamName: string;
	partitionKey?: string;
	immediate?: boolean;
}
