export type CustomUserAgent = {
	category?: Category;
	action?: CategoryAction;
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

export enum CategoryAction {
	AuthSignUp = '1',
	AuthSignIn = '2',
	APIQuery = '3',
	DataStoreJitteredRetry = '4',
}

export enum Framework {
	None = '0',
	React = '1',
	ReactNative = '2',
	NodeJS = '3',
}
