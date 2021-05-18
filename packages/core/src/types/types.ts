import {
	InputLogEvent,
	PutLogEventsCommandOutput,
} from '@aws-sdk/client-cloudwatch-logs';

export interface AmplifyConfig {
	Analytics?: object;
	Auth?: object;
	API?: object;
	Logging?: object;
	Storage?: object;
	Cache?: object;
	ssr?: boolean;
}

export interface ICredentials {
	accessKeyId: string;
	sessionToken: string;
	secretAccessKey: string;
	identityId: string;
	authenticated: boolean;
}

/**
 * @private
 * Internal use of Amplify only
 */

export type DelayFunction = (
	attempt: number,
	args?: any[],
	error?: Error
) => number | false;

export interface LoggingProvider {
	// return the name of you provider
	getProviderName(): string;

	// return the name of you category
	getCategoryName(): string;

	// configure the plugin
	configure(config?: object): object;

	// take logs and push to provider
	pushLogs(logs: InputLogEvent[]): Promise<PutLogEventsCommandOutput>;
}

export interface AWSCloudWatchProviderOptions {
	logGroupName?: string;
	logStreamName?: string;
	region?: string;
}
