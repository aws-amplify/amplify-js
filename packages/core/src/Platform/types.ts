export enum Framework {
	None = '0',
	ReactNative = '1',
}

export enum Category {
	API = 'api',
	Auth = 'auth',
	DataStore = 'datastore',
	Geo = 'geo',
	Interactions = 'interactions',
	Notifications = 'notifications',
	Predictions = 'predictions',
	PubSub = 'pubsub',
	PushNotification = 'pushnotification',
	Storage = 'storage',
}

// Actions
/* TODO: Replace 'None' with all expected Actions */
export enum ApiAction {
	None = '0',
}
export enum AuthAction {
	None = '0',
}
export enum DataStoreAction {
	None = '0',
}
export enum GeoAction {
	None = '0',
}
export enum InteractionsAction {
	None = '0',
}
export enum NotificationsAction {
	None = '0',
}
export enum PredictionsAction {
	None = '0',
}
export enum PubSubAction {
	None = '0',
}
export enum PushNotificationAction {
	None = '0',
}
export enum StorageAction {
	None = '0',
}

type ActionMap = {
	[Category.Auth]: AuthAction;
	[Category.API]: ApiAction;
	[Category.DataStore]: DataStoreAction;
	[Category.Geo]: GeoAction;
	[Category.Interactions]: InteractionsAction;
	[Category.Notifications]: NotificationsAction;
	[Category.Predictions]: PredictionsAction;
	[Category.PubSub]: PubSubAction;
	[Category.PushNotification]: PushNotificationAction;
	[Category.Storage]: StorageAction;
};

type UserAgentDetailsWithCategory<T extends Category> =
	CustomUserAgentDetailsBase & {
		category: T;
		action: T extends keyof ActionMap ? ActionMap[T] : never;
	};

type CustomUserAgentDetailsBase = {
	framework?: Framework;
};

export type CustomUserAgentDetails =
	| (CustomUserAgentDetailsBase & { category?: never; action?: never })
	| UserAgentDetailsWithCategory<Category.API>
	| UserAgentDetailsWithCategory<Category.Auth>
	| UserAgentDetailsWithCategory<Category.DataStore>
	| UserAgentDetailsWithCategory<Category.Geo>
	| UserAgentDetailsWithCategory<Category.Interactions>
	| UserAgentDetailsWithCategory<Category.Notifications>
	| UserAgentDetailsWithCategory<Category.Predictions>
	| UserAgentDetailsWithCategory<Category.PubSub>
	| UserAgentDetailsWithCategory<Category.PushNotification>
	| UserAgentDetailsWithCategory<Category.Storage>;
