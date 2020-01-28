export interface InteractionsOptions {
	[key: string]: any;
}
export interface InteractionsMessage {
	content: string | Object;
	options: {
		[key: string]: string;
	};
}
