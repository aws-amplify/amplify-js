export interface KinesisAnalyticsEvent {
	data: object | string;
	partitionKey: string;
	streamName: string;
}
