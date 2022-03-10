import { InputLogEvent, LogGroup } from '@aws-sdk/client-cloudwatch-logs';
import { Credentials } from '@aws-sdk/types';
import { LOG_TYPE } from '../Logger/ConsoleLogger';
export interface AmplifyConfig {
	Analytics?: object;
	Auth?: object;
	API?: object;
	Logging?: object;
	Storage?: object;
	Cache?: object;
	Geo?: object;
	ssr?: boolean;
}

export interface ICredentials {
	accessKeyId: string;
	sessionToken: string;
	secretAccessKey: string;
	identityId: string;
	authenticated: boolean;
	// Long term creds do not provide an expiration date
	expiration?: Date;
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
	pushLogs?(logs: InputLogEvent[]): void;

	// push a single log event
	pushLog?(log: GenericLogEvent): void;
}

export interface AWSCloudWatchProviderOptions {
	logGroupName?: string;
	logStreamName?: string;
	region?: string;
	credentials?: Credentials;
	endpoint?: string;
}

export interface CloudWatchDataTracker {
	eventUploadInProgress: boolean;
	logEvents: InputLogEvent[];
	verifiedLogGroup?: LogGroup;
}

export interface APILoggingProviderOptions {
	endpoint: string;
	apiKey?: string;
	enabled?: boolean;
	level?: LOG_TYPE;
	excludeClassList?: string[];
	metadata?: { [key: string]: any };
	eventFormat?: EVENT_FORMAT;
	bufferInterval?: number;
}

export enum EVENT_FORMAT {
	GENERIC = 'GENERIC',
	CLOUDWATCH = 'CLOUDWATCH',
}
export interface GenericLogEvent {
	level: string;
	source: string;
	timestamp: number;
	message?: string;
	data?: object;
}
