export interface KinesisAnalyticsEvent {
	data: Blob | string;
	partitionKey: string;
	streamName: string;
}
