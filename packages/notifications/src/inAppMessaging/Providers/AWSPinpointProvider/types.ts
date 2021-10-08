export type InAppMessageCountMap = Record<string, number>;

export type DailyInAppMessageCounter = {
	count: number;
	lastCountTimestamp: string;
};

export type InAppMessageCounts = {
	sessionCount: number;
	dailyCount: number;
	totalCount: number;
};

export type MetricsComparator = (
	metricsVal: number,
	eventVal: number
) => boolean;

export enum PinpointMessageEvent {
	MESSAGE_DISPLAYED = '_inapp.message_displayed',
	MESSAGE_DISMISSED = '_inapp.message_dismissed',
	MESSAGE_ACTION_TAKEN = '_inapp.message_clicked',
}
