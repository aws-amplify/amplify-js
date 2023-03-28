export type CustomUserAgent = {
	category?: Category;
	action?: CategoryAction;
	framework?: Framework;
};

export enum Category {
	Auth = '1',
	API = '2',
	DataStore = '3',
	Geo = '4',
	Interactions = '5',
	Notifications = '6',
	Predictions = '7',
	PubSub = '8',
	PushNotification = '9',
	Storage = '10',
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
}
