export type CustomUserAgent = {
	category?: Category;
	framework?: Framework;
};

export enum Category {
	Auth = 'auth',
	API = 'api',
	DataStore = 'datastore',
	Geo = 'geo',
	Interactions = 'interactions',
	Notifications = 'notifications',
	Predictions = 'predictions',
	PubSub = 'pubsub',
	PushNotification = 'pushnotification',
	Storage = 'storage',
}

export enum Framework {
	None = '0',
	ReactNative = '1',
}
