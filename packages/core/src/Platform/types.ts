export type CustomUserAgent = {
	category?: Category;
	action?: CategoryAction;
	framework?: Framework;
};

export enum Category {
	Auth = '1:1',
	API = '1:2',
	DataStore = '1:3',
	Geo = '1:4',
	Interactions = '1:5',
	Notifications = '1:6',
	Predictions = '1:7',
	PubSub = '1:8',
	PushNotification = '1:9',
	Storage = '1:10',
}

export enum CategoryAction {
	AuthSignUp = '2:1',
	AuthSignIn = '2:2',
	APIQuery = '2:3',
	DataStoreJitteredRetry = '2:4',
}

export enum Framework {
	None = '4:0',
	React = '4:1',
}
