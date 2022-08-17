export interface AWSLexProviderOption {
	name: string;
	alias: string;
	region: string;
	providerName?: string;
	onComplete?(botname: string, callback: (err, confirmation) => void): void;
}

export interface AWSLexProviderOptions {
	[key: string]: AWSLexProviderOption;
}
