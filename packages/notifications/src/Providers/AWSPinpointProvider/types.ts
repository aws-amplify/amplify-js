export type MessageCountMap = Record<string, number>;

export type DailyMessageCounter = {
	count: number;
	lastCountTimestamp: string;
};

export type MessageCounts = {
	sessionCount: number;
	dailyCount: number;
	totalCount: number;
};
